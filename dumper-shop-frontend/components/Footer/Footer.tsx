'use client';

import Link from 'next/link';
import {
  IconBrandFacebook,
  IconBrandInstagram,
  IconBrandTwitter,
  IconMail,
} from '@tabler/icons-react';
import {
  Button,
  Container,
  Divider,
  Grid,
  Group,
  Stack,
  Text,
  TextInput,
  Title,
} from '@mantine/core';

const footerLinks = {
  shop: [
    { label: 'All Products', href: '/products' },
    { label: 'Categories', href: '/categories' },
    { label: 'New Arrivals', href: '/products?filter=new' },
    { label: 'Sale', href: '/products?filter=sale' },
  ],
  support: [
    { label: 'Contact Us', href: '/contact' },
    { label: 'FAQ', href: '/faq' },
    { label: 'Shipping', href: '/shipping' },
    { label: 'Returns', href: '/returns' },
  ],
  account: [
    { label: 'My Account', href: '/account' },
    { label: 'Order History', href: '/account/orders' },
    { label: 'Wishlist', href: '/account/wishlist' },
    { label: 'Addresses', href: '/account/addresses' },
  ],
  company: [
    { label: 'About Us', href: '/about' },
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
    { label: 'Careers', href: '/careers' },
  ],
};

export function Footer() {
  return (
    <footer style={{ backgroundColor: 'var(--mantine-color-default)', marginTop: '4rem' }}>
      <Container size="xl" py="xl">
        <Grid>
          {/* Newsletter Section */}
          <Grid.Col span={{ base: 12, md: 4 }}>
            <Stack gap="md">
              <Title order={3} c="dark">
                Stay Updated
              </Title>
              <Text size="sm" c="dimmed">
                Subscribe to our newsletter for the latest products and exclusive offers.
              </Text>
              <Group>
                <TextInput
                  placeholder="Enter your email"
                  style={{ flex: 1 }}
                  rightSection={<IconMail size={16} />}
                />
                <Button color="dark">Subscribe</Button>
              </Group>
            </Stack>
          </Grid.Col>

          {/* Links Section */}
          <Grid.Col span={{ base: 12, md: 8 }}>
            <Grid>
              <Grid.Col span={{ base: 6, sm: 3 }}>
                <Stack gap="xs">
                  <Title order={4}>Shop</Title>
                  {footerLinks.shop.map((link) => (
                    <Button
                      key={link.href}
                      component={Link}
                      href={link.href}
                      variant="subtle"
                      color="dark"
                      size="sm"
                      p={0}
                      justify="start"
                    >
                      {link.label}
                    </Button>
                  ))}
                </Stack>
              </Grid.Col>

              <Grid.Col span={{ base: 6, sm: 3 }}>
                <Stack gap="xs">
                  <Title order={4}>Support</Title>
                  {footerLinks.support.map((link) => (
                    <Button
                      key={link.href}
                      component={Link}
                      href={link.href}
                      variant="subtle"
                      color="dark"
                      size="sm"
                      p={0}
                      justify="start"
                    >
                      {link.label}
                    </Button>
                  ))}
                </Stack>
              </Grid.Col>

              <Grid.Col span={{ base: 6, sm: 3 }}>
                <Stack gap="xs">
                  <Title order={4}>Account</Title>
                  {footerLinks.account.map((link) => (
                    <Button
                      key={link.href}
                      component={Link}
                      href={link.href}
                      variant="subtle"
                      color="dark"
                      size="sm"
                      p={0}
                      justify="start"
                    >
                      {link.label}
                    </Button>
                  ))}
                </Stack>
              </Grid.Col>

              <Grid.Col span={{ base: 6, sm: 3 }}>
                <Stack gap="xs">
                  <Title order={4}>Company</Title>
                  {footerLinks.company.map((link) => (
                    <Button
                      key={link.href}
                      component={Link}
                      href={link.href}
                      variant="subtle"
                      color="dark"
                      size="sm"
                      p={0}
                      justify="start"
                    >
                      {link.label}
                    </Button>
                  ))}
                </Stack>
              </Grid.Col>
            </Grid>
          </Grid.Col>
        </Grid>

        <Divider my="xl" />

        {/* Bottom Section */}
        <Group justify="space-between" align="center">
          <Text size="sm" c="dimmed">
            © 2024 DumperShop. All rights reserved.
          </Text>

          <Group gap="xs">
            <Button variant="subtle" color="gray" size="sm" p={0}>
              <IconBrandFacebook size={20} />
            </Button>
            <Button variant="subtle" color="gray" size="sm" p={0}>
              <IconBrandTwitter size={20} />
            </Button>
            <Button variant="subtle" color="gray" size="sm" p={0}>
              <IconBrandInstagram size={20} />
            </Button>
          </Group>
        </Group>
      </Container>
    </footer>
  );
}
