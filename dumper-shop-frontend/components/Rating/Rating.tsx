'use client';

import { Group, Text } from '@mantine/core';

interface RatingProps {
  value: number;
  reviewCount?: number;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  fontSize?: string;
  showCount?: boolean;
  showValue?: boolean;
  color?: string;
  readOnly?: boolean;
  onChange?: (value: number) => void;
}

export function Rating({
  value,
  reviewCount,
  size = 'md',
  fontSize,
  showCount = true,
  showValue = false,
  color = 'purple.6',
  readOnly = true,
  onChange,
}: RatingProps) {
  const textStyle = fontSize
    ? { fontFamily: 'monospace', letterSpacing: '0.5px', fontSize }
    : { fontFamily: 'monospace', letterSpacing: '0.5px' };

  const handleStarClick = (rating: number) => {
    if (!readOnly && onChange) {
      onChange(rating);
    }
  };

  return (
    <Group gap="xs" align="center">
      <Group gap="2px">
        {[1, 2, 3, 4, 5].map((star) => (
          <Text
            key={star}
            size={fontSize ? undefined : size}
            c={star <= value ? color : 'gray.4'}
            fw={600}
            style={{
              ...textStyle,
              cursor: !readOnly && onChange ? 'pointer' : 'default',
              userSelect: 'none',
            }}
            onClick={() => handleStarClick(star)}
          >
            ★
          </Text>
        ))}
      </Group>
      {showValue && (
        <Text size={size} c="dimmed">
          {value.toFixed(1)}
        </Text>
      )}
      {showCount && reviewCount !== undefined && (
        <Text size={size} c="dimmed">
          ({reviewCount})
        </Text>
      )}
    </Group>
  );
}
