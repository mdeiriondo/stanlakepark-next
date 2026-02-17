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

export const metadata = {
  title: 'Shop | Stanlake Park Wine Estate',
  description: 'Explore our collection of award-winning English wines',
};

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
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? '';
  const search = new URLSearchParams();
  if (params.category) search.set('category', params.category);
  if (params.tag) search.set('tag', params.tag);
  if (params.min_price) search.set('min_price', params.min_price);
  if (params.max_price) search.set('max_price', params.max_price);
  if (params.orderby) search.set('orderby', params.orderby);
  if (params.order) search.set('order', params.order);
  search.set('page', '1');
  search.set('per_page', String(PER_PAGE));
  const url = base ? `${base}/api/products?${search}` : `/api/products?${search}`;
  try {
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) return { products: [], price_range: null, total: 0, totalPages: 1 };
    const data = await res.json();
    return {
      products: data.success ? data.products ?? [] : [],
      price_range: data.price_range ?? null,
      total: data.total ?? 0,
      totalPages: data.totalPages ?? 1,
    };
  } catch {
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
