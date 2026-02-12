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

  // Actions
  initializeCart: () => Promise<void>;
  addItem: (product: any, quantity: number, variantId?: string) => Promise<void>;
  updateItem: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
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

      initializeCart: async () => {
        try {
          const cartId = get().cartId;

          if (cartId) {
            // Try to retrieve existing cart
            try {
              const cart = await sdk.store.cart.retrieve(cartId);
              if (cart) {
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
          const newCart = await sdk.store.cart.create({});
          set({ cartId: newCart.id, isLoading: false });
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

          const cart = await sdk.store.cart.retrieve(cartId);

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
        } catch (error) {
          console.error('Failed to refresh cart:', error);
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
      }),
    }
  )
);
