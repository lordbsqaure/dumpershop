'use client';

import { Group, Text } from '@mantine/core';
import { formatAmount } from '../../utils/formatters';

interface PriceProps {
  price: number;
  originalPrice?: number;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showDiscount?: boolean;
}

export function Price({ price, originalPrice, size = 'md', showDiscount = true }: PriceProps) {
  const discount = originalPrice ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;

  return (
    <Group gap="xs" align="baseline">
      {originalPrice && originalPrice > price && (
        <>
          <Text
            size={size === 'xl' ? 'lg' : size === 'lg' ? 'md' : 'sm'}
            td="line-through"
            c="dimmed"
          >
            {formatAmount(originalPrice)}
          </Text>
          {showDiscount && discount > 0 && (
            <Text size="sm" c="red" fw={600}>
              -{discount}%
            </Text>
          )}
        </>
      )}
      <Text size={size} fw={700} c="purple">
        {formatAmount(price)}
      </Text>
    </Group>
  );
}
