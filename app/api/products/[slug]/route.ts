import { NextResponse } from 'next/server';
import getWooCommerce from '@/lib/woocommerce';

export async function GET(
  _request: Request,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await context.params;

    const WooCommerce = getWooCommerce();
    const response = await WooCommerce.get('products', {
      slug,
      status: 'publish',
    });

    if (!response.data || (response.data as unknown[]).length === 0) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    const product = (response.data as unknown[])[0] as {
      id: number;
      type?: string;
      [key: string]: unknown;
    };

    let variations: unknown[] = [];
    if (product.type === 'variable') {
      const variationsResponse = await WooCommerce.get(
        `products/${product.id}/variations`,
        { per_page: 100 }
      );
      variations = (variationsResponse.data as unknown[]) || [];
    }

    return NextResponse.json({
      success: true,
      product,
      variations,
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    );
  }
}
