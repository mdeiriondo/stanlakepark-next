/**
 * Caché del catálogo del shop. Solo se invalida cuando se llama a revalidateTag('shop-products').
 * Uso: webhook de WooCommerce o POST /api/revalidate-shop con secreto.
 */
import { unstable_cache } from 'next/cache';
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
  'wine-tours', // Experiencias/tours: enlace a /tours, no productos
];

const DEFAULT_PER_PAGE = 12;
const ALL_PRODUCTS_PER_PAGE = 100;
/** Sin categoría: seguir pidiendo páginas hasta tener al menos tantos productos (o hasta max páginas). */
const MIN_SHOP_PRODUCTS = 12;
const MAX_PAGES_FOR_ALL = 25;

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

export interface ProductsListParams {
  category?: string;
  categoryId?: number;
  tag?: string;
  min_price?: string;
  max_price?: string;
  search?: string;
  page?: number;
  per_page?: number;
  orderby?: string;
  order?: string;
}

export interface ProductsListResult {
  products: WooProduct[];
  total: number;
  totalPages: number;
  /** Rango de precios de la lista completa (para "All products" paginado) */
  priceRange?: { min: number; max: number };
}

async function fetchProductsListUncached(
  params: ProductsListParams
): Promise<ProductsListResult> {
  const WooCommerce = getWooCommerce();

  const wcParams: Record<string, string | number> = {
    per_page: params.category ?? params.categoryId
      ? (params.per_page ?? DEFAULT_PER_PAGE)
      : ALL_PRODUCTS_PER_PAGE,
    page: params.page ?? 1,
    status: 'publish',
    orderby: params.orderby ?? 'menu_order',
    order: params.order ?? 'asc',
  };

  if (params.categoryId) {
    wcParams.category = params.categoryId;
  } else if (params.category && !Number.isNaN(parseInt(params.category, 10))) {
    wcParams.category = parseInt(params.category, 10);
  } else if (params.category) {
    const catResponse = await WooCommerce.get('products/categories', {
      slug: params.category,
      per_page: 1,
    });
    const cats = (catResponse.data as { id: number }[]) ?? [];
    if (cats.length > 0) wcParams.category = cats[0].id;
  }
  if (params.tag) {
    const tagId = parseInt(params.tag, 10);
    if (!Number.isNaN(tagId)) wcParams.tag = tagId;
  }
  if (params.min_price) wcParams.min_price = params.min_price;
  if (params.max_price) wcParams.max_price = params.max_price;
  if (params.search) wcParams.search = params.search;

  const filterFn = (product: WooProduct) => {
    if (isTribeTicket(product)) return false;
    if (!product.categories || product.categories.length === 0) return true;
    // Incluir si tiene al menos una categoría que NO sea de bookings/tours
    const hasShopCategory = product.categories.some(
      (cat: ProductCategory) => !EXCLUDED_CATEGORY_SLUGS.includes((cat.slug ?? '').toLowerCase())
    );
    return hasShopCategory;
  };

  const filterByPrice = (product: WooProduct) => {
    const minP = params.min_price ? parseFloat(params.min_price) : NaN;
    const maxP = params.max_price ? parseFloat(params.max_price) : NaN;
    const price = parseFloat(String((product as { price?: string; regular_price?: string }).price ?? (product as { regular_price?: string }).regular_price ?? '0').replace(',', '.'));
    if (!Number.isNaN(minP) && price < minP) return false;
    if (!Number.isNaN(maxP) && price > maxP) return false;
    return true;
  };

  if (params.categoryId || params.category) {
    const data = (await WooCommerce.get('products', wcParams)).data as
      | WooProduct[]
      | undefined;
    const rawList = Array.isArray(data) ? data : [];
    const filtered = rawList.filter(filterFn).filter(filterByPrice);
    return {
      products: filtered,
      total: filtered.length,
      totalPages: 1,
    };
  }

  // Sin categoría ("All Products"): obtener IDs de categorías de tienda (no excluidas) y traer productos por categoría
  const catResponse = await WooCommerce.get('products/categories', {
    per_page: 100,
    hide_empty: false, // incluir todas para no perder categorías con productos en WooCommerce
  });
  const allCats = (catResponse.data as ProductCategory[]) ?? [];
  const shopCategoryIds = allCats
    .filter((c) => !EXCLUDED_CATEGORY_SLUGS.includes((c.slug ?? '').toLowerCase()))
    .map((c) => c.id)
    .filter((id) => id > 0);

  if (process.env.NODE_ENV === 'development') {
    console.log('[shop-cache] All products: categorías de tienda', shopCategoryIds.length, 'ids', shopCategoryIds.slice(0, 15));
  }

  if (shopCategoryIds.length === 0) {
    return { products: [], total: 0, totalPages: 1 };
  }

  const seenIds = new Set<number>();
  const merged: WooProduct[] = [];
  const perPage = 100;

  for (const categoryId of shopCategoryIds) {
    let page = 1;
    let hasMore = true;
    let categoryTotal = 0;
    while (hasMore && page <= MAX_PAGES_FOR_ALL) {
      const reqParams: Record<string, string | number> = {
        status: 'publish',
        orderby: params.orderby ?? 'menu_order',
        order: params.order ?? 'asc',
        category: categoryId,
        per_page: perPage,
        page,
      };
      if (params.min_price) reqParams.min_price = params.min_price;
      if (params.max_price) reqParams.max_price = params.max_price;
      if (params.tag) {
        const tagId = parseInt(params.tag, 10);
        if (!Number.isNaN(tagId)) reqParams.tag = tagId;
      }
      const data = (await WooCommerce.get('products', reqParams)).data as
        | WooProduct[]
        | undefined;
      const chunk = Array.isArray(data) ? data : [];
      if (chunk.length === 0) {
        hasMore = false;
        break;
      }
      for (const p of chunk) {
        const id = (p as { id?: number }).id;
        if (id != null && !seenIds.has(id) && filterFn(p) && filterByPrice(p)) {
          seenIds.add(id);
          merged.push(p);
        }
      }
      categoryTotal += chunk.length;
      hasMore = chunk.length >= perPage;
      page += 1;
    }
    if (process.env.NODE_ENV === 'development' && categoryTotal > 0) {
      console.log('[shop-cache] categoryId', categoryId, 'raw', categoryTotal, 'merged ahora', merged.length);
    }
  }

  if (process.env.NODE_ENV === 'development') {
    console.log('[shop-cache] All products: total merged', merged.length);
  }

  return {
    products: merged,
    total: merged.length,
    totalPages: 1,
  };
}

