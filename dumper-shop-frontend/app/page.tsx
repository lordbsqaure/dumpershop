'use client';

import { useEffect, useState } from 'react';
import { IconArrowRight, IconShieldCheck, IconStar, IconTruck } from '@tabler/icons-react';
import {
  Avatar,
  Box,
  Button,
  Card,
  Container,
  Grid,
  Group,
  Image,
  SimpleGrid,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import { Product } from '@/types/product';
import { currentRegionId } from '@/utils/Region';
import { CustomLink } from '../components/Link/Link';
import { ProductCard } from '../components/ProductCard/ProductCard';
import { Rating } from '../components/Rating/Rating';
import { ScrollingCategories } from '../components/ScrollingCategories/ScrollingCategories';
import { SearchBar } from '../components/SearchBar/SearchBar';
import { Slider } from '../components/Slider/Slider';
import { sdk } from '../stores/lib/sdk';

const testimonials = [
  {
    name: 'Sarah Johnson',
    role: 'Verified Customer',
    content: 'Amazing quality and fast shipping! The products exceeded my expectations.',
    rating: 5,
    image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100',
  },
  {
    name: 'Mike Chen',
    role: 'Verified Customer',
    content: "Great customer service and the best prices I've found online.",
    rating: 5,
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
  },
  {
    name: 'Emma Davis',
    role: 'Verified Customer',
    content: 'Love shopping here. Always find exactly what I need with excellent support.',
    rating: 5,
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100',
  },
];

export default function HomePage() {
  const [mobileSearchQuery, setMobileSearchQuery] = useState('');
  const [featuredProducts, setFeaturedProducts] = useState<{ product: Product }[]>([]);
  const PLACEHOLDER_IMAGE = 'https://via.placeholder.com/400x300?text=No+Image';

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const region_id = await currentRegionId();
        const response: { featured_products: any[] } = await sdk.client.fetch(
          `/store/featured-products?region_id=${region_id}&currency_code=xaf`
        );
        console.log('Featured Products Response:', response);
        setFeaturedProducts(response.featured_products);
      } catch (error) {
        console.error('Failed to fetch featured products:', error);
      }
    };

    fetchFeatured();
  }, []);

  return (
    <Container fluid pl={0} pr={0} ml={0} mr={0}>
      <Stack>
        {/* Hero Slider */}
        <Box pl={{ md: '40px' }} pr={{ md: '40px' }} w={'100%'}>
          <Slider />
        </Box>

        {/* Mobile Search Bar - Only visible on mobile */}
        <Box px="md">
          <SearchBar value={mobileSearchQuery} onChange={setMobileSearchQuery} hiddenFrom="sm" />
        </Box>

        {/* Category Showcase - Desktop Only with Auto Scroll */}
        <ScrollingCategories />

        {/* Featured Products */}
        {featuredProducts.length > 0 && (
          <Box pl={0} pr={0} ml={{ base: 'sm', md: '30px' }} mr={{ base: 'sm', md: '30px' }}>
            <Stack gap="md">
              <Title order={2} ta="center">
                Featured Products
              </Title>
              <SimpleGrid cols={{ base: 2, sm: 2, md: 3, lg: 4 }} spacing="xs">
                {featuredProducts.map((item) => {
                  const product = item.product || item;
                  const price = product?.variants?.[0]?.calculated_price?.calculated_amount || 0;
                  const image =
                    product?.thumbnail || product?.images?.[0]?.url || PLACEHOLDER_IMAGE;
                  const rating = product?.rating || 0;
                  const reviewCount = product?.reviews?.length || 0;
                  console.log('Rendering product:', product);
                  return (
                    <ProductCard
                      key={product?.id}
                      image={image}
                      isFeatured={product.isFeatured || false}
                      {...product}
                      variants={product.variants}
                    />
                  );
                })}
              </SimpleGrid>
            </Stack>
          </Box>
        )}

        <Box pl={0} pr={0} ml={{ base: 'sm', md: '30px' }} mr={{ base: 'sm', md: '30px' }}>
          {/* Features */}
          <SimpleGrid cols={{ base: 1, md: 3 }} spacing="lg">
            <Card padding="lg" radius="md" withBorder>
              <Group>
                <IconTruck size={32} color="var(--mantine-color-purple-6)" />
                <div>
                  <Text fw={600}>Free Shipping</Text>
                  <Text size="sm" c="dimmed">
                    On orders over $50
                  </Text>
                </div>
              </Group>
            </Card>
            <Card padding="lg" radius="md" withBorder>
              <Group>
                <IconShieldCheck size={32} color="var(--mantine-color-purple-6)" />
                <div>
                  <Text fw={600}>Quality Guarantee</Text>
                  <Text size="sm" c="dimmed">
                    30-day return policy
                  </Text>
                </div>
              </Group>
            </Card>
            <Card padding="lg" radius="md" withBorder>
              <Group>
                <IconStar size={32} color="var(--mantine-color-purple-6)" />
                <div>
                  <Text fw={600}>Premium Support</Text>
                  <Text size="sm" c="dimmed">
                    24/7 customer service
                  </Text>
                </div>
              </Group>
            </Card>
          </SimpleGrid>

          {/* Product Adverts */}
          <Stack gap="md" mt="xl">
            <Title order={2} ta="center">
              Featured Collections
            </Title>
            <SimpleGrid cols={{ base: 1, md: 3 }} spacing="lg">
              <CustomLink href="/products?category=electronics">
                <Card padding={0} radius="lg" style={{ overflow: 'hidden', position: 'relative' }}>
                  <div style={{ position: 'relative', height: 300 }}>
                    <img
                      src="https://images.unsplash.com/photo-1535223289827-42f1e9919769?w=600"
                      alt="Electronics"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                    />
                    <div
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background:
                          'linear-gradient(45deg, rgba(102, 126, 234, 0.4), rgba(118, 75, 162, 0.4))',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        color: 'white',
                        textAlign: 'center',
                        padding: '2rem',
                      }}
                    >
                      <Title order={3} mb="sm">
                        Electronics
                      </Title>
                      <Text size="sm" mb="lg">
                        Latest gadgets & tech
                      </Text>
                      <Button variant="white" color="dark">
                        Shop Now
                      </Button>
                    </div>
                  </div>
                </Card>
              </CustomLink>

              <CustomLink href="/products?category=fashion">
                <Card padding={0} radius="lg" style={{ overflow: 'hidden', position: 'relative' }}>
                  <div style={{ position: 'relative', height: 300 }}>
                    <img
                      src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600"
                      alt="Fashion"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                    />
                    <div
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background:
                          'linear-gradient(45deg, rgba(240, 147, 251, 0.4), rgba(245, 87, 108, 0.4))',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        color: 'white',
                        textAlign: 'center',
                        padding: '2rem',
                      }}
                    >
                      <Title order={3} mb="sm">
                        Fashion
                      </Title>
                      <Text size="sm" mb="lg">
                        Trendy styles & apparel
                      </Text>
                      <Button variant="white" color="dark">
                        Explore
                      </Button>
                    </div>
                  </div>
                </Card>
              </CustomLink>

              <CustomLink href="/products?category=home-garden">
                <Card padding={0} radius="lg" style={{ overflow: 'hidden', position: 'relative' }}>
                  <div style={{ position: 'relative', height: 300 }}>
                    <img
                      src="https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600"
                      alt="Home & Garden"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                    />
                    <div
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background:
                          'linear-gradient(45deg, rgba(67, 233, 123, 0.4), rgba(56, 249, 215, 0.4))',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        color: 'white',
                        textAlign: 'center',
                        padding: '2rem',
                      }}
                    >
                      <Title order={3} mb="sm">
                        Home & Garden
                      </Title>
                      <Text size="sm" mb="lg">
                        Beautiful home essentials
                      </Text>
                      <Button variant="white" color="dark">
                        Discover
                      </Button>
                    </div>
                  </div>
                </Card>
              </CustomLink>
            </SimpleGrid>
          </Stack>

          {/* Testimonials */}
          <Stack gap="md">
            <Title order={2} ta="center" mt={30}>
              What Our Customers Say
            </Title>
            <SimpleGrid cols={{ base: 1, md: 3 }} spacing="lg">
              {testimonials.map((testimonial, index) => (
                <Card key={index} padding="lg" radius="md" withBorder>
                  <Stack gap="sm">
                    <Rating value={testimonial.rating} size="sm" showCount={false} />
                    <Text>{testimonial.content}</Text>
                    <Group justify="space-between" align="center">
                      <div>
                        <Text fw={600}>{testimonial.name}</Text>
                        <Text size="sm" c="dimmed">
                          {testimonial.role}
                        </Text>
                      </div>
                      <Avatar src={testimonial.image} size="md" radius="xl" />
                    </Group>
                  </Stack>
                </Card>
              ))}
            </SimpleGrid>
          </Stack>
        </Box>
      </Stack>
    </Container>
  );
}
