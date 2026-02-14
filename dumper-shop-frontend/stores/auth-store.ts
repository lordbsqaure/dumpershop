import { create } from 'zustand';
import { sdk } from './lib/sdk';
import { useCartStore } from './cart-store';

interface User {
  id: string;
  email?: string;
  phone?: string;
  first_name: string;
  last_name: string;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (phone: string, password: string) => Promise<void>;
  register: (data: {
    phone: string;
    password: string;
    first_name: string;
    last_name: string;
    email?: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

// Helper function to convert phone to email format
export const phoneToEmail = (phone: string): string => {
  // Remove calling code if present (e.g., +237)
  const cleanPhone = phone.replace(/^\+\d{1,3}/, '');
  return `${cleanPhone}@gmail.com`;
};

// Helper functions for localStorage management
const USER_CACHE_KEY = 'user_cache';
const AUTH_STATE_KEY = 'auth_state';

const saveUserToCache = (user: User) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(USER_CACHE_KEY, JSON.stringify(user));
    localStorage.setItem(AUTH_STATE_KEY, JSON.stringify({ isAuthenticated: true, timestamp: Date.now() }));
  }
};

const getUserFromCache = (): User | null => {
  if (typeof window !== 'undefined') {
    const cached = localStorage.getItem(USER_CACHE_KEY);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        // Validate that the parsed object has the required User properties
        if (
          parsed &&
          typeof parsed === 'object' &&
          'id' in parsed &&
          'first_name' in parsed &&
          'last_name' in parsed
        ) {
          return parsed as User;
        }
      } catch (e) {
        console.error('Error parsing user cache:', e);
        localStorage.removeItem(USER_CACHE_KEY);
      }
    }
  }
  return null;
};

const getAuthStateFromCache = (): { isAuthenticated: boolean } | null => {
  if (typeof window !== 'undefined') {
    const cached = localStorage.getItem(AUTH_STATE_KEY);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        return parsed;
      } catch (e) {
        console.error('Error parsing auth state:', e);
        localStorage.removeItem(AUTH_STATE_KEY);
      }
    }
  }
  return null;
};

const clearAuthCache = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(USER_CACHE_KEY);
    localStorage.removeItem(AUTH_STATE_KEY);
  }
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: getUserFromCache(),
  isLoading: false,
  isAuthenticated: !!getAuthStateFromCache()?.isAuthenticated,

  login: async (phone: string, password: string) => {
    set({ isLoading: true });
    try {
      // Authenticate with phone number (using phone as email for Medusa)
      await sdk.auth.login('customer', 'emailpass', {
        email: phoneToEmail(phone),
        password,
      });

      // After successful authentication, retrieve customer data
      const { customer } = await sdk.store.customer.retrieve();

      if (customer) {
        const userData: User = {
          id: customer.id,
          email: customer.email,
          phone: customer.phone || phone,
          first_name: customer.first_name || '',
          last_name: customer.last_name || '',
        };

        // Cache user data and auth state
        saveUserToCache(userData);

        set({
          user: userData,
          isAuthenticated: true,
          isLoading: false,
        });

        // Restore cart for this user (from saved cart or server)
        useCartStore.getState().setUser(userData.id);
        await useCartStore.getState().restoreCartAfterLogin();
      } else {
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });
      }
    } catch (error) {
      console.error('Login failed:', error);
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
      throw error;
    }
  },

  register: async (data) => {
    set({ isLoading: true });
    try {
      // Use the provided email address, or convert phone to email if not provided
      const email = data.email || phoneToEmail(data.phone);

      // First, get a registration token
      const token = await sdk.auth.register('customer', 'emailpass', {
        email: email,
        password: data.password,
      });

      // Then, create the customer with the stored token
      const { customer } = await sdk.store.customer.create(
        {
          email: email,
          first_name: data.first_name,
          last_name: data.last_name,
          phone: data.phone,
        },
        {},
        { Authorization: `Bearer ${token}` }
      );

      // After registration, automatically login to get a proper auth token
      await sdk.auth.login('customer', 'emailpass', {
        email: email,
        password: data.password,
      });

      // Retrieve the customer data after login
      const { customer: retrievedCustomer } = await sdk.store.customer.retrieve();

      let userData: User;
      if (retrievedCustomer) {
        userData = {
          id: retrievedCustomer.id,
          email: retrievedCustomer.email,
          phone: retrievedCustomer.phone || data.phone,
          first_name: retrievedCustomer.first_name,
          last_name: retrievedCustomer.last_name,
        };
      } else {
        // Fallback to the created customer if retrieve fails
        userData = {
          id: customer.id,
          email: customer.email,
          phone: customer.phone || data.phone,
          first_name: customer.first_name,
          last_name: customer.last_name,
        };
      }

      // Cache user data and auth state
      saveUserToCache(userData);

      set({
        user: userData,
        isAuthenticated: true,
        isLoading: false,
      });

      useCartStore.getState().setUser(userData.id);
      await useCartStore.getState().restoreCartAfterLogin();
    } catch (error) {
      console.error('Registration failed:', error);
      set({ isLoading: false });
      throw error;
    }
  },

  logout: async () => {
    // Save current cart for this user and clear cart state (so UI shows empty)
    useCartStore.getState().setUser(null);
    try {
      await sdk.auth.logout();
    } catch (error) {
      console.error('SDK logout failed:', error);
    }
    clearAuthCache();
    set({
      user: null,
      isAuthenticated: false,
    });
  },

  checkAuth: async () => {
    set({ isLoading: true });

    // First, check cache for existing auth data
    const cachedAuthState = getAuthStateFromCache();
    const cachedUser = getUserFromCache();

    if (cachedAuthState?.isAuthenticated && cachedUser) {
      // Use cached data if valid
      set({
        user: cachedUser,
        isAuthenticated: true,
        isLoading: false,
      });
      return;
    }

    // If no valid cache, try to retrieve from server
    try {
      const { customer } = await sdk.store.customer.retrieve();

      if (customer) {
        const userData: User = {
          id: customer.id,
          email: customer.email,
          phone: customer.phone,
          first_name: customer.first_name,
          last_name: customer.last_name,
        };

        // Cache user data and auth state
        saveUserToCache(userData);

        set({
          user: userData,
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },
}));
