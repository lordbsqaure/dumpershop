export interface ProductImage {
  id?: string;
  url?: string;
  width?: number;
  height?: number;
}

export interface ProductPrice {
  amount: number;
  currency_code?: string;
}

export interface ProductVariant {
  id?: string;
  title?: string;
  sku?: string;
  calculated_price?: {
    calculated_amount?: number;
    original_amount?: number;
  };
  prices?: Array<{
    amount: number;
    currency_code?: string;
  }>;
}

export interface Product {
  id: string;
  title: string;
  description?: string;
  thumbnail?: string;
  images?: ProductImage[];
  variants?: ProductVariant[];
  rating?: number;
  reviews?: any[]; // keep it flexible for now
  reviewCount?: number;
  // Frontend-friendly computed fields
  price?: number;
  originalPrice?: number;
  image?: string; // shortcut for the main image url
  isOnSale?: boolean;
  isNew?: boolean;
  isFeatured?: boolean;

  // Allow additional fields from the API
  [key: string]: any;
}
