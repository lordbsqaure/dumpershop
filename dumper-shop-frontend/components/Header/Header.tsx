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
import { sdk } from '../../stores/lib/sdk';
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
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [cartItemCount, setCartItemCount] = useState(0);

  // Fetch cart data
  const fetchCart = async () => {
    try {
      const cartId = localStorage.getItem('cart_id');
      if (!cartId) {
        setCartItemCount(0);
        return;
      }

      const { cart } = await sdk.store.cart.retrieve(cartId);
      if (cart && cart.items) {
        setCartItems(cart.items);
        const count = cart.items.length;
        setCartItemCount(count);
      } else {
        setCartItemCount(0);
      }
    } catch (error) {
      console.error('Failed to fetch cart:', error);
      setCartItemCount(0);
    }
  };

  // Initialize cart on mount
  useEffect(() => {
    fetchCart();
  }, []);

  // Listen for cart updates from custom events
  useEffect(() => {
    const handleCartUpdate = () => {
      console.log('Cart update event received');
      // Fetch the latest cart data from the API
      fetchCart();
    };

    window.addEventListener('cart-update', handleCartUpdate);
    return () => window.removeEventListener('cart-update', handleCartUpdate);
  }, []);

  // Refresh cart when pathname changes (to ensure we have latest data)
  useEffect(() => {
    fetchCart();
  }, [pathname]);

  // Debug: log cart item count
  useEffect(() => {
    console.log('Cart items:', cartItems);
    console.log('Cart item count:', cartItemCount);
  }, [cartItems, cartItemCount]);

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
                <div style={{ position: 'relative', display: 'inline-block' }}>
                  <CustomLink href="/cart">
                    <ActionIcon variant="subtle" size="md">
                      <IconShoppingCart size={20} />
                    </ActionIcon>
                  </CustomLink>
                  {cartItemCount > 0 && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '-4px',
                        right: '-4px',
                        backgroundColor: '#fa5252',
                        color: 'white',
                        fontSize: '10px',
                        fontWeight: 'bold',
                        minWidth: '18px',
                        height: '18px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '2px solid white',
                        zIndex: 10,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                        pointerEvents: 'none',
                      }}
                    >
                      {cartItemCount > 99 ? '99+' : cartItemCount}
                    </div>
                  )}
                </div>
              </Group>
            </Group>

            {/* Mobile Actions - Burger + Cart + Account */}
            <Group gap="xs" hiddenFrom="md">
              <CustomLink href="/account">
                <ActionIcon variant="subtle" size="md">
                  <IconUser size={18} />
                </ActionIcon>
              </CustomLink>
              <div style={{ position: 'relative', display: 'inline-block' }}>
                <CustomLink href="/cart">
                  <ActionIcon variant="subtle" size="md">
                    <IconShoppingCart size={20} />
                  </ActionIcon>
                </CustomLink>
                {cartItemCount > 0 && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '-4px',
                      right: '-4px',
                      backgroundColor: '#fa5252',
                      color: 'white',
                      fontSize: '10px',
                      fontWeight: 'bold',
                      minWidth: '18px',
                      height: '18px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '2px solid white',
                      zIndex: 10,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                      pointerEvents: 'none',
                    }}
                  >
                    {cartItemCount > 99 ? '99+' : cartItemCount}
                  </div>
                )}
              </div>
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
