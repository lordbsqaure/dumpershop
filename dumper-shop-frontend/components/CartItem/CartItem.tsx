'use client';

import { IconTrash } from '@tabler/icons-react';
import { ActionIcon, Badge, Card, Group, Image, NumberInput, Stack, Text } from '@mantine/core';
import { formatAmount } from '../../utils/formatters';

interface CartItemProps {
  id: string;
  title: string;
  price: number;
  originalPrice?: number;
  image: string;
  quantity: number;
  variant?: string;
  onQuantityChange: (quantity: number) => void;
  onRemove: () => void;
}

export function CartItem({
  id,
  title,
  price,
  originalPrice,
  image,
  quantity,
  variant,
  onQuantityChange,
  onRemove,
}: CartItemProps) {
  const subtotal = price * quantity;
  const originalSubtotal = originalPrice ? originalPrice * quantity : undefined;
  const hasDiscount = originalPrice && originalPrice > price;

  return (
    <Card shadow="sm" padding="xs" pt={0} radius="md" withBorder pos="relative">
      <ActionIcon
        variant="filled"
        color="red"
        size="md"
        onClick={onRemove}
        aria-label="Remove item"
        style={{
          position: 'absolute',
          top: 6,
          right: 6,
          zIndex: 2,
          boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
        }}
      >
        <IconTrash size={14} />
      </ActionIcon>

      <Card.Section withBorder={false} pos="relative" style={{ overflow: 'hidden' }}>
        <Image
          src={image || 'https://via.placeholder.com/200x160?text=No+Image'}
          alt={title}
          h={{ base: 250, sm: 230 }}
          w="100%"
          fit="cover"
          style={{ 
            minHeight: 200, 
            display: 'block',
            objectFit: 'cover'
          }}
          fallbackSrc="https://via.placeholder.com/200x160?text=No+Image"
        />
        {hasDiscount && (
          <Badge
            color="red"
            size="xs"
            radius="sm"
            style={{
              position: 'absolute',
              top: 6,
              left: 6,
              zIndex: 1,
            }}
          >
            SALE
          </Badge>
        )}
      </Card.Section>

      <Stack gap={4} mt="xs" style={{ paddingBottom: 0 }}>
        <Text fw={600} size="xs" lineClamp={2}>
          {title}
        </Text>

        {variant && (
          <Text size="xs" c="dimmed">
            {variant}
          </Text>
        )}

        <Group gap={4} align="center" wrap="nowrap">
          {hasDiscount && (
            <Text size="xs" td="line-through" c="dimmed">
              {formatAmount(originalPrice!)}
            </Text>
          )}
          <Text size="xs" fw={600} c={hasDiscount ? 'red' : 'dark'}>
            {formatAmount(price)}
          </Text>
          <Text size="xs" c="dimmed">
            each
          </Text>
        </Group>

        <Group justify="space-between" align="flex-end" wrap="nowrap" gap="xs" mt={4}>
          <NumberInput
            value={quantity}
            onChange={(value) => onQuantityChange(Number(value) || 1)}
            min={1}
            size="xs"
            w={{ base: 64, sm: 72 }}
            flex="0 0 auto"
            styles={{
              input: {
                textAlign: 'center',
                fontSize: 12,
                fontWeight: 600,
              },
            }}
          />
          <Stack gap={0} align="flex-end" style={{ flex: 1, minWidth: 0 }}>
            <Text size="xs" c="dimmed">
              Total
            </Text>
            {hasDiscount && originalSubtotal && (
              <Text size="xs" td="line-through" c="dimmed">
                {formatAmount(originalSubtotal)}
              </Text>
            )}
            <Text fw={600} c="purple" size="sm">
              {formatAmount(subtotal)}
            </Text>
          </Stack>
        </Group>
      </Stack>
    </Card>
  );
}
