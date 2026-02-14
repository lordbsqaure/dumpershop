'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { IconHeart, IconShoppingCart, IconUser } from '@tabler/icons-react';
import {
  ActionIcon,
  Badge,
  Box,
  Burger,
  Button,
  Container,
  Drawer,
  Group,
  Stack,
  Text,
  useMantineTheme,
} from '@mantine/core';
import { useCartStore } from '../../stores/cart-store';
import { CustomLink } from '../Link/Link';
import { SearchBar } from '../SearchBar/SearchBar';

const navigationItems = [
  { label: 'Home', href: '/' },
  { label: 'Products', href: '/products' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
];

export function Header() {
  const [opened, setOpened] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const pathname = usePathname();
  const theme = useMantineTheme();
  // Cart store drives the badge; we sync from localStorage so badge updates when items are added via ProductCard/product page
  const cartItems = useCartStore((s) => s.items ?? []);
  const cartId = useCartStore((s) => s.cartId);
  const refreshCart = useCartStore((s) => s.refreshCart);
  const syncFromStorage = useCartStore((s) => s.syncFromStorage);
  const cartItemCount = cartItems.reduce((sum, item) => sum + (item.quantity ?? 1), 0);

  // On mount: if cart_id is in localStorage but store is empty, sync and refresh so badge shows
  useEffect(() => {
    syncFromStorage().catch(() => {});
  }, []);

  // When ProductCard/product page adds to cart they fire 'cart-update' — refresh store so badge updates
  useEffect(() => {
    const onCartUpdate = () => {
      if (useCartStore.getState().cartId) {
        useCartStore.getState().refreshCart().catch(() => {});
      } else {
        useCartStore.getState().syncFromStorage().catch(() => {});
      }
    };
    window.addEventListener('cart-update', onCartUpdate);
    return () => window.removeEventListener('cart-update', onCartUpdate);
  }, []);

  // Sync store cartId to localStorage when we have one. Do NOT remove when cartId is null (preserve on refresh).
  useEffect(() => {
    if (typeof window === 'undefined' || !cartId) return;
    localStorage.setItem('cart_id', cartId);
  }, [cartId]);

  // Refresh from server when pathname or cartId changes
  useEffect(() => {
    if (!cartId) return;
    refreshCart().catch(() => {});
  }, [pathname, cartId]);

  return (
    <>
      <Box
        component="header"
        style={{
          backgroundColor: 'white',
          paddingTop: '0.25rem',
          position: 'relative',
          zIndex: 5,
        }}
      >
        <Container size="xl" py="md">
          <Group justify="space-between" align="center">
            {/* Left side: Logo + Search */}
            <Group gap="lg">
              {/* Logo */}
              <CustomLink href="/">
                <img
                  src="/NORMAL LOGO.png"
                  alt="DumperShop Logo"
                  style={{
                    height: '48px',
                    width: 'auto',
                    cursor: 'pointer',
                  }}
                />
              </CustomLink>

              {/* Search Bar */}
              <SearchBar value={searchQuery} maxWidth={600} visibleFrom="sm" />
            </Group>

            {/* Right side: Navigation + Actions */}
            <Group gap="md" visibleFrom="md">
              {/* Desktop Navigation */}
              <Group gap="sm">
                {navigationItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <CustomLink key={item.href} href={item.href}>
                      <Button
                        variant={isActive ? 'filled' : 'subtle'}
                        size="sm"
                        color={isActive ? 'purple' : 'gray'}
                        fw={400}
                        style={{
                          color: isActive ? 'white' : 'var(--mantine-color-dark-9)',
                          '&:hover': {
                            backgroundColor: isActive
                              ? 'var(--mantine-color-purple-7)'
                              : 'var(--mantine-color-gray-1)',
                            color: isActive ? 'white' : 'var(--mantine-color-dark-9)',
                          },
                        }}
                      >
                        {item.label}
                      </Button>
                    </CustomLink>
                  );
                })}
              </Group>

              {/* Desktop Actions */}
              <Group gap="xs">
                <ActionIcon variant="subtle" size="md">
                  <IconHeart size={18} />
                </ActionIcon>
                <CustomLink href="/account">
                  <ActionIcon variant="subtle" size="md">
                    <IconUser size={18} />
                  </ActionIcon>
                </CustomLink>
                <Box component="span" style={{ position: 'relative', display: 'inline-flex' }}>
                  <CustomLink href="/cart">
                    <ActionIcon variant="subtle" size="md">
                      <IconShoppingCart size={20} />
                    </ActionIcon>
                  </CustomLink>
                  {cartItemCount > 0 && (
                    <Badge
                      size="sm"
                      circle
                      color="red"
                      variant="filled"
                      style={{
                        position: 'absolute',
                        top: -4,
                        right: -4,
                        minWidth: 18,
                        height: 18,
                        fontSize: 10,
                        fontWeight: 700,
                        padding: 0,
                        pointerEvents: 'none',
                        border: '2px solid white',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                      }}
                    >
                      {cartItemCount > 99 ? '99+' : cartItemCount}
                    </Badge>
                  )}
                </Box>
              </Group>
            </Group>

            {/* Mobile Actions - Burger + Cart + Account */}
            <Group gap="xs" hiddenFrom="md">
              <CustomLink href="/account">
                <ActionIcon variant="subtle" size="md">
                  <IconUser size={18} />
                </ActionIcon>
              </CustomLink>
              <Box component="span" style={{ position: 'relative', display: 'inline-flex' }}>
                <CustomLink href="/cart">
                  <ActionIcon variant="subtle" size="md">
                    <IconShoppingCart size={20} />
                  </ActionIcon>
                </CustomLink>
                {cartItemCount > 0 && (
                  <Badge
                    size="sm"
                    circle
                    color="red"
                    variant="filled"
                    style={{
                      position: 'absolute',
                      top: -4,
                      right: -4,
                      minWidth: 18,
                      height: 18,
                      fontSize: 10,
                      fontWeight: 700,
                      padding: 0,
                      pointerEvents: 'none',
                      border: '2px solid white',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                    }}
                  >
                    {cartItemCount > 99 ? '99+' : cartItemCount}
                  </Badge>
                )}
              </Box>
              <Burger opened={opened} onClick={() => setOpened(true)} />
            </Group>
          </Group>
        </Container>
      </Box>

      {/* Mobile Drawer */}
      <Drawer opened={opened} onClose={() => setOpened(false)} title="Menu" padding="md">
        <Stack gap="lg">
          {/* Categories Section - Mobile */}
          <div>
            <Text fw={600} size="lg" mb="md" c="dark">
              Shop by Category
            </Text>
            <Stack gap="sm">
              {[
                { name: 'Electronics', icon: '📱', href: '/products?category=electronics' },
                { name: 'Fashion', icon: '👕', href: '/products?category=fashion' },
                { name: 'Home & Garden', icon: '🏠', href: '/products?category=home' },
                { name: 'Sports', icon: '⚽', href: '/products?category=sports' },
              ].map((category) => (
                <CustomLink
                  key={category.name}
                  href={category.href}
                  style={{ textDecoration: 'none' }}
                >
                  <Button
                    variant="light"
                    color="black"
                    size="md"
                    fullWidth
                    leftSection={category.icon}
                    justify="flex-start"
                    onClick={() => setOpened(false)}
                  >
                    {category.name}
                  </Button>
                </CustomLink>
              ))}
            </Stack>
          </div>
        </Stack>
      </Drawer>
    </>
  );
}
