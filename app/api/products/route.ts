import { NextResponse } from 'next/server';
import { getCachedProductsList } from '@/lib/shop-cache';

// Forzar renderizado dinámico para evitar caché en Vercel
export const dynamic = 'force-dynamic';
export const revalidate = 0;

const DEFAULT_PER_PAGE = 12;
const DEFAULT_PER_PAGE_ALL = 24;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const category = searchParams.get('category');
  const tag = searchParams.get('tag');
  const perPageParam = parseInt(searchParams.get('per_page') || '', 10);
  const pageParam = parseInt(searchParams.get('page') || '1', 10);

  const params = {
    category: category ?? undefined,
    tag: tag ?? undefined,
    min_price: searchParams.get('min_price') ?? undefined,
    max_price: searchParams.get('max_price') ?? undefined,
    search: searchParams.get('search') ?? undefined,
    page: pageParam,
    per_page: category
      ? (Number.isNaN(perPageParam) ? DEFAULT_PER_PAGE : Math.min(100, perPageParam))
      : (Number.isNaN(perPageParam) ? DEFAULT_PER_PAGE_ALL : Math.min(100, perPageParam)),
    orderby: searchParams.get('orderby') || 'menu_order',
    order: searchParams.get('order') || 'asc',
  };

  try {
    const result = await getCachedProductsList(params);

    // Rango de precios: usar el del backend si viene (lista completa) o calcular de la página actual
    const price_range =
      result.priceRange ??
      (() => {
        const prices = (result.products as { price?: string; regular_price?: string }[])
          .map((p) => parseFloat(String((p.price ?? p.regular_price ?? '0')).replace(',', '.')))
          .filter((n) => !Number.isNaN(n) && n >= 0);
        return prices.length > 0
          ? { min: Math.min(...prices), max: Math.max(...prices) }
          : result.products.length > 0
            ? { min: 0, max: 100 }
            : null;
      })();

    const res = NextResponse.json({
      success: true,
      products: result.products,
      total: result.total,
      totalPages: result.totalPages,
      price_range,
    });
    res.headers.set(
      'Cache-Control',
      'no-store, no-cache, must-revalidate, proxy-revalidate'
    );
    return res;
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}
