'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { IconShoppingCart } from '@tabler/icons-react';
import {
  Anchor,
  Box,
  Breadcrumbs,
  Button,
  Card,
  Container,
  Divider,
  Grid,
  Group,
  Loader,
  SimpleGrid,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import { CartItem } from '../../components/CartItem/CartItem';
import { sdk } from '../../stores/lib/sdk';
import { formatAmount } from '../../utils/formatters';

interface CartItemType {
  id: string;
  title: string;
  price: number;
  originalPrice?: number;
  image: string;
  quantity: number;
  variant?: string;
  variant_id?: string;
  product_id?: string;
}

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItemType[]>([]);
  const [loading, setLoading] = useState(true);
  const [subtotal, setSubtotal] = useState(0);
  const [shipping, setShipping] = useState(0);
  const [tax, setTax] = useState(0);
  const [total, setTotal] = useState(0);
  const [itemOrder, setItemOrder] = useState<string[]>([]);
  const fetchCart = async () => {
    try {
      const cartId = localStorage.getItem('cart_id');
      if (!cartId) {
        setLoading(false);
        return;
      }

      const { cart } = await sdk.store.cart.retrieve(cartId);

      if (cart && cart.items) {
        const items: CartItemType[] = cart.items.map((item: any) => {
          const originalPrice =
            item.original_unit_price ||
            item.variant?.calculated_price?.original_amount ||
            item.variant?.original_price;
          return {
            id: item.id,
            title: item.title || item.product?.title || 'Product',
            price: item.unit_price || 0, // XAF doesn't use cents
            originalPrice:
              originalPrice && originalPrice > item.unit_price ? originalPrice : undefined,
            image: item.thumbnail || item.product?.thumbnail || '',
            quantity: item.quantity,
            variant: item.variant?.title,
            variant_id: item.variant_id,
            product_id: item.product_id || item.variant?.product_id,
          };
        });

        // Initialize or maintain item order
        setItemOrder(prev => {
          const newOrder = items.map(item => item.id);
          if (prev.length === 0) {
            return newOrder;
          }
          // Maintain existing order, add new items at the end
          const orderedItems = prev
            .filter(id => newOrder.includes(id))
            .concat(newOrder.filter(id => !prev.includes(id)));
          return orderedItems;
        });

        setCartItems(items);
        setSubtotal(cart.subtotal || 0);
        setShipping(cart.shipping_total || 0);
        setTax(cart.tax_total || 0);
        setTotal(cart.total || 0);
      }
    } catch (error) {
      console.error('Failed to fetch cart:', error);
    } finally {
      setLoading(false);
    }
  };
  // Fetch cart data
  useEffect(() => {
    fetchCart();
  }, []);

  const handleQuantityChange = async (id: string, quantity: number) => {
    try {
      const cartId = localStorage.getItem('cart_id');
      if (!cartId) return;

      // Find the current item to calculate the quantity change
      const currentItem = cartItems.find(item => item.id === id);
      const quantityChange = currentItem ? quantity - currentItem.quantity : quantity;

      const { cart } = await sdk.store.cart.updateLineItem(cartId, id, {
        quantity: Math.max(1, quantity),
      });

      // Trigger custom event to update cart badge in header
      window.dispatchEvent(new CustomEvent('cart-update'));

      // Update local state
      if (cart && cart.items) {
        const items: CartItemType[] = cart.items.map((item: any) => ({
          id: item.id,
          title: item.title || item.product?.title || 'Product',
          price: item.unit_price || 0,
          originalPrice:
            item.original_unit_price && item.original_unit_price > item.unit_price
              ? item.original_unit_price
              : undefined,
          image: item.thumbnail || item.product?.thumbnail || '',
          quantity: item.quantity,
          variant: item.variant?.title,
          variant_id: item.variant_id,
          product_id: item.product_id || item.variant?.product_id,
        }));

        // Sort items according to the stored order
        const sortedItems = items.sort((a, b) => {
          const indexA = itemOrder.indexOf(a.id);
          const indexB = itemOrder.indexOf(b.id);
          return indexA - indexB;
        });

        setCartItems(sortedItems);
        setSubtotal(cart.subtotal || 0);
        setShipping(cart.shipping_total || 0);
        setTax(cart.tax_total || 0);
        setTotal(cart.total || 0);
      }
    } catch (error) {
      console.error('Failed to update quantity:', error);
    }
  };

  const handleRemoveItem = async (id: string) => {
    try {
      const cartId = localStorage.getItem('cart_id');
      if (!cartId) return;

      await sdk.store.cart.deleteLineItem(cartId, id);
      window.dispatchEvent(new CustomEvent('cart-update'));
      await fetchCart();
    } catch (error) {
      console.error('Failed to remove item:', error);
    }
  };

  const breadcrumbItems = [
    { title: 'Home', href: '/' },
    { title: 'Cart', href: '/cart' },
  ].map((item, index) => (
    <Anchor component={Link} href={item.href} key={index} size="sm">
      {item.title}
    </Anchor>
  ));

  if (loading) {
    return (
      <Container size="xl" py="xl">
        <Stack gap="lg" align="center">
          <Loader size="lg" />
          <Text>Loading cart...</Text>
        </Stack>
      </Container>
    );
  }

  if (cartItems.length === 0) {
    return (
      <Container size="xl" py="xl">
        <Stack gap="lg" align="center" ta="center">
          <IconShoppingCart size={64} color="var(--mantine-color-gray-4)" />
          <Title order={2}>Your cart is empty</Title>
          <Text size="lg" c="dimmed">
            Looks like you haven't added any items to your cart yet.
          </Text>
          <Button component={Link} href="/products" size="lg" color="purple">
            Continue Shopping
          </Button>
        </Stack>
      </Container>
    );
  }

  return (
    <Container size="xl" pt={0} pb={{ base: 100, lg: 'md' }} px="md">
      <Stack gap="lg">
        {/* Breadcrumbs */}
        <Breadcrumbs>{breadcrumbItems}</Breadcrumbs>

        <Title order={1}>Shopping Cart</Title>

        <Grid>
          {/* Cart Items - 1 col on mobile for better card layout, 2–3 on larger */}
          <Grid.Col span={{ base: 12, lg: 9 }}>
            <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
              {cartItems.map((item) => (
                <CartItem
                  key={item.id}
                  {...item}
                  onQuantityChange={(quantity) => handleQuantityChange(item.id, quantity)}
                  onRemove={() => handleRemoveItem(item.id)}
                />
              ))}
            </SimpleGrid>
          </Grid.Col>

          {/* Desktop Order Summary */}
          <Grid.Col span={{ base: 12, lg: 3 }} visibleFrom="lg">
            <Card padding="lg" radius="md" withBorder>
              <Stack gap="md">
                <Title order={3}>Order Summary</Title>

                <Divider />

                <Stack gap="xs">
                  <Group justify="space-between">
                    <Text>Subtotal ({cartItems.length} items)</Text>
                    <Text>{formatAmount(subtotal)}</Text>
                  </Group>

                  <Group justify="space-between">
                    <Text>Shipping</Text>
                    <Text c={shipping === 0 ? 'green' : undefined}>
                      {shipping === 0 ? 'FREE' : formatAmount(shipping)}
                    </Text>
                  </Group>

                  <Group justify="space-between">
                    <Text>Tax</Text>
                    <Text>{formatAmount(tax)}</Text>
                  </Group>
                </Stack>

                <Divider />

                <Group justify="space-between">
                  <Text fw={600} size="lg">
                    Total
                  </Text>
                  <Text fw={600} size="lg" c="purple">
                    {formatAmount(total)}
                  </Text>
                </Group>

                <Button
                  component={Link}
                  href="/checkout"
                  size="lg"
                  color="purple"
                  fullWidth
                  mt="md"
                >
                  Proceed to Checkout
                </Button>

                <Text size="sm" c="dimmed" ta="center">
                  Secure checkout powered by SSL encryption
                </Text>
              </Stack>
            </Card>

            {/* Free Shipping Banner */}
            {subtotal < 50 && (
              <Card
                padding="md"
                radius="md"
                mt="md"
                style={{ backgroundColor: 'var(--mantine-color-purple-0)' }}
              >
                <Group gap="sm">
                  <Box
                    w={40}
                    h={40}
                    style={{
                      backgroundColor: 'var(--mantine-color-purple-6)',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <IconShoppingCart size={20} color="white" />
                  </Box>
                  <div>
                    <Text fw={600}>Add {formatAmount(50 - subtotal)} more</Text>
                    <Text size="sm">to get FREE shipping!</Text>
                  </div>
                </Group>
              </Card>
            )}
          </Grid.Col>
        </Grid>
      </Stack>

      {/* Mobile Order Summary - Sticky at bottom */}
      <Box
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: 'white',
          borderTop: '1px solid var(--mantine-color-gray-3)',
          padding: '16px',
          zIndex: 1000,
        }}
        hiddenFrom="lg"
      >
        <Group justify="space-between" mb="sm">
          <Text fw={600}>Total</Text>
          <Text fw={600} c="purple">
            {formatAmount(total)}
          </Text>
        </Group>
        <Button component={Link} href="/checkout" size="lg" color="purple" fullWidth>
          Proceed to Checkout
        </Button>
      </Box>
    </Container>
  );
}
