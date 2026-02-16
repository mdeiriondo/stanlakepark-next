import { NextResponse } from 'next/server';
import getWooCommerce from '@/lib/woocommerce';

const EXCLUDED_CATEGORY_SLUGS = [
  'bookings',
  'experiences-booking',
  'wine-tour-tasting-booking',
  'wine-cheese-tour-booking',
  'wine-cheese-tour',
  'wine-cream-tea-tour-booking',
  'wine-cheese-tasting-booking',
  'special-events-booking',
  'special-tastings-booking',
  'work-from-vineyard-booking',
  'wset-courses-booking',
  'wine-bar',
  'uncategorised',
];

interface CategoryItem {
  id: number;
  slug?: string;
  [key: string]: unknown;
}

export async function GET() {
  try {
    const WooCommerce = getWooCommerce();
    const response = await WooCommerce.get('products/categories', {
      per_page: 100,
      hide_empty: true,
      orderby: 'name',
      order: 'asc',
    });

    const data = (response.data as CategoryItem[]) ?? [];
    const validCategories = data.filter(
      (cat: CategoryItem) => !EXCLUDED_CATEGORY_SLUGS.includes(cat.slug ?? '')
    );

    return NextResponse.json({
      success: true,
      categories: validCategories,
    });
  } catch (error: unknown) {
    console.error('Error fetching categories:', error);
    const err = error as { response?: { data?: { message?: string } }; message?: string };
    const details = err.response?.data?.message ?? err.message;
    return NextResponse.json(
      {
        error: 'Failed to fetch categories',
        ...(details && { details: String(details) }),
      },
      { status: 500 }
    );
  }
}
