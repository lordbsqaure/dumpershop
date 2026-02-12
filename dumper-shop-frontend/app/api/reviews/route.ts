import { NextRequest, NextResponse } from 'next/server';
import Medusa from '@medusajs/js-sdk';

const MEDUSA_BACKEND_URL =
  process.env.MEDUSA_BACKEND_URL || process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || 'http://localhost:9000';

const ADMIN_API_KEY = process.env.MEDUSA_ADMIN_API_KEY;

if (!ADMIN_API_KEY) {
  // This will only log on the server; frontend won't see it.
  console.warn(
    '[reviews api] MEDUSA_ADMIN_API_KEY is not set. Review submissions will fail until it is configured.'
  );
}

const adminSdk = new Medusa({
  baseUrl: MEDUSA_BACKEND_URL,
  debug: process.env.NODE_ENV === 'development',
  auth: {
    type: 'api-key',
    apiKey: ADMIN_API_KEY || '',
  },
});

export async function POST(req: NextRequest) {
  try {
    if (!ADMIN_API_KEY) {
      return NextResponse.json(
        { message: 'Server misconfiguration: MEDUSA_ADMIN_API_KEY is not set.' },
        { status: 500 }
      );
    }

    const body = await req.json();
    const { productId, rating, comment, userName } = body || {};

    if (!productId || !rating || !comment) {
      return NextResponse.json(
        { message: 'productId, rating and comment are required.' },
        { status: 400 }
      );
    }

    const safeUserName = userName && typeof userName === 'string' ? userName.trim() : 'Anonymous';

    // Get current metadata (including any existing reviews)
    const {
      product,
    } = await adminSdk.admin.product.retrieve(productId, {
      fields: 'id,metadata',
    });

    const existingMetadata = (product.metadata || {}) as Record<string, any>;
    const existingReviews = Array.isArray(existingMetadata.reviews)
      ? existingMetadata.reviews
      : [];

    const newReview = {
      id: `rev_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      userName: safeUserName,
      rating,
      comment,
      date: new Date().toISOString(),
      verified: false,
    };

    const updatedReviews = [newReview, ...existingReviews];

    const {
      product: updatedProduct,
    } = await adminSdk.admin.product.update(productId, {
      metadata: {
        ...existingMetadata,
        reviews: updatedReviews,
      },
    });

    return NextResponse.json(
      {
        message: 'Review created',
        review: newReview,
        reviews: updatedReviews,
        productId: updatedProduct.id,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('[reviews api] Failed to create review', error);
    return NextResponse.json(
      { message: 'Failed to create review', error: error?.message || 'Unknown error' },
      { status: 500 }
    );
  }
}







