import { NextResponse } from 'next/server';
import { getCachedProductBySlug } from '@/lib/shop-cache';

// Forzar renderizado dinámico para evitar caché en Vercel
export const dynamic = 'force-dynamic';
export const revalidate = 0;

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
      'no-store, no-cache, must-revalidate, proxy-revalidate'
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
