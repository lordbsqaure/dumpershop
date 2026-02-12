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
    <Card shadow="sm" padding="sm" radius="lg" withBorder>
      <Card.Section withBorder={false} pos="relative">
        <Image src={image} alt={title} h={{ base: 140, md: 150 }} w="100%" fit="cover" />
        {hasDiscount && (
          <Badge
            color="red"
            size="sm"
            radius="sm"
            style={{
              position: 'absolute',
              top: '0.5rem',
              right: '0.5rem',
            }}
          >
            SALE
          </Badge>
        )}
      </Card.Section>

      <Stack gap="xs" mt="sm">
        <Text fw={700} size="sm" lineClamp={2}>
          {title}
        </Text>

        {variant && (
          <Text size="xs" c="dimmed">
            {variant}
          </Text>
        )}

        {/* Unit Price */}
        <Group gap="xs" align="center">
          {hasDiscount && (
            <Text size="xs" td="line-through" c="dimmed">
              {formatAmount(originalPrice!)}
            </Text>
          )}
          <Text size="sm" fw={600} c={hasDiscount ? 'red' : 'dark'}>
            {formatAmount(price)}
          </Text>
          <Text size="xs" c="dimmed">
            each
          </Text>
        </Group>

        {/* Quantity and Total */}
        <Group justify="space-between" align="center" mt="xs" wrap="nowrap">
          <NumberInput
            value={quantity}
            onChange={(value) => onQuantityChange(Number(value) || 1)}
            min={1}
            size="sm"
            w={{ base: 80, sm: 90 }}
            styles={{
              input: {
                textAlign: 'center',
                fontSize: '14px',
                fontWeight: 600,
              },
            }}
          />

          <Stack gap={0} style={{ flexGrow: 1, alignItems: 'flex-end' }}>
            <Text size="xs" c="dimmed">
              Total
            </Text>
            {hasDiscount && originalSubtotal && (
              <Text size="xs" td="line-through" c="dimmed">
                {formatAmount(originalSubtotal)}
              </Text>
            )}
            <Text fw={700} c="purple" size="md">
              {formatAmount(subtotal)}
            </Text>
          </Stack>

          <ActionIcon
            variant="subtle"
            color="red"
            size="md"
            onClick={onRemove}
            style={{ flexShrink: 0 }}
          >
            <IconTrash size={16} />
          </ActionIcon>
        </Group>
      </Stack>
    </Card>
  );
}
