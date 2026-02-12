'use client';

import { IconFilter, IconSortDescending } from '@tabler/icons-react';
import { Button, Group, Select, Stack, Text } from '@mantine/core';

interface SelectOption {
  value: string;
  label: string;
}

interface FilterSortProps {
  sortBy: string;
  onSortChange: (value: string) => void;
  category: string;
  onCategoryChange: (value: string) => void;
  collection?: string;
  onCollectionChange?: (value: string) => void;
  categoryOptions?: SelectOption[];
  collectionOptions?: SelectOption[];
  onClearFilters: () => void;
}

const sortOptions = [
  { value: 'newest', label: 'Newest First' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'popularity', label: 'Most Popular' },
];

const categoryOptionsLocal = [
  { value: '', label: 'All Categories' },
  { value: 'electronics', label: 'Electronics' },
  { value: 'fashion', label: 'Fashion' },
  { value: 'home', label: 'Home & Garden' },
  { value: 'sports', label: 'Sports' },
  { value: 'books', label: 'Books' },
];

export function FilterSort({
  sortBy,
  onSortChange,
  category,
  onCategoryChange,
  collection,
  onCollectionChange,
  categoryOptions,
  collectionOptions,
  onClearFilters,
}: FilterSortProps) {
  return (
    <Stack gap="md">
      <Group justify="space-between" align="center">
        <Text fw={600} size="lg">
          Filters & Sort
        </Text>
        <Button variant="subtle" size="sm" onClick={onClearFilters}>
          Clear All
        </Button>
      </Group>

      <Group grow>
        <Select
          label="Sort by"
          placeholder="Choose sorting"
          data={sortOptions}
          value={sortBy}
          onChange={(value) => value && onSortChange(value)}
          leftSection={<IconSortDescending size={16} />}
        />

        <Select
          label="Category"
          placeholder="All categories"
          data={categoryOptions ?? categoryOptionsLocal}
          value={category}
          onChange={(value) => onCategoryChange(value || '')}
          leftSection={<IconFilter size={16} />}
        />

        <Select
          label="Collection"
          placeholder="All collections"
          data={collectionOptions ?? []}
          value={collection}
          onChange={(value) => onCollectionChange && onCollectionChange(value || '')}
        />
      </Group>
    </Stack>
  );
}
