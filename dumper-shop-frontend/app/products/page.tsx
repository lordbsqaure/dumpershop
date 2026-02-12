'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Store } from '@medusajs/js-sdk';
import { IconStar, IconStarFilled } from '@tabler/icons-react';
import {
  Anchor,
  Badge,
  Breadcrumbs,
  Button,
  Container,
  Grid,
  Group,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import type { Product } from '@/types/product';
import { currentRegionId } from '@/utils/Region';
import { FilterSort } from '../../components/FilterSort/FilterSort';
import { ProductGrid } from '../../components/ProductGrid/ProductGrid';
import { SearchBar } from '../../components/SearchBar/SearchBar';
import { sdk } from '../../stores/lib/sdk';

export default function ProductsPage() {
  // Filters and pagination state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedCollection, setSelectedCollection] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);

  // Data state
  const [products, setProducts] = useState<Product[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  // Options
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [collections, setCollections] = useState<{ id: string; title: string }[]>([]);

  const PRODUCTS_PER_PAGE = 12;
  const PLACEHOLDER_IMAGE = 'https://via.placeholder.com/400x300?text=No+Image';

  const [copied, setCopied] = useState('');
  const copyToClipboard = async (text: string) => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(text);
        setCopied('Copied!');
      } else {
        setCopied('Clipboard not available');
      }
    } catch (error) {
      setCopied('Failed to copy');
    } finally {
      setTimeout(() => setCopied(''), 2000);
    }
  };

  const searchParams = useSearchParams();

  // Map frontend sort values to Medusa order params
  const mapSortToMedusaOrder = (sort: string) => {
    switch (sort) {
      case 'newest':
        // Medusa uses `-field` for descending order
        return '-created_at';
      case 'price-low':
        // Sort by variant price amount ascending
        return 'variants.prices.amount';
      case 'price-high':
        // Descending by variant price amount
        return '-variants.prices.amount';
      case 'rating':
        return '-rating';
      case 'popularity':
        return '-popularity';
      default:
        return sort; // pass-through for custom values
    }
  };

  // Reverse mapping from Medusa order params to frontend sort keys
  const mapMedusaOrderToSort = (order: string | null | undefined) => {
    if (!order) return 'newest';
    const o = order.trim().toLowerCase();
    const withoutSign = o.replace(/^[-+]/, '');

    if (o.includes('created_at') || withoutSign.includes('created_at')) {
      return 'newest';
    }

    // Variants price amount handling
    if (
      withoutSign.includes('variants') &&
      withoutSign.includes('prices') &&
      withoutSign.includes('amount')
    ) {
      if (o.startsWith('-') || o.includes(':desc')) return 'price-high';
      return 'price-low';
    }

    // Generic price check (fallback)
    if (withoutSign.includes('price')) {
      if (o.startsWith('-') || o.includes(':desc')) return 'price-high';
      return 'price-low';
    }

    if (withoutSign.includes('rating')) return 'rating';
    if (withoutSign.includes('popularity')) return 'popularity';
    return 'newest';
  };

  // Read query params on load/navigation and initialize filter state
  useEffect(() => {
    if (!searchParams) return;

    // q param takes precedence for search
    const q = searchParams.get('q') || searchParams.get('search');
    if (q) {
      setSearchQuery(q);
    } else {
      // support bare query like `?sports` — treat the key as a search query
      const keys = Array.from(searchParams.keys());
      for (const key of keys) {
        const val = searchParams.get(key);
        if (val === '') {
          setSearchQuery(key);
          break;
        }
      }
    }

    // support both category id or handle in the query string
    if (searchParams.has('category') || searchParams.has('category_id')) {
      setSelectedCategory(searchParams.get('category') || searchParams.get('category_id') || '');
    }

    // support collection_id or collection
    if (searchParams.has('collection') || searchParams.has('collection_id')) {
      setSelectedCollection(
        searchParams.get('collection') || searchParams.get('collection_id') || ''
      );
    }

    if (searchParams.has('order')) {
      const orderParam = searchParams.get('order');
      setSortBy(mapMedusaOrderToSort(orderParam));
    }

    if (searchParams.has('page')) {
      const p = Number(searchParams.get('page')) || 1;
      setCurrentPage(p);
    }
  }, [searchParams]);

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setSelectedCollection('');
    setSortBy('newest');
    setCurrentPage(1);
  };

  const setCategory = (category: string) => {
    setSelectedCategory(category);
  };

  // Build a products link that includes current filters as query params
  const productsLink = useMemo(() => {
    const params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery);
    if (selectedCategory) params.set('category_id', selectedCategory);
    if (selectedCollection) params.set('collection_id', selectedCollection);
    if (sortBy) params.set('order', mapSortToMedusaOrder(sortBy));
    params.set('page', String(currentPage));
    params.set('limit', String(PRODUCTS_PER_PAGE));

    const qs = params.toString();
    return qs ? `/products?${qs}` : '/products';
  }, [searchQuery, selectedCategory, selectedCollection, sortBy, currentPage]);

  // Sync the current filter state back into the browser URL so links are shareable
  const router = useRouter();
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery);
    if (selectedCategory) params.set('category_id', selectedCategory);
    if (selectedCollection) params.set('collection_id', selectedCollection);
    if (sortBy) params.set('order', mapSortToMedusaOrder(sortBy));
    params.set('page', String(currentPage));
    params.set('limit', String(PRODUCTS_PER_PAGE));

    const qs = params.toString();
    const url = qs ? `/products?${qs}` : '/products';

    // Replace the URL without adding a history entry
    router.replace(url);
  }, [searchQuery, selectedCategory, selectedCollection, sortBy, currentPage, router]);

  // Fetch categories and collections when component mounts
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await sdk.client.fetch('/store/product-categories');
        const cats = (res as any)?.product_categories || [];
        setCategories(cats.map((c: any) => ({ id: c.id, name: c.name, handle: c.handle })));
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      }
    };

    const fetchCollections = async () => {
      try {
        const res = await sdk.client.fetch('/store/collections');
        const cols = (res as any)?.collections || [];
        setCollections(
          cols.map((c: any) => ({ id: c.id, title: c.title || c.handle || c.name || c.id }))
        );
      } catch (error) {
        console.error('Failed to fetch collections:', error);
      }
    };

    fetchCategories();
    fetchCollections();
  }, []);

  // Resolve category name/handle to ID when categories are loaded
  useEffect(() => {
    if (!searchParams || categories.length === 0) return;

    const categoryParam = searchParams.get('category') || searchParams.get('category_id');
    if (!categoryParam) return;

    // Check if the parameter is already a valid ID
    const existingCategory = categories.find(c => c.id === categoryParam);
    if (existingCategory) {
      setSelectedCategory(categoryParam);
      return;
    }

    // Try to find category by name or handle
    const matchedCategory = categories.find(
      c => c.name.toLowerCase() === categoryParam.toLowerCase() || 
           (c.handle && c.handle.toLowerCase() === categoryParam.toLowerCase())
    );

    if (matchedCategory) {
      setSelectedCategory(matchedCategory.id);
    }
  }, [searchParams, categories]);

  // Fetch products whenever filters or page change
  useEffect(() => {
    let isMounted = true;

    const fetchProducts = async () => {
      setLoading(true);
      try {
        const regionId = await currentRegionId();

        // Build query parameters for the API call
        const queryParams: any = {
          fields: '*variants.calculated_price,*images',
          region_id: regionId || 'reg_01KG7SV2397XGKJH3R85K7T1NJ',
          limit: PRODUCTS_PER_PAGE,
          offset: (currentPage - 1) * PRODUCTS_PER_PAGE,
        };

        // Add search query
        if (searchQuery) {
          queryParams.q = searchQuery;
        }

        // Add category filter
        if (selectedCategory) {
          queryParams.category_id = [selectedCategory];
        }

        // Add collection filter
        if (selectedCollection) {
          queryParams.collection_id = [selectedCollection];
        }

        // Add sorting
        if (sortBy) {
          queryParams.order = mapSortToMedusaOrder(sortBy);
        }

        console.log('Fetching products with params:', queryParams);
        const response = await sdk.store.product.list(queryParams);
        console.log('Products response:', response);
        // Support multiple possible response shapes
        let fetchedProducts: Product[] = [];
        let total = 0;

        if (response?.products) {
          fetchedProducts = response.products;
          total = response.count ?? response.total ?? fetchedProducts.length;
        } else if (Array.isArray(response)) {
          fetchedProducts = response as Product[];
          total = fetchedProducts.length;
        } else if (response?.data?.products) {
          fetchedProducts = response.data.products;
          total = response.data.count ?? fetchedProducts.length;
        }

        if (isMounted) {
          // Map to frontend-friendly fields
          setProducts(
            fetchedProducts.map((p) => ({
              ...p,
              image: p.thumbnail || p.images?.[0]?.url || PLACEHOLDER_IMAGE,
              price:
                p.variants?.[0]?.calculated_price?.calculated_amount !== undefined
                  ? p.variants[0].calculated_price.calculated_amount
                  : p.variants?.[0]?.prices?.[0]?.amount !== undefined
                    ? p.variants[0].prices[0].amount / 100
                    : (p.price ?? 0),
              originalPrice:
                p.variants?.[0]?.calculated_price?.original_amount !== undefined
                  ? p.variants[0].calculated_price.original_amount
                  : undefined,
              reviewCount: p.reviews?.length ?? p.reviewCount ?? 0,
              isFeatured: p.tags?.some((t: any) => t.value === 'featured') ?? false,
            }))
          );

          setTotalPages(
            Math.max(1, Math.ceil((total || fetchedProducts.length) / PRODUCTS_PER_PAGE))
          );
        }
      } catch (error) {
        console.error('Failed to fetch products:', error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchProducts();

    return () => {
      isMounted = false;
    };
  }, [searchQuery, selectedCategory, selectedCollection, sortBy, currentPage]);

  const breadcrumbItems = [
    { title: 'Home', href: '/' },
    { title: 'Products', href: productsLink },
  ].map((item, index) => (
    <Anchor component={Link} href={item.href} key={index} size="sm">
      {item.title}
    </Anchor>
  ));

  return (
    <Container size="xl" py="md">
      <Stack gap="lg">
        {/* Breadcrumbs */}
        <Breadcrumbs>{breadcrumbItems}</Breadcrumbs>

        {/* Page Header */}
        <Stack gap="xs">
          <Title order={1}>All Products</Title>
        </Stack>

        {/* Search Bar - Hidden on medium and larger screens */}
        <SearchBar 
          value={searchQuery} 
          onChange={setSearchQuery}
          maxWidth="400px" 
          hiddenFrom="md" 
        />

        {/* Filters (full width) */}
        <FilterSort
          sortBy={sortBy}
          onSortChange={setSortBy}
          category={selectedCategory}
          onCategoryChange={setCategory}
          collection={selectedCollection}
          onCollectionChange={setSelectedCollection}
          categoryOptions={[
            { value: '', label: 'All Categories' },
            ...categories.map((c) => ({ value: c.id, label: c.name })),
          ]}
          collectionOptions={[
            { value: '', label: 'All Collections' },
            ...collections.map((c) => ({ value: c.id, label: c.title })),
          ]}
          onClearFilters={handleClearFilters}
        />

        <Grid>
          {/* Products Grid - full width */}
          <Grid.Col span={{ base: 12 }}>
            <ProductGrid
              products={products.map((product) => ({
                ...product,
                image: product.image,
                isFeatured: product.isFeatured || false,
              }))}
              loading={loading}
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </Grid.Col>
        </Grid>
      </Stack>
    </Container>
  );
}
