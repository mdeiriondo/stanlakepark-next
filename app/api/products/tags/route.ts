import { NextResponse } from 'next/server';
import getWooCommerce from '@/lib/woocommerce';

export async function GET() {
  try {
    const WooCommerce = getWooCommerce();
    const response = await WooCommerce.get('products/tags', {
      per_page: 100,
      hide_empty: true,
      orderby: 'name',
      order: 'asc',
    });

    const data = (response.data as { id: number; name: string; slug: string; count?: number }[]) ?? [];

    return NextResponse.json({
      success: true,
      tags: data,
    });
  } catch (error) {
    console.error('Error fetching product tags:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch tags' },
      { status: 500 }
    );
  }
}
