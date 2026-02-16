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

interface ProductCategory {
  id: number;
  slug?: string;
  [key: string]: unknown;
}

interface MetaDataItem {
  key?: string;
  value?: string;
  [key: string]: unknown;
}

interface WooProduct {
  categories?: ProductCategory[];
  meta_data?: MetaDataItem[];
  [key: string]: unknown;
}

function isTribeTicket(product: WooProduct): boolean {
  return (product.meta_data ?? []).some(
    (m: MetaDataItem) => m.key === '_tribe_wooticket_for_event'
  );
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const params: Record<string, string | number> = {
    per_page: parseInt(searchParams.get('per_page') || '12'),
    page: parseInt(searchParams.get('page') || '1'),
    status: 'publish',
    stock_status: 'instock',
  };

  let category = searchParams.get('category');
  if (category) {
    const categoryNum = parseInt(category, 10);
    if (Number.isNaN(categoryNum)) {
      params.category = category;
    } else {
      params.category = categoryNum;
    }
  }

  const minPrice = searchParams.get('min_price');
  const maxPrice = searchParams.get('max_price');
  if (minPrice) params.min_price = minPrice;
  if (maxPrice) params.max_price = maxPrice;

  const search = searchParams.get('search');
  if (search) params.search = search;

  const orderby = searchParams.get('orderby') || 'menu_order';
  const order = searchParams.get('order') || 'asc';
  params.orderby = orderby;
  params.order = order;

  try {
    const WooCommerce = getWooCommerce();

    if (category && Number.isNaN(parseInt(category, 10))) {
      const catResponse = await WooCommerce.get('products/categories', {
        slug: category,
        per_page: 1,
      });
      const cats = (catResponse.data as { id: number }[]) ?? [];
      if (cats.length > 0) {
        params.category = cats[0].id;
      }
    }

    const response = await WooCommerce.get('products', params);
    const data = (response.data as WooProduct[]) ?? [];

    const filteredProducts = data.filter((product: WooProduct) => {
      if (isTribeTicket(product)) return false;
      if (!product.categories || product.categories.length === 0) {
        return false;
      }
      const hasExcludedCategory = product.categories.some((cat: ProductCategory) =>
        EXCLUDED_CATEGORY_SLUGS.includes(cat.slug ?? '')
      );
      return !hasExcludedCategory;
    });

    const perPage = Number(params.per_page);
    return NextResponse.json({
      success: true,
      products: filteredProducts,
      total: filteredProducts.length,
      totalPages: Math.ceil(filteredProducts.length / perPage) || 1,
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}
