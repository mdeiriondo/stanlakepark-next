'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import ProductCard from './ProductCard';

const PER_PAGE = 24;

interface ProductGridProps {
  category?: string;
  tag?: string;
  minPrice?: string;
  maxPrice?: string;
  orderby?: string;
  order?: string;
  initialProducts?: Record<string, unknown>[];
  initialTotal?: number;
  initialTotalPages?: number;
}

export default function ProductGrid({
  category,
  tag,
  minPrice,
  maxPrice,
  orderby,
  order,
  initialProducts = [],
  initialTotal = 0,
  initialTotalPages = 1,
}: ProductGridProps) {
  const [products, setProducts] = useState<Record<string, unknown>[]>(initialProducts);
  const [loading, setLoading] = useState(initialProducts.length === 0);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(initialTotal);
  const [totalPages, setTotalPages] = useState(initialTotalPages);
  const [loadingMore, setLoadingMore] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const initialRef = useRef(true);

  const hasMore = page < totalPages;

  const buildParams = useCallback(
    (pageNum: number) => {
      const params = new URLSearchParams();
      if (category) params.set('category', category);
      if (tag) params.set('tag', tag);
      if (minPrice) params.set('min_price', minPrice);
      if (maxPrice) params.set('max_price', maxPrice);
      if (orderby) params.set('orderby', orderby);
      if (order) params.set('order', order);
      params.set('page', String(pageNum));
      params.set('per_page', String(PER_PAGE));
      return params;
    },
    [category, tag, minPrice, maxPrice, orderby, order]
  );

  useEffect(() => {
    if (initialRef.current && initialProducts.length > 0) {
      initialRef.current = false;
      setPage(1);
      setTotal(initialTotal);
      setTotalPages(initialTotalPages);
      return;
    }
    setLoading(true);
    setPage(1);
    fetch(`/api/products?${buildParams(1).toString()}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setProducts(data.products ?? []);
          setTotal(data.total ?? 0);
          setTotalPages(data.totalPages ?? 1);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [category, tag, minPrice, maxPrice, orderby, order]);

  useEffect(() => {
    if (!hasMore || loadingMore) return;
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) return;
        const nextPage = page + 1;
        setLoadingMore(true);
        fetch(`/api/products?${buildParams(nextPage).toString()}`)
          .then((res) => res.json())
          .then((data) => {
            if (data.success && Array.isArray(data.products)) {
              setProducts((prev) => [...prev, ...(data.products ?? [])]);
              setPage(nextPage);
            }
          })
          .finally(() => setLoadingMore(false));
      },
      { rootMargin: '200px', threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, loadingMore, page, buildParams]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[1, 2, 3, 4, 5, 6].map((n) => (
          <div key={n} className="animate-pulse">
            <div className="bg-cream/50 aspect-[3/4] rounded-lg mb-4" />
            <div className="h-6 bg-cream/50 rounded mb-2" />
            <div className="h-4 bg-cream/50 rounded w-24" />
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-xl text-gray-600">No products found</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <p className="text-gray-500 text-sm uppercase tracking-wider">
          {products.length} of {total} products
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {products.map((product) => (
          <ProductCard
            key={String(product.id)}
            product={product as { id: number; slug: string; name: string; price?: string; price_html?: string; images?: { src: string }[]; stock_status?: string; categories?: { name: string }[] }}
          />
        ))}
      </div>

      {hasMore && (
        <div ref={sentinelRef} className="min-h-[120px] flex items-center justify-center py-8">
          {loadingMore && (
            <div className="flex gap-2" aria-hidden>
              <span className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: 'var(--color-brand)', animationDelay: '0ms' }} />
              <span className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: 'var(--color-brand)', animationDelay: '150ms' }} />
              <span className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: 'var(--color-brand)', animationDelay: '300ms' }} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
