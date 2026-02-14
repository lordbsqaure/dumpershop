import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { sdk } from './lib/sdk';

interface CartItem {
  id: string;
  title: string;
  price: number;
  image: string;
  quantity: number;
  variant?: string;
  variant_id?: string;
  product_id: string;
}

interface CartState {
  items: CartItem[];
  cartId: string | null;
  isLoading: boolean;
  total: number;
  subtotal: number;
  shipping: number;
  tax: number;
  userId: string | null; // Track current user ID
  savedCart: { [userId: string]: { items: CartItem[]; cartId: string | null } }; // Store saved carts per user

  // Actions
  initializeCart: () => Promise<void>;
  addItem: (product: any, quantity: number, variantId?: string) => Promise<void>;
  updateItem: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
  /** Sync cartId from localStorage (e.g. after add from ProductCard) and refresh from server. */
  syncFromStorage: () => Promise<void>;
  setUser: (userId: string | null) => void;
  /** Call after login when user may have a saved cart; restores from server or re-adds saved items if cart is gone. */
  restoreCartAfterLogin: () => Promise<void>;
  restoreSavedItemsToNewCart: (savedItems: CartItem[]) => Promise<void>;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      cartId: null,
      isLoading: false,
      total: 0,
      subtotal: 0,
      shipping: 0,
      tax: 0,
      userId: null, // Initialize userId as null
      savedCart: {}, // Initialize saved cart storage

