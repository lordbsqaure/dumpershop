'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { IconCreditCard, IconHeart, IconMapPin, IconSettings, IconShoppingBag, IconUser, IconLogout } from '@tabler/icons-react';
import { Avatar, Button, Card, Container, Group, SimpleGrid, Stack, Text, Title, Loader } from '@mantine/core';
import { useAuthStore } from '@/stores/auth-store';

const accountSections = [
  {
    title: 'Order History',
    description: 'View and track your orders',
    icon: IconShoppingBag,
    href: '/account/orders',
    color: 'blue',
  },
  {
    title: 'Wishlist',
    description: 'Your saved items',
    icon: IconHeart,
    href: '/account/wishlist',
    color: 'red',
  },
  {
    title: 'Addresses',
    description: 'Manage shipping addresses',
    icon: IconMapPin,
    href: '/account/addresses',
    color: 'green',
  },
  {
    title: 'Payment Methods',
    description: 'Manage payment options',
    icon: IconCreditCard,
    href: '/account/payment',
    color: 'purple',
  },
  {
    title: 'Account Settings',
    description: 'Update profile and preferences',
    icon: IconSettings,
    href: '/account/profile',
    color: 'gray',
  },
];

export default function AccountPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, checkAuth, logout } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <Container size="xl" py="xl">
        <Stack gap="lg" align="center">
          <Loader size="lg" />
          <Text>Loading...</Text>
        </Stack>
      </Container>
    );
  }

  if (!isAuthenticated || !user) {
    return null; // Will redirect to login
  }

  const userData = {
    name: `${user.first_name} ${user.last_name}`,
    email: user.email || user.phone || '',
    avatar: '',
    joinDate: 'January 2024',
    ordersCount: 12,
    wishlistCount: 8,
  };
  return (
    <Container size="xl" py="md">
      <Stack gap="lg">
        {/* Welcome Section */}
        <Card padding="xl" radius="md" withBorder>
          <Group align="center" gap="lg">
            <Avatar size={80} radius="xl">
              {userData.name.charAt(0).toUpperCase()}
            </Avatar>
            <div style={{ flex: 1 }}>
              <Title order={1}>Welcome back, {userData.name.split(' ')[0]}!</Title>
              <Text size="lg" c="dimmed">
                Member since {userData.joinDate}
              </Text>
              <Group gap="md" mt="sm">
                <Text size="sm">
                  <strong>{userData.ordersCount}</strong> orders placed
                </Text>
                <Text size="sm">
                  <strong>{userData.wishlistCount}</strong> items in wishlist
                </Text>
              </Group>
            </div>
            <Group gap="md">
              <Button component={Link} href="/account/profile" variant="outline">
                Edit Profile
              </Button>
              <Button 
                leftSection={<IconLogout size={20} />}
                variant="filled"
                color="red"
                onClick={async () => {
                  await logout();
                  router.push('/login');
                }}
              >
                Logout
              </Button>
            </Group>
          </Group>
        </Card>

        {/* Quick Actions */}
        <div>
          <Title order={2} mb="md">
            Account Overview
          </Title>
          <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
            {accountSections.map((section) => {
              const Icon = section.icon;
              return (
                <Card
                  key={section.href}
                  padding="lg"
                  radius="md"
                  withBorder
                  component={Link}
                  href={section.href}
                  style={{ textDecoration: 'none', cursor: 'pointer' }}
                >
                  <Group align="flex-start" gap="md">
                    <div
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: '50%',
                        backgroundColor: `var(--mantine-color-${section.color}-1)`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Icon size={24} color={`var(--mantine-color-${section.color}-6)`} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <Text fw={600} size="lg">
                        {section.title}
                      </Text>
                      <Text size="sm" c="dimmed">
                        {section.description}
                      </Text>
                    </div>
                  </Group>
                </Card>
              );
            })}
          </SimpleGrid>
        </div>

        {/* Recent Activity */}
        <Card padding="lg" radius="md" withBorder>
          <Title order={3} mb="md">
            Recent Activity
          </Title>
          <Stack gap="sm">
            <Text size="sm" c="dimmed">
              • Order #1234 has been shipped - Track your package
            </Text>
            <Text size="sm" c="dimmed">
              • Your review for Wireless Headphones has been published
            </Text>
            <Text size="sm" c="dimmed">
              • Welcome bonus: 10% off your next purchase
            </Text>
          </Stack>
          <Button component={Link} href="/account/orders" variant="subtle" mt="md">
            View All Activity
          </Button>
        </Card>
      </Stack>
    </Container>
  );
}
