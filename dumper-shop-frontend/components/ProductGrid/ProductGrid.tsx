'use client';

import { Button, Group, Pagination, SimpleGrid, Text } from '@mantine/core';
import type { Product } from '../../types/product';
import { ProductCard } from '../ProductCard/ProductCard';

interface ProductGridProps {
  products: Product[];
  loading?: boolean;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function ProductGrid({
  products,
  loading = false,
  currentPage,
  totalPages,
  onPageChange,
}: ProductGridProps) {
  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <Text>Loading products...</Text>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <Text size="lg" c="dimmed">
          No products found
        </Text>
        <Text size="sm" c="dimmed" mt="xs">
          Try adjusting your filters or search terms
        </Text>
      </div>
    );
  }

  return (
    <>
      <SimpleGrid cols={{ base: 2, sm: 2, md: 3, lg: 4, xl: 4 }} spacing="sm">
        {products.map((product) => (
          <ProductCard key={product.id} {...product} />
        ))}
      </SimpleGrid>

      {totalPages > 1 && (
        <Group justify="center" mt="xl">
          <Pagination
            total={totalPages}
            value={currentPage}
            onChange={onPageChange}
            size="md"
            radius="md"
          />
        </Group>
      )}
    </>
  );
}