      setUser: (userId: string | null) => {
        const currentUserId = get().userId;
        const currentItems = get().items;
        const currentCartId = get().cartId;

        // If user is logging out, save current cart and clear
        if (currentUserId && !userId) {
          set((state) => ({
            savedCart: {
              ...state.savedCart,
              [currentUserId]: { items: currentItems, cartId: currentCartId }
            },
            userId: null,
            items: [],
            cartId: null,
            subtotal: 0,
            total: 0,
            shipping: 0,
            tax: 0,
          }));
          if (typeof window !== 'undefined') {
            localStorage.removeItem('cart_id');
            window.dispatchEvent(new Event('cart-update'));
          }
          return;
        }

        // If user is logging in, restore their saved cart
        if (!currentUserId && userId) {
          const savedCart = get().savedCart[userId];
          if (savedCart) {
            set({
              userId,
              items: savedCart.items,
              cartId: savedCart.cartId,
              subtotal: savedCart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0),
              total: savedCart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0),
              shipping: 0,
              tax: 0,
            });
            if (typeof window !== 'undefined') {
              if (savedCart.cartId) localStorage.setItem('cart_id', savedCart.cartId);
              else localStorage.removeItem('cart_id');
            }
            // Auth store will call restoreCartAfterLogin() after setUser to sync with server or re-add saved items
          } else {
            set({
              userId,
              items: [],
              cartId: null,
              subtotal: 0,
              total: 0,
              shipping: 0,
              tax: 0,
            });
            // Initialize new cart for user
            get().initializeCart();
          }
        }
      },

      initializeCart: async () => {
        try {
          const cartId = get().cartId;

          if (cartId) {
            // Try to retrieve existing cart
            try {
              const res = await sdk.store.cart.retrieve(cartId);
              const cart = (res as any)?.cart ?? res;
              if (cart?.id) {
                const items =
                  cart.items?.map((item: any) => ({
                    id: item.id,
                    title: item.title || item.product?.title || 'Product',
                    price: item.unit_price || 0,
                    image: item.thumbnail || item.product?.thumbnail || '',
                    quantity: item.quantity,
                    variant_id: item.variant_id,
                    product_id: item.product_id || item.variant?.product_id,
                  })) || [];

                set({
                  items,
                  subtotal: cart.subtotal || 0,
                  total: cart.total || 0,
                  shipping: cart.shipping_total || 0,
                  tax: cart.tax_total || 0,
                });
                return;
              }
            } catch (error) {
              console.error('Failed to retrieve cart:', error);
            }
          }

          // Create new cart if none exists
          const regions = await sdk.store.region.list();
          const regionId = (regions as any).regions?.[0]?.id;
          const newCart = await sdk.store.cart.create(regionId ? { region_id: regionId } : {});
          const cid = (newCart as any)?.id ?? (newCart as any)?.cart?.id;
          set({ cartId: cid ?? null, isLoading: false });
          if (typeof window !== 'undefined' && cid) localStorage.setItem('cart_id', cid);
        } catch (error) {
          console.error('Failed to initialize cart:', error);
          set({ isLoading: false });
        }
      },

      addItem: async (product: any, quantity: number, variantId?: string) => {
        set({ isLoading: true });
        try {
          let cartId = get().cartId;

          // Initialize cart if it doesn't exist
          if (!cartId) {
            try {
              console.log('Creating new cart...');
              // Get region ID
              const regions = await sdk.store.region.list();
              const regionId = regions.regions?.[0]?.id;

              const newCart = await sdk.store.cart.create({
                region_id: regionId,
              });
              console.log('Cart created:', newCart);
              cartId = newCart.id;
              set({ cartId });
              if (typeof window !== 'undefined') localStorage.setItem('cart_id', cartId);
            } catch (error) {
              console.error('Failed to create cart:', error);
              set({ isLoading: false });
              throw new Error('Failed to create cart');
            }
          }

          // Determine which variant to use
          const selectedVariantId = variantId || product.variants?.[0]?.id;

          if (!selectedVariantId) {
            throw new Error('No variant available for this product');
          }

          if (!cartId) {
            throw new Error('Failed to initialize cart');
          }

          // Add item to cart
          const updatedCart = await sdk.store.cart.createLineItem(cartId, {
            variant_id: selectedVariantId,
            quantity,
          });

          // Update state with new cart data
          const items =
            updatedCart.items?.map((item: any) => ({
              id: item.id,
              title: item.title || item.product?.title || product.title,
              price: item.unit_price || product.price || 0,
              image: item.thumbnail || item.product?.thumbnail || product.image || '',
              quantity: item.quantity,
              variant_id: item.variant_id,
              product_id: item.product_id || item.variant?.product_id || product.id,
            })) || [];

          set({
            items,
            subtotal: updatedCart.subtotal || 0,
            total: updatedCart.total || 0,
            shipping: updatedCart.shipping_total || 0,
            tax: updatedCart.tax_total || 0,
            isLoading: false,
          });

          // Show success notification
          console.log('Item added to cart successfully');
        } catch (error) {
          console.error('Failed to add item to cart:', error);
          set({ isLoading: false });
          throw error;
        }
      },

      updateItem: async (itemId: string, quantity: number) => {
        set({ isLoading: true });
        try {
          const cartId = get().cartId;
          if (!cartId) throw new Error('No cart found');

          const updatedCart = await sdk.store.cart.updateLineItem(cartId, itemId, {
            quantity,
          });

          const items =
            updatedCart.items?.map((item: any) => ({
              id: item.id,
              title: item.title || item.product?.title || 'Product',
              price: item.unit_price || 0,
              image: item.thumbnail || item.product?.thumbnail || '',
              quantity: item.quantity,
              variant_id: item.variant_id,
              product_id: item.product_id || item.variant?.product_id,
            })) || [];

          set({
            items,
            subtotal: updatedCart.subtotal || 0,
            total: updatedCart.total || 0,
            shipping: updatedCart.shipping_total || 0,
            tax: updatedCart.tax_total || 0,
            isLoading: false,
          });
        } catch (error) {
          console.error('Failed to update item:', error);
          set({ isLoading: false });
          throw error;
        }
      },

      removeItem: async (itemId: string) => {
        set({ isLoading: true });
        try {
          const cartId = get().cartId;
          if (!cartId) throw new Error('No cart found');

          const updatedCart = await sdk.store.cart.deleteLineItem(cartId, itemId);

          const items =
            updatedCart.items?.map((item: any) => ({
              id: item.id,
              title: item.title || item.product?.title || 'Product',
              price: item.unit_price || 0,
              image: item.thumbnail || item.product?.thumbnail || '',
              quantity: item.quantity,
              variant_id: item.variant_id,
              product_id: item.product_id || item.variant?.product_id,
            })) || [];

          set({
            items,
            subtotal: updatedCart.subtotal || 0,
            total: updatedCart.total || 0,
            shipping: updatedCart.shipping_total || 0,
            tax: updatedCart.tax_total || 0,
            isLoading: false,
          });
        } catch (error) {
          console.error('Failed to remove item:', error);
          set({ isLoading: false });
          throw error;
        }
      },

      clearCart: async () => {
        set({ isLoading: true });
        try {
          const cartId = get().cartId;
          if (cartId) {
            // Delete all items from cart
            const items = get().items;
            for (const item of items) {
              await sdk.store.cart.deleteLineItem(cartId, item.id);
            }
          }

          set({
            items: [],
            subtotal: 0,
            total: 0,
            shipping: 0,
            tax: 0,
            isLoading: false,
          });
        } catch (error) {
          console.error('Failed to clear cart:', error);
          set({ isLoading: false });
          throw error;
        }
      },

      refreshCart: async () => {
        try {
          const cartId = get().cartId;
          if (!cartId) return;

          const res = await sdk.store.cart.retrieve(cartId);
          const cart = (res as any)?.cart ?? res;
          if (!cart) return;

          const items =
            cart.items?.map((item: any) => ({
              id: item.id,
              title: item.title || item.product?.title || 'Product',
              price: item.unit_price ?? 0,
              image: item.thumbnail || item.product?.thumbnail || '',
              quantity: item.quantity,
              variant_id: item.variant_id,
              product_id: item.product_id || item.variant?.product_id,
            })) || [];

          set({
            items,
            subtotal: cart.subtotal ?? 0,
            total: cart.total ?? 0,
            shipping: cart.shipping_total ?? 0,
            tax: cart.tax_total ?? 0,
          });
        } catch (error) {
          console.error('Failed to refresh cart:', error);
          throw error;
        }
      },

      syncFromStorage: async () => {
        if (typeof window === 'undefined') return;
        const id = localStorage.getItem('cart_id');
        if (!id) return;
        set({ cartId: id });
        try {
          await get().refreshCart();
        } catch (e) {
          // ignore
        }
      },

      restoreCartAfterLogin: async () => {
        const savedItems = [...(get().items || [])];
        const hadSavedItems = savedItems.length > 0;
        try {
          await get().refreshCart();
        } catch {
          if (hadSavedItems) await get().restoreSavedItemsToNewCart(savedItems);
          return;
        }
        const currentItems = get().items || [];
        if (hadSavedItems && currentItems.length === 0) {
          await get().restoreSavedItemsToNewCart(savedItems);
        }
      },

      restoreSavedItemsToNewCart: async (savedItems: CartItem[]) => {
        const itemsWithVariant = savedItems.filter((i) => i.variant_id);
        if (itemsWithVariant.length === 0) return;
        set({ isLoading: true });
        try {
          const regions = await sdk.store.region.list();
          const regionId = (regions as any).regions?.[0]?.id;
          const newCart = await sdk.store.cart.create(regionId ? { region_id: regionId } : {});
          const cartId = (newCart as any)?.id ?? (newCart as any)?.cart?.id;
          if (!cartId) throw new Error('Failed to create cart');
          set({ cartId });
          if (typeof window !== 'undefined') localStorage.setItem('cart_id', cartId);
          let lastCart: any = newCart;
          for (const item of itemsWithVariant) {
            lastCart = await sdk.store.cart.createLineItem(cartId, {
              variant_id: item.variant_id!,
              quantity: item.quantity,
            });
          }
          const cart = (lastCart as any)?.cart ?? lastCart;
          const items =
            cart?.items?.map((item: any) => ({
              id: item.id,
              title: item.title || item.product?.title || 'Product',
              price: item.unit_price ?? 0,
              image: item.thumbnail || item.product?.thumbnail || '',
              quantity: item.quantity,
              variant_id: item.variant_id,
              product_id: item.product_id || item.variant?.product_id,
            })) || [];
          set({
            items,
            subtotal: cart?.subtotal ?? 0,
            total: cart?.total ?? 0,
            shipping: cart?.shipping_total ?? 0,
            tax: cart?.tax_total ?? 0,
            isLoading: false,
          });
        } catch (error) {
          console.error('Failed to restore saved cart:', error);
          set({ isLoading: false });
        }
      },
    }),
    {
      name: 'cart-storage',
      partialize: (state) => ({ 
        cartId: state.cartId,
        items: state.items,
        subtotal: state.subtotal,
        total: state.total,
        shipping: state.shipping,
        tax: state.tax,
        userId: state.userId,
        savedCart: state.savedCart,
      }),
    }
  )
);
