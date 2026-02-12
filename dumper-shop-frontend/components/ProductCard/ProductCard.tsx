'use client';

import { useEffect, useState } from 'react';
import { IconCheck, IconHeart, IconShoppingCart, IconStarFilled } from '@tabler/icons-react';
import { Badge, Button, Card, Group, Stack, Text } from '@mantine/core';
import { sdk } from '../../stores/lib/sdk';
import type { Product } from '../../types/product';
import { formatAmount } from '../../utils/formatters';
import { currentRegionId } from '../../utils/Region';
import { CachedImage } from '../CachedImage/CachedImage';
import { CustomLink } from '../Link/Link';
import { Rating } from '../Rating/Rating';

type ProductCardProps = Pick<
  Product,
  | 'id'
  | 'title'
  | 'price'
  | 'originalPrice'
  | 'image'
  | 'rating'
  | 'reviewCount'
  | 'variants'
  | 'price'
> & {
  isOnSale?: boolean;
  isNew?: boolean;
  isFeatured?: boolean;
};

export function ProductCard({
  id,
  title,
  variants,
  originalPrice,
  image,
  rating,
  reviewCount,
  isOnSale,
  isNew,
  price,
  isFeatured,
}: ProductCardProps) {
  const placeholderImage = 'https://picsum.photos/200';
  const [isAdding, setIsAdding] = useState(false);
  const [added, setAdded] = useState(false);

  // Initialize cart on component mount
  useEffect(() => {
    const initCart = async () => {
      const cartId = localStorage.getItem('cart_id');
      if (!cartId) {
        try {
          const regionId = await currentRegionId();
          if (!regionId) {
            console.error('No suitable region found for cart creation');
            return;
          }
          const { cart } = await sdk.store.cart.create({
            region_id: regionId,
          });
          localStorage.setItem('cart_id', cart.id);
        } catch (error) {
          console.error('Failed to initialize cart:', error);
        }
      }
    };
    initCart();
  }, []);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation
    e.stopPropagation();

    if (isAdding || added) return;

    const cartId = localStorage.getItem('cart_id');
    if (!cartId) {
      console.error('No cart ID found');
      return;
    }

    const variantId = variants?.[0]?.id;
    if (!variantId) {
      console.error('No variant ID found');
      return;
    }

    setIsAdding(true);
    
    try {
      await sdk.store.cart.createLineItem(cartId, {
        variant_id: variantId,
        quantity: 1,
      });

      setAdded(true);
      console.log('Product added to cart');
      
      // Trigger custom event after API call to update cart badge in header
      window.dispatchEvent(new CustomEvent('cart-update'));

      // Reset "added" state after 2 seconds
      setTimeout(() => setAdded(false), 2000);
    } catch (error) {
      console.error('Failed to add to cart:', error);
    } finally {
      setIsAdding(false);
    }
  };

  // Extract calculated price and original price from variants
  const calculatedPrice =
    variants && variants.length > 0 ? (variants[0].calculated_price?.calculated_amount ?? 0) : 0;
  const calculatedOriginalPrice =
    variants && variants.length > 0 && variants[0].calculated_price?.original_amount
      ? variants[0].calculated_price.original_amount
      : undefined;

  // Use the calculated original price if available, otherwise use the prop
  const displayOriginalPrice = calculatedOriginalPrice ?? originalPrice;

  // Determine if product is on sale (check if there's a price difference or if it's a sale price list)
  const variantData = variants?.[0] as any;
  const isSalePrice = variantData?.calculated_price?.calculated_price?.price_list_type === 'sale';
  const hasDiscount =
    (displayOriginalPrice !== undefined && displayOriginalPrice > calculatedPrice) || isSalePrice;

  const prices = typeof calculatedPrice === 'number' ? calculatedPrice : '--';

  return (
    <CustomLink href={`/products/${id}`} style={{ textDecoration: 'none' }}>
      <Card
        shadow="sm"
        padding="xs"
        radius="lg"
        withBorder
        // className="hover:shadow-lg hover:bg-purple-50 transition-all duration-200 cursor-pointer [&_*]:no-underline"
      >
        <Card.Section withBorder={false} pos="relative">
          <CachedImage
            src={image}
            fallback={placeholderImage}
            alt={title}
            h={{ base: 150, sm: 150, md: 200, lg: 250 }}
            w={{ base: '100%', sm: '100%', md: '100%', lg: '100%' }}
            fit="cover"
          />
          {isNew && (
            <Badge
              color="blue"
              size="lg"
              radius="xl"
              style={{
                position: 'absolute',
                top: '0.625rem',
                left: '0.625rem',
              }}
            >
              NEW
            </Badge>
          )}
          {(isOnSale || hasDiscount) && (
            <Badge
              color="purple"
              size="lg"
              radius="xl"
              style={{
                position: 'absolute',
                top: '0.625rem',
                right: '0.625rem',
              }}
            >
              SALE
            </Badge>
          )}
        </Card.Section>

        <Stack gap="0.125rem" mt="0.5rem">
          <Text fw={700} size="0.8rem" lineClamp={1}>
            {title}
          </Text>

          <Rating value={(rating as number) || 5} fontSize="1.5rem" showCount={false} />

          <Group gap="0.15rem" align="center">
            {displayOriginalPrice !== undefined && displayOriginalPrice !== null && hasDiscount && (
              <Text size="0.6rem" td="line-through" c="dimmed">
                {formatAmount(displayOriginalPrice)}
              </Text>
            )}

            {typeof prices === 'number' ? (
              <Text size="0.8rem" fw={700}>
                {formatAmount(prices as number)}
              </Text>
            ) : (
              <Text size="0.8rem" fw={700} c="dimmed">
                {prices}
              </Text>
            )}
          </Group>

          <Button
            mt="1rem"
            variant={added ? 'filled' : 'outline'}
            color="purple"
            fullWidth
            size="sm"
            leftSection={added ? <IconCheck size={16} /> : <IconShoppingCart size={16} />}
            className="active:bg-purple-500 active:text-white"
            style={{
              fontSize: '0.875rem',
            }}
            onClick={handleAddToCart}
            loading={isAdding}
            disabled={added}
          >
            {added ? 'Added!' : 'Add to Cart'}
          </Button>
        </Stack>
      </Card>
    </CustomLink>
  );
}
