'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import {
  IconArrowRight,
  IconHeart,
  IconRotateClockwise,
  IconShieldCheck,
  IconShoppingCart,
  IconStar,
  IconTruck,
} from '@tabler/icons-react';
import {
  Anchor,
  Badge,
  Box,
  Breadcrumbs,
  Button,
  Card,
  Center,
  Container,
  Grid,
  Group,
  Image,
  Loader,
  Modal,
  NumberInput,
  Select,
  SimpleGrid,
  Stack,
  Tabs,
  Text,
  Textarea,
  Title,
} from '@mantine/core';
import ImageGallery from '../../../components/ImageGallery/ImageGallery';
import { Price } from '../../../components/Price/Price';
import { ProductCard } from '../../../components/ProductCard/ProductCard';
import { Rating } from '../../../components/Rating/Rating';
import { ReviewCard } from '../../../components/ReviewCard/ReviewCard';
import { sdk } from '../../../stores/lib/sdk';
import type { Product } from '../../../types/product';
import { currentRegionId } from '../../../utils/Region';

const PLACEHOLDER_IMAGE = 'https://via.placeholder.com/400x300?text=No+Image';

export default function ProductDetailsPage() {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviews, setReviews] = useState<any[]>([]);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const params = useParams();
  const searchParams = useSearchParams();
  // Fetch product details on mount
  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        setLoading(true);
        const regionId = await currentRegionId();

        const resolvedRegionId = regionId || 'reg_01KG7SV2397XGKJH3R85K7T1NJ';

        const productId = params.slug as string;

        // Retrieve the product by its ID (stored in slug)
        const { product: productData } = await sdk.store.product.retrieve(productId, {
          region_id: resolvedRegionId,
          fields: '*variants.calculated_price,*images,*collection,*categories',
        });

        if (!productData) {
          throw new Error('Product not found');
        }

        // Fetch reviews from the dedicated reviews endpoint: /store/products/:id/reviews
        let reviewsFromApi: any[] = [];
        try {
          const reviewsResponse: any = await sdk.client.fetch(
            `/store/products/${productId}/reviews`
          );

          if (Array.isArray(reviewsResponse)) {
            reviewsFromApi = reviewsResponse;
          } else if (Array.isArray(reviewsResponse?.reviews)) {
            reviewsFromApi = reviewsResponse.reviews;
          }
        } catch (reviewsError) {
          console.error('Failed to fetch reviews for product:', reviewsError);
          reviewsFromApi = [];
        }

        // Process product data
        const processedProduct: Product = {
          ...productData,
          image: productData.thumbnail || productData.images?.[0]?.url || PLACEHOLDER_IMAGE,
          price:
            productData.variants?.[0]?.calculated_price?.calculated_amount !== undefined
              ? productData.variants[0].calculated_price.calculated_amount
              : productData.variants?.[0]?.prices?.[0]?.amount !== undefined
                ? productData.variants[0].prices[0].amount
                : 0,
          originalPrice:
            productData.variants?.[0]?.calculated_price?.original_amount !== undefined
              ? productData.variants[0].calculated_price.original_amount
              : undefined,
          reviewCount: reviewsFromApi.length ?? 0,
        };

        setReviews(reviewsFromApi);
        setProduct(processedProduct);

        // Initialize variant selections
        if (processedProduct.variants && processedProduct.variants.length > 0) {
          const firstVariant = processedProduct.variants[0];
          if (firstVariant.title) {
            setSelectedSize(firstVariant.title);
          }
        }

        // Fetch related products (same collection or category)
        const collectionId = productData.collection_id;
        console.log('Collection ID:', productData);
        if (collectionId) {
          const { products: relatedItemsRaw } = await sdk.store.product.list({
            collection_id: collectionId,
            region_id: resolvedRegionId,
            fields: '*variants.calculated_price,*images',
            limit: 4,
          });

          const relatedItems: Product[] = (relatedItemsRaw || []).filter(
            (p: Product) => p.id !== productData.id
          );

          const processedRelated = relatedItems.slice(0, 4).map((p) => ({
            ...p,
            image: p.thumbnail || p.images?.[0]?.url || PLACEHOLDER_IMAGE,
            price:
              p.variants?.[0]?.calculated_price?.calculated_amount !== undefined
                ? p.variants[0].calculated_price.calculated_amount
                : p.variants?.[0]?.prices?.[0]?.amount !== undefined
                  ? p.variants[0].prices[0].amount
                  : 0,
            reviewCount: p.reviews?.length ?? 0,
          }));

          setRelatedProducts(processedRelated);
        }

        // Check if user came from search and fetch similar products
        const searchQuery = searchParams?.get('q');
        if (searchQuery && searchQuery.trim()) {
          try {
            const { products: searchItemsRaw } = await sdk.store.product.list({
              q: searchQuery.trim(),
              region_id: resolvedRegionId,
              fields: '*variants.calculated_price,*images',
              limit: 8,
            });

            const searchItems: Product[] = (searchItemsRaw || []).filter(
              (p: Product) => p.id !== productData.id
            );

            const processedSearchResults = searchItems.slice(0, 8).map((p) => ({
              ...p,
              image: p.thumbnail || p.images?.[0]?.url || PLACEHOLDER_IMAGE,
              price:
                p.variants?.[0]?.calculated_price?.calculated_amount !== undefined
                  ? p.variants[0].calculated_price.calculated_amount
                  : p.variants?.[0]?.prices?.[0]?.amount !== undefined
                    ? p.variants[0].prices[0].amount
                    : 0,
              reviewCount: p.reviews?.length ?? 0,
            }));

            setSearchResults(processedSearchResults);
          } catch (searchError) {
            console.error('Failed to fetch search results:', searchError);
          }
        }

        setError(null);
      } catch (err) {
        console.error('Failed to fetch product:', err);
        setError(err instanceof Error ? err.message : 'Failed to load product');
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetails();
  }, [params.slug]);

  const handleSubmitReview = async () => {
    if (!reviewComment.trim()) return;

    if (!product) return;

    try {
      // Submit the review to the store endpoint: POST /store/products/:id/reviews
      await sdk.client.fetch(`/store/products/${product.id}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rating: reviewRating,
          comment: reviewComment.trim(),
          userName: 'Anonymous',
        }),
      });

      // Re-fetch the latest reviews after successful submission
      let updatedReviews: any[] = [];
      try {
        const reviewsResponse: any = await sdk.client.fetch(
          `/store/products/${product.id}/reviews`
        );

        if (Array.isArray(reviewsResponse)) {
          updatedReviews = reviewsResponse;
        } else if (Array.isArray(reviewsResponse?.reviews)) {
          updatedReviews = reviewsResponse.reviews;
        }
      } catch (reviewsError) {
        console.error('Failed to refresh reviews after submit:', reviewsError);
        updatedReviews = reviews;
      }

      setReviews(updatedReviews);
      setProduct((prev) =>
        prev
          ? {
              ...prev,
              reviewCount: updatedReviews.length,
            }
          : prev
      );

      setReviewModalOpen(false);
      setReviewRating(5);
      setReviewComment('');
    } catch (err) {
      console.error('Error submitting review', err);
    }
  };

  const handleAddToCart = async () => {
    if (isAdding || added || !product) return;

    const cartId = localStorage.getItem('cart_id');
    if (!cartId) {
      console.error('No cart ID found');
      return;
    }

    // Find the selected variant ID based on selectedSize
    const selectedVariant = product.variants?.find((v) => v.title === selectedSize);
    const variantId = selectedVariant?.id || product.variants?.[0]?.id;

    if (!variantId) {
      console.error('No variant ID found');
      return;
    }

    setIsAdding(true);
    try {
      await sdk.store.cart.createLineItem(cartId, {
        variant_id: variantId,
        quantity: quantity,
      });

      // Trigger custom event to update cart badge in header
      window.dispatchEvent(new CustomEvent('cart-update'));

      setAdded(true);
      console.log('Product added to cart');

      // Reset "added" state after 2 seconds
      setTimeout(() => setAdded(false), 2000);
    } catch (error) {
      console.error('Failed to add to cart:', error);
    } finally {
      setIsAdding(false);
    }
  };

  if (loading) {
    return (
      <Container size="xl" py="xl">
        <Center h={400}>
          <Loader size="lg" />
        </Center>
      </Container>
    );
  }

  if (error || !product) {
    return (
      <Container size="xl" py="xl">
        <Center h={400}>
          <Stack align="center" gap="md">
            <Text size="lg" fw={500}>
              {error || 'Product not found'}
            </Text>
            <Button component={Link} href="/products">
              Back to Products
            </Button>
          </Stack>
        </Center>
      </Container>
    );
  }

  const breadcrumbItems = [
    { title: 'Home', href: '/' },
    { title: 'Products', href: '/products' },
    { title: product.title, href: `/products/${product.handle || product.slug}` },
  ].map((item, index) => (
    <Anchor component={Link} href={item.href} key={index} size="sm">
      {item.title}
    </Anchor>
  ));

  const images = (product.images?.map((img) => img.url).filter(Boolean) as string[]) || [
    product.image || '',
  ];

  // Build variant selectors
  const uniqueVariantTitles = product.variants
    ? Array.from(new Set(product.variants.map((v) => v.title || 'Default')))
    : [];
  const colorVariants = uniqueVariantTitles.map((title) => ({
    value: title,
    label: title,
  }));

  return (
    <Container size="xl" py="md">
      <Stack gap="lg">
        {/* Breadcrumbs */}
        <Breadcrumbs>{breadcrumbItems}</Breadcrumbs>

        <Grid>
          {/* Product Images */}
          <Grid.Col span={{ base: 12, md: 6 }}>
            <ImageGallery
              images={images}
              startIndex={selectedImage}
              onIndexChange={(i) => setSelectedImage(i)}
            />
          </Grid.Col>

          {/* Product Info */}
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Stack gap="xs">
              <div>
                <Group gap="xs" mb="xs">
                  {product.isNew && <Badge color="blue">New Arrival</Badge>}
                  {product.isOnSale && <Badge color="red">Sale</Badge>}
                </Group>
                <Title order={1} size="2rem">
                  {product.title}
                </Title>
                <Group align="center" gap="sm">
                  {product.rating ? (
                    <>
                      <Rating value={product.rating} fontSize="1.5rem" showCount={true} />
                      <Text size="sm" c="dimmed">
                        ({product.reviewCount} reviews)
                      </Text>
                    </>
                  ) : (
                    <Text size="sm" c="dimmed">
                      No reviews yet
                    </Text>
                  )}
                </Group>
              </div>

              <Price price={product.price || 0} originalPrice={product.originalPrice} size="xl" />

              {/* Variants */}
              {colorVariants.length > 0 && (
                <Stack gap="md">
                  <Select
                    label="Variant"
                    placeholder="Select a variant"
                    data={colorVariants}
                    value={selectedSize}
                    onChange={(value) => value && setSelectedSize(value)}
                  />
                </Stack>
              )}

              {/* Quantity and Add to Cart */}
              <Stack gap="md">
                <Group align="end" gap="md">
                  <NumberInput
                    label="Quantity"
                    value={quantity}
                    onChange={(value) => setQuantity(Number(value) || 1)}
                    min={1}
                    w={'47%'}
                    size="md"
                    // max={10}
                  />
                  <Button
                    w={'47%'}
                    size="md"
                    color="purple"
                    leftSection={<IconShoppingCart size={16} />}
                    onClick={handleAddToCart}
                    loading={isAdding}
                    disabled={added}
                  >
                    {added ? 'Added!' : 'Add to Cart'}
                  </Button>
                </Group>
                <Button variant="outline" size="lg" leftSection={<IconHeart size={16} />}>
                  Add to Wishlist
                </Button>
              </Stack>
            </Stack>
          </Grid.Col>
        </Grid>

        {/* Product Details Tabs */}
        <Card padding="lg" radius="md" withBorder>
          <Tabs defaultValue="description">
            <Tabs.List mb="lg">
              <Tabs.Tab value="description">Description</Tabs.Tab>
              <Tabs.Tab value="reviews">Reviews ({reviews.length || 0})</Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel value="description">
              <Text style={{ whiteSpace: 'pre-line' }}>
                {product.description || 'No description available'}
              </Text>
            </Tabs.Panel>

            <Tabs.Panel value="reviews">
              <Stack gap="lg">
                <Group justify="space-between" align="center">
                  <Title order={3}>Customer Reviews</Title>
                  <Button variant="outline" onClick={() => setReviewModalOpen(true)}>
                    Write a Review
                  </Button>
                </Group>
                <Stack gap="md">
                  {reviews && reviews.length > 0 ? (
                    reviews.map((review) => <ReviewCard key={review.id} {...review} />)
                  ) : (
                    <Text c="dimmed">No reviews yet. Be the first to review!</Text>
                  )}
                </Stack>
              </Stack>
            </Tabs.Panel>
          </Tabs>
        </Card>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <Stack gap="md">
            <Group justify="space-between" align="center">
              <Title order={2}>Similar Products</Title>
              <Button
                variant="subtle"
                rightSection={<IconArrowRight size={16} />}
                component={Link}
                href={`/products?q=${encodeURIComponent(searchParams?.get('q') || '')}`}
              >
                View All
              </Button>
            </Group>
            <SimpleGrid cols={{ base: 2, sm: 2, md: 3, lg: 4 }} spacing="lg">
              {searchResults.map((product) => (
                <ProductCard key={product.id} {...product} />
              ))}
            </SimpleGrid>
          </Stack>
        )}

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <Stack gap="md">
            <Group justify="space-between" align="center">
              <Title order={2}>You Might Also Like</Title>
              <Button variant="subtle" rightSection={<IconArrowRight size={16} />}>
                View All
              </Button>
            </Group>
            <SimpleGrid cols={{ base: 2, sm: 2, md: 3, lg: 4 }} spacing="lg">
              {relatedProducts.map((product) => (
                <ProductCard key={product.id} {...product} />
              ))}
            </SimpleGrid>
          </Stack>
        )}

        {/* Write Review Modal */}
        <Modal
          opened={reviewModalOpen}
          onClose={() => setReviewModalOpen(false)}
          title="Write a Review"
          size="md"
        >
          <Stack gap="lg">
            <div>
              <Text fw={600} mb="xs">
                Rate this product:
              </Text>
              <Rating
                value={reviewRating}
                onChange={setReviewRating}
                fontSize="1.5rem"
                showCount={false}
                readOnly={false}
              />
            </div>

            <Textarea
              label="Your Review"
              placeholder="Share your thoughts about this product..."
              value={reviewComment}
              onChange={(event) => setReviewComment(event.currentTarget.value)}
              minRows={4}
              required
            />

            <Group justify="flex-end" gap="sm">
              <Button variant="outline" onClick={() => setReviewModalOpen(false)}>
                Cancel
              </Button>
              <Button color="purple" onClick={handleSubmitReview} disabled={!reviewComment.trim()}>
                Submit Review
              </Button>
            </Group>
          </Stack>
        </Modal>
      </Stack>
    </Container>
  );
}
