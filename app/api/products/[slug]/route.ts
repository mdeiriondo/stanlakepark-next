import { NextResponse } from 'next/server';
import { getCachedProductBySlug } from '@/lib/shop-cache';

export async function GET(
  _request: Request,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await context.params;
    const result = await getCachedProductBySlug(slug);

    if (!result) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    const res = NextResponse.json({
      success: true,
      product: result.product,
      variations: result.variations,
    });
    res.headers.set(
      'Cache-Control',
      'private, max-age=86400, s-maxage=86400'
    );
    return res;
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    );
  }
}
