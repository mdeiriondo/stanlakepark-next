import { Suspense } from 'react';
import ProductGrid from '@/components/shop/ProductGrid';
import CategoryFilter from '@/components/shop/CategoryFilter';
import TagCloud from '@/components/shop/TagCloud';
import SortSelect from '@/components/shop/SortSelect';
import PriceFilterInline from '@/components/shop/PriceFilterInline';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import PageHero from '@/components/layout/PageHero';
import ShopGridSkeleton from '@/components/shop/ShopGridSkeleton';
import { getCachedProductsList } from '@/lib/shop-cache';

export const metadata = {
  title: 'Shop | Stanlake Park Wine Estate',
  description: 'Explore our collection of award-winning English wines',
};

// Forzar renderizado dinámico para evitar caché en Vercel
export const dynamic = 'force-dynamic';
export const revalidate = 0;

type SearchParams = {
  category?: string;
  tag?: string;
  min_price?: string;
  max_price?: string;
  orderby?: string;
  order?: string;
};

const PER_PAGE = 24;

async function fetchShopData(params: SearchParams) {
  try {
    const result = await getCachedProductsList({
      category: params.category,
      tag: params.tag,
      min_price: params.min_price,
      max_price: params.max_price,
      orderby: params.orderby || 'menu_order',
      order: params.order || 'asc',
      page: 1,
      per_page: PER_PAGE,
    });

    // Calcular rango de precios
    const prices = (result.products as { price?: string; regular_price?: string }[])
      .map((p) => parseFloat(String((p.price ?? p.regular_price ?? '0')).replace(',', '.')))
      .filter((n) => !Number.isNaN(n) && n >= 0);
    const price_range =
      result.priceRange ??
      (prices.length > 0
        ? { min: Math.min(...prices), max: Math.max(...prices) }
        : result.products.length > 0
          ? { min: 0, max: 100 }
          : null);

    return {
      products: result.products ?? [],
      price_range,
      total: result.total ?? 0,
      totalPages: result.totalPages ?? 1,
    };
  } catch (error) {
    console.error('Error fetching shop data:', error);
    return { products: [], price_range: null, total: 0, totalPages: 1 };
  }
}

async function ShopContent({ params }: { params: SearchParams }) {
  const { products, price_range, total, totalPages } = await fetchShopData(params);
  return (
    <>
      <aside className="lg:col-span-1 space-y-6">
        <Suspense fallback={<div className="h-64 bg-gray-100 rounded animate-pulse" />}>
          <CategoryFilter />
        </Suspense>
        <TagCloud />
      </aside>
      <div className="lg:col-span-3">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <SortSelect />
          <PriceFilterInline priceRange={price_range} />
        </div>
        <ProductGrid
            key={[params.category, params.tag, params.min_price, params.max_price, params.orderby, params.order].filter(Boolean).join('-') || 'all'}
            category={params.category}
            tag={params.tag}
            minPrice={params.min_price}
            maxPrice={params.max_price}
            orderby={params.orderby}
            order={params.order}
            initialProducts={products}
            initialTotal={total}
            initialTotalPages={totalPages}
          />
      </div>
    </>
  );
}

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  
  // Debug: Log params en producción para verificar que se están leyendo correctamente
  if (process.env.NODE_ENV === 'production') {
    console.log('[ShopPage] searchParams recibidos:', params);
  }

  return (
    <main className="min-h-screen bg-white">
      <Navbar mode="winery" />

      <PageHero
        title="Wine Shop"
        subtitle="Award-winning English wines from our vineyard in Berkshire"
        image="https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?q=80&w=2670&auto=format&fit=crop"
      />

      {/* Main Shop: una sola carga para productos + price_range (slider) */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <Suspense fallback={<ShopGridSkeleton />}>
            <ShopContent params={params} />
          </Suspense>
        </div>
      </div>

      <Footer />
    </main>
  );
}
