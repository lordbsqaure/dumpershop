'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { IconCheck, IconCreditCard, IconTruck } from '@tabler/icons-react';
import {
  Alert,
  Anchor,
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
import { listPaymentProviders } from '@/utils/payment';
import { CheckoutData, CheckoutForm } from '../../components/CheckoutForm/CheckoutForm';
import { sdk } from '../../stores/lib/sdk';
import { formatAmount } from '../../utils/formatters';
import { currentRegionId } from '../../utils/Region';
import { useAuthStore } from '@/stores/auth-store';

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

const steps = [
  { id: 'shipping', title: 'Shipping', icon: IconTruck },
  { id: 'confirmation', title: 'Confirmation', icon: IconCheck },
];

export default function CheckoutPage() {
  const router = useRouter();
  const { isAuthenticated, register } = useAuthStore();
  const [currentStep, setCurrentStep] = useState('shipping');
  const [loading, setLoading] = useState(false);
  const [cartLoading, setCartLoading] = useState(true);
  const [cartItems, setCartItems] = useState<CartItemType[]>([]);
  const [cartId, setCartId] = useState<string | null>(null);
  const [subtotal, setSubtotal] = useState(0);
  const [shipping, setShipping] = useState(0);
  const [tax, setTax] = useState(0);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [paymentProviders, setPaymentProviders] = useState<any[]>([]);

  // Fetch cart data on mount
  useEffect(() => {
    const fetchCart = async () => {
      try {
        // Fetch available payment providers
        const providers = await listPaymentProviders();
        setPaymentProviders(providers);
        const storedCartId = localStorage.getItem('cart_id');
        if (!storedCartId) {
          setError('No cart found. Please add items to your cart first.');
          setCartLoading(false);
          return;
        }

        setCartId(storedCartId);
        const { cart } = await sdk.store.cart.retrieve(storedCartId);

        if (cart && cart.items) {
          const items: CartItemType[] = cart.items.map((item: any) => {
            const originalPrice =
              item.original_unit_price ||
              item.variant?.calculated_price?.original_amount ||
              item.variant?.original_price;

            return {
              id: item.id,
              title: item.title || item.product?.title || 'Product',
              price: item.unit_price || 0,
              originalPrice:
                originalPrice && originalPrice > item.unit_price ? originalPrice : undefined,
              image: item.thumbnail || item.product?.thumbnail || '',
              quantity: item.quantity,
              variant: item.variant?.title,
              variant_id: item.variant_id,
              product_id: item.product_id || item.variant?.product_id,
            };
          });

          setCartItems(items);
          setSubtotal(cart.subtotal || 0);
          setShipping(cart.shipping_total || 0);
          setTax(cart.tax_total || 0);
          setTotal(cart.total || 0);
        }
      } catch (err) {
        console.error('Failed to fetch cart:', err);
        setError('Failed to load cart. Please try again.');
      } finally {
        setCartLoading(false);
      }
    };

    fetchCart();
  }, []);

  const handleCheckoutSubmit = async (data: CheckoutData) => {
    if (!cartId) {
      setError('No cart found. Please add items to your cart first.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // If user is not authenticated and provided password, register and login them
      if (!isAuthenticated && data.password) {
        try {
          await register({
            phone: data.shipping.phone,
            password: data.password,
            first_name: data.shipping.firstName,
            last_name: data.shipping.lastName,
            email: data.shipping.email,
          });
        } catch (regError) {
          console.error('Registration failed:', regError);
          setError(
            regError instanceof Error 
              ? regError.message 
              : 'Failed to create account. Please try again.'
          );
          setLoading(false);
          return;
        }
      }

      // Get the current cart first to verify its region
      const { cart: currentCart } = await sdk.store.cart.retrieve(cartId);

      if (!currentCart || !currentCart.region_id) {
        throw new Error('Cart or region not found');
      }

      // Update shipping address
      await sdk.store.cart.update(cartId, {
        shipping_address: {
          first_name: data.shipping.firstName,
          last_name: data.shipping.lastName,
          phone: data.shipping.phone,
          address_1: data.shipping.address,
          city: data.shipping.city,
          province: data.shipping.state,
          country_code: 'cm', // Cameroon
        },
        email: data.shipping.email,
      });

      // Set shipping method (using the first available shipping option)
      const { cart: updatedCart } = await sdk.store.cart.retrieve(cartId);

      const { shipping_options } = await sdk.store.fulfillment.listCartOptions({ cart_id: cartId });

      // Initialize payment sessions
      console.log('Available payment providers:', data.paymentMethod);
      await sdk.store.payment.initiatePaymentSession(updatedCart, {
        provider_id: paymentProviders[0]?.id || data.paymentMethod, // Use the first available provider or the one selected in the form
      });

      // Complete the cart and create order
      const { order } = await sdk.store.cart.complete(cartId);

      if (order) {
        // Clear cart ID from localStorage
        localStorage.removeItem('cart_id');

        // Redirect to success page with order ID
        router.push(`/order/success?id=${order.id}`);
      } else {
        throw new Error('Failed to create order');
      }
    } catch (err) {
      console.error('Checkout failed:', err);
      setError(
        err instanceof Error ? err.message : 'Failed to complete checkout. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const breadcrumbItems = [
    { title: 'Home', href: '/' },
    { title: 'Cart', href: '/cart' },
    { title: 'Checkout', href: '/checkout' },
  ].map((item, index) => (
    <Anchor component={Link} href={item.href} key={index} size="sm">
      {item.title}
    </Anchor>
  ));

  if (cartLoading) {
    return (
      <Container size="xl" py="xl">
        <Stack gap="lg" align="center">
          <Loader size="lg" />
          <Text>Loading cart...</Text>
        </Stack>
      </Container>
    );
  }

  if (error && cartItems.length === 0) {
    const handleClearCart = () => {
      localStorage.removeItem('cart_id');
      window.location.href = '/products';
    };

    return (
      <Container size="xl" py="xl">
        <Stack gap="lg" align="center" ta="center">
          <Alert color="red" title="Error">
            {error}
          </Alert>
          <Button onClick={handleClearCart} size="lg" color="purple" variant="outline">
            Clear Cart and Start Fresh
          </Button>
          <Button component={Link} href="/products" size="lg" color="purple">
            Continue Shopping
          </Button>
        </Stack>
      </Container>
    );
  }

  return (
    <Container size="xl" py="md">
      <Stack gap="lg">
        {/* Breadcrumbs */}
        <Breadcrumbs>{breadcrumbItems}</Breadcrumbs>

        <Title order={1}>Checkout</Title>

        {/* Error Alert */}
        {error && (
          <Alert color="red" title="Checkout Error">
            {error}
          </Alert>
        )}

        {/* Progress Steps */}
        <Group gap="xs" justify="space-between" wrap="nowrap">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = step.id === currentStep;
            const isCompleted = steps.findIndex((s) => s.id === currentStep) > index;

            return (
              <Group key={step.id} gap="xs" align="center" wrap="nowrap">
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    backgroundColor: isCompleted
                      ? 'var(--mantine-color-purple-6)'
                      : isActive
                        ? 'var(--mantine-color-purple-6)'
                        : 'var(--mantine-color-gray-3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                  }}
                >
                  <Icon size={16} />
                </div>
                <Text
                  size="xs"
                  fw={isActive ? 600 : 400}
                  c={isActive ? 'purple' : 'dimmed'}
                  style={{ fontSize: '11px' }}
                >
                  {step.title}
                </Text>
                {index < steps.length - 1 && (
                  <div
                    style={{
                      width: 20,
                      height: 2,
                      backgroundColor: isCompleted
                        ? 'var(--mantine-color-purple-6)'
                        : 'var(--mantine-color-gray-3)',
                      flexShrink: 0,
                    }}
                  />
                )}
              </Group>
            );
          })}
        </Group>

        <Grid>
          {/* Checkout Form */}
          <Grid.Col span={{ base: 12, lg: 8 }}>
            <CheckoutForm onSubmit={handleCheckoutSubmit} loading={loading} />
          </Grid.Col>

          {/* Order Summary Sidebar */}
          <Grid.Col span={{ base: 12, lg: 4 }}>
            <Card padding="lg" radius="md" withBorder>
              <Stack gap="md">
                <Title order={3}>Order Summary</Title>

                {/* Cart Items */}
                <Stack gap="sm">
                  {cartItems.map((item) => (
                    <Group key={item.id} justify="space-between" align="flex-start">
                      <Group gap="sm" style={{ flex: 1 }}>
                        <img
                          src={item.image}
                          alt={item.title}
                          style={{
                            width: 50,
                            height: 50,
                            objectFit: 'cover',
                            borderRadius: 'var(--mantine-radius-sm)',
                          }}
                        />
                        <div style={{ flex: 1 }}>
                          <Text size="sm" fw={600} lineClamp={2}>
                            {item.title}
                          </Text>
                          <Text size="xs" c="dimmed">
                            Qty: {item.quantity}
                          </Text>
                          {item.variant && (
                            <Text size="xs" c="dimmed">
                              Variant: {item.variant}
                            </Text>
                          )}
                        </div>
                      </Group>
                      <Text size="sm" fw={600}>
                        {formatAmount(item.price * item.quantity)}
                      </Text>
                    </Group>
                  ))}
                </Stack>

                <Divider />

                {/* Price Breakdown */}
                <Stack gap="xs">
                  <Group justify="space-between">
                    <Text>Subtotal</Text>
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

                <Text size="xs" c="dimmed" ta="center">
                  Secure checkout powered by SSL encryption
                </Text>
              </Stack>
            </Card>
          </Grid.Col>
        </Grid>
      </Stack>
    </Container>
  );
}