/** En local (development) la caché está deshabilitada para ver datos frescos de WooCommerce. */
const isCacheDisabled =
  process.env.NODE_ENV === 'development' ||
  process.env.DISABLE_SHOP_CACHE === '1';

const DEFAULT_PER_PAGE_ALL = 24;

/** Lista de productos: caché indefinida, se invalida solo con revalidateTag('shop-products'). En local no se cachea. */
export async function getCachedProductsList(
  params: ProductsListParams
): Promise<ProductsListResult> {
  const hasCategory = Boolean(params.category ?? params.categoryId);

  if (hasCategory) {
    if (isCacheDisabled) {
      return fetchProductsListUncached(params);
    }
    const key = JSON.stringify({
      c: params.category ?? params.categoryId ?? 'all',
      tag: params.tag ?? '',
      min: params.min_price ?? '',
      max: params.max_price ?? '',
      s: params.search ?? '',
      p: params.page ?? 1,
      pp: params.per_page ?? '',
      ob: params.orderby ?? '',
      o: params.order ?? '',
    });
    return unstable_cache(
      () => fetchProductsListUncached(params),
      ['shop-products-list', key],
      { tags: ['shop-products'], revalidate: false }
    )();
  }

  // "All products": cachear lista completa (sin page) y devolver página pedida
  const perPage = params.per_page ?? DEFAULT_PER_PAGE_ALL;
  const page = params.page ?? 1;

  const paramsForFull = { ...params, page: 1, per_page: 9999 };
  let fullResult: ProductsListResult;

  if (isCacheDisabled) {
    fullResult = await fetchProductsListUncached(paramsForFull);
  } else {
    const keyFull = JSON.stringify({
      c: 'all',
      tag: params.tag ?? '',
      min: params.min_price ?? '',
      max: params.max_price ?? '',
      s: params.search ?? '',
      ob: params.orderby ?? '',
      o: params.order ?? '',
    });
    fullResult = await unstable_cache(
      () => fetchProductsListUncached(paramsForFull),
      ['shop-products-list-full', keyFull],
      { tags: ['shop-products'], revalidate: false }
    )();
  }

  const total = fullResult.total;
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const start = (page - 1) * perPage;
  const products = fullResult.products.slice(start, start + perPage);

  const prices = (fullResult.products as { price?: string; regular_price?: string }[])
    .map((p) => parseFloat(String(p.price ?? p.regular_price ?? '0').replace(',', '.')))
    .filter((n) => !Number.isNaN(n) && n >= 0);
  const priceRange =
    prices.length > 0
      ? { min: Math.min(...prices), max: Math.max(...prices) }
      : undefined;

  return {
    products,
    total,
    totalPages,
    priceRange,
  };
}

export interface ProductBySlugResult {
  product: Record<string, unknown>;
  variations: unknown[];
}

async function fetchProductBySlugUncached(
  slug: string
): Promise<ProductBySlugResult | null> {
  const WooCommerce = getWooCommerce();
  const response = await WooCommerce.get('products', {
    slug,
    status: 'publish',
  });

  if (!response.data || (response.data as unknown[]).length === 0) {
    return null;
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

  return { product, variations };
}

/** Producto por slug: caché indefinida, se invalida con revalidateTag('shop-products'). En local no se cachea. */
export function getCachedProductBySlug(
  slug: string
): Promise<ProductBySlugResult | null> {
  if (isCacheDisabled) {
    return fetchProductBySlugUncached(slug);
  }
  return unstable_cache(
    () => fetchProductBySlugUncached(slug),
    ['shop-product', slug],
    { tags: ['shop-products'], revalidate: false }
  )();
}
