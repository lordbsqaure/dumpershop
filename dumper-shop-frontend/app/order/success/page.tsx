'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { IconArrowRight, IconCheck, IconMail, IconTruck } from '@tabler/icons-react';
import {
  Alert,
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
  Stack,
  Text,
  Title,
} from '@mantine/core';
import { sdk } from '@/stores/lib/sdk';
import { formatAmount } from '@/utils/formatters';

interface OrderItemType {
  id: string;
  title: string;
  price: number;
  quantity: number;
  image: string;
  variant?: string;
}

interface OrderType {
  id: string;
  items: OrderItemType[];
  shipping_address: {
    first_name: string;
    last_name: string;
    address_1: string;
    city: string;
    province: string;
    country_code: string;
  };
  shipping_method?: {
    name: string;
  };
  subtotal: number;
  shipping_total: number;
  tax_total: number;
  total: number;
  created_at: string;
}

export default function OrderSuccessPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('id');
  const [order, setOrder] = useState<OrderType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) {
        setError('No order ID provided');
        setLoading(false);
        return;
      }

      try {
        const { order } = await sdk.store.order.retrieve(orderId);

        if (order) {
          const orderData = order;

          const items: OrderItemType[] = orderData.items.map((item: any) => ({
            id: item.id,
            title: item.title || item.product?.title || 'Product',
            price: item.unit_price || 0,
            quantity: item.quantity,
            image: item.thumbnail || item.product?.thumbnail || '',
            variant: item.variant?.title,
          }));

          setOrder({
            id: orderData.id,
            items,
            shipping_address: orderData.shipping_address,
            shipping_method: orderData.shipping_methods?.[0],
            subtotal: orderData.subtotal || 0,
            shipping_total: orderData.shipping_total || 0,
            tax_total: orderData.tax_total || 0,
            total: orderData.total || 0,
            created_at: orderData.created_at,
          });
        } else {
          setError('Order not found');
        }
      } catch (err) {
        console.error('Failed to fetch order:', err);
        setError('Failed to load order details');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  const breadcrumbItems = [
    { title: 'Home', href: '/' },
    { title: 'Order Confirmation', href: '/order/success' },
  ].map((item, index) => (
    <Anchor component={Link} href={item.href} key={index}>
      {item.title}
    </Anchor>
  ));

  if (loading) {
    return (
      <Container size="xl" py="xl">
        <Stack gap="lg" align="center">
          <Loader size="lg" />
          <Text>Loading order details...</Text>
        </Stack>
      </Container>
    );
  }

  if (error || !order) {
    return (
      <Container size="xl" py="xl">
        <Stack gap="lg" align="center" ta="center">
          <Alert color="red" title="Error">
            {error || 'Failed to load order'}
          </Alert>
          <Button component={Link} href="/" size="lg" color="purple">
            Return Home
          </Button>
        </Stack>
      </Container>
    );
  }

  const shippingAddress = `${order.shipping_address.first_name} ${order.shipping_address.last_name}\n${order.shipping_address.address_1}\n${order.shipping_address.city}, ${order.shipping_address.province}\n${order.shipping_address.country_code}`;

  return (
    <Container size="xl" py="xl">
      <Stack gap="lg" align="center">
        {/* Success Message */}
        <Box
          style={{
            width: 100,
            height: 100,
            borderRadius: '50%',
            backgroundColor: 'var(--mantine-color-green-6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1rem',
          }}
        >
          <IconCheck size={50} color="white" />
        </Box>

        <Title order={1} ta="center">
          Order Confirmed!
        </Title>

        <Text size="lg" c="dimmed" ta="center" maw={600}>
          Thank you for your purchase! Your order has been successfully placed and is being
          processed.
        </Text>

        <Card padding="xl" radius="md" withBorder style={{ width: '100%', maxWidth: 800 }}>
          <Stack gap="lg">
            {/* Order Details */}
            <div>
              <Title order={3} mb="md">
                Order Details
              </Title>
              <Group justify="space-between" mb="xs">
                <Text fw={600}>Order Number:</Text>
                <Text>{order.id}</Text>
              </Group>
              <Group justify="space-between">
                <Text fw={600}>Total Amount:</Text>
                <Text size="lg" fw={700} c="purple">
                  {formatAmount(order.total)}
                </Text>
              </Group>
            </div>

            <Divider />

            {/* Order Items */}
            <div>
              <Title order={4} mb="md">
                Items Ordered
              </Title>
              <Stack gap="md">
                {order.items.map((item) => (
                  <Group key={item.id} justify="space-between" align="flex-start">
                    <Group gap="md">
                      <img
                        src={item.image}
                        alt={item.title}
                        style={{
                          width: 60,
                          height: 60,
                          objectFit: 'cover',
                          borderRadius: 'var(--mantine-radius-sm)',
                        }}
                      />
                      <div>
                        <Text fw={600}>{item.title}</Text>
                        <Text size="sm" c="dimmed">
                          Quantity: {item.quantity}
                        </Text>
                        {item.variant && (
                          <Text size="sm" c="dimmed">
                            Variant: {item.variant}
                          </Text>
                        )}
                      </div>
                    </Group>
                    <Text fw={600}>{formatAmount(item.price * item.quantity)}</Text>
                  </Group>
                ))}
              </Stack>
            </div>

            <Divider />

            {/* Price Breakdown */}
            <div>
              <Title order={4} mb="md">
                Order Summary
              </Title>
              <Stack gap="xs">
                <Group justify="space-between">
                  <Text>Subtotal</Text>
                  <Text>{formatAmount(order.subtotal)}</Text>
                </Group>
                <Group justify="space-between">
                  <Text>Shipping</Text>
                  <Text>{formatAmount(order.shipping_total)}</Text>
                </Group>
                <Group justify="space-between">
                  <Text>Tax</Text>
                  <Text>{formatAmount(order.tax_total)}</Text>
                </Group>
                <Divider />
                <Group justify="space-between">
                  <Text fw={600} size="lg">
                    Total
                  </Text>
                  <Text fw={600} size="lg" c="purple">
                    {formatAmount(order.total)}
                  </Text>
                </Group>
              </Stack>
            </div>

            <Divider />

            {/* Shipping Information */}
            <div>
              <Title order={4} mb="md">
                Shipping Information
              </Title>
              <Text style={{ whiteSpace: 'pre-line' }}>{shippingAddress}</Text>
              {order.shipping_method && (
                <Text c="dimmed" mt="xs">
                  Shipping Method: {order.shipping_method.name}
                </Text>
              )}
            </div>

            <Divider />

            {/* Next Steps */}
            <div>
              <Title order={4} mb="md">
                What's Next?
              </Title>
              <Stack gap="sm">
                <Group gap="sm">
                  <IconMail size={20} color="var(--mantine-color-purple-6)" />
                  <Text>You'll receive an order confirmation email shortly.</Text>
                </Group>
                <Group gap="sm">
                  <IconTruck size={20} color="var(--mantine-color-purple-6)" />
                  <Text>Your order will be shipped within 1-2 business days.</Text>
                </Group>
              </Stack>
            </div>
          </Stack>
        </Card>

        {/* Action Buttons */}
        <Group gap="md">
          <Button component={Link} href="/" variant="outline" size="lg">
            Continue Shopping
          </Button>
          <Button component={Link} href="/account/orders" size="lg" color="purple">
            View Order History
          </Button>
        </Group>

        <Text size="sm" c="dimmed" ta="center">
          Need help? Contact our support team at support@dumpshop.com
        </Text>
      </Stack>
    </Container>
  );
}
