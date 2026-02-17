'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

interface Category {
  id: number;
  slug?: string;
  name?: string;
}

/** Slugs de categorías que son vinos (jerarquía principal en el sidebar). */
const WINE_CATEGORY_SLUGS = [
  'english-sparkling-wine',
  'english-white-wine',
  'english-rose-wine',
  'english-red-wine',
  'italian-wine-collection',
];
/** Slug que no mostramos en Gifts & more (es el enlace a /tours). */
const TOURS_SLUG = 'wine-tours';

function decodeName(name: string | undefined): string {
  return (name ?? '').replace(/&amp;/g, '&');
}

export default function CategoryFilter() {
  const [categories, setCategories] = useState<Category[]>([]);
  const searchParams = useSearchParams();
  const currentCategory = searchParams.get('category');

  useEffect(() => {
    async function fetchCategories() {
      const res = await fetch('/api/products/categories');
      const data = await res.json();
      if (data.success) {
        setCategories(data.categories ?? []);
      }
    }
    fetchCategories();
  }, []);

  const wineCategories = categories.filter((c) =>
    WINE_CATEGORY_SLUGS.includes((c.slug ?? '').toLowerCase())
  );
  const otherCategories = categories.filter(
    (c) =>
      !WINE_CATEGORY_SLUGS.includes((c.slug ?? '').toLowerCase()) &&
      (c.slug ?? '').toLowerCase() !== TOURS_SLUG
  );

  const isActive = (slug: string) =>
    (currentCategory ?? '') === slug ||
    (currentCategory?.toLowerCase() === (slug || '').toLowerCase());

  const linkClass = (slug: string) =>
    `block py-2 text-dark hover:text-brand transition-colors ${
      isActive(slug) ? 'text-brand font-medium' : ''
    }`;

  return (
    <div className="bg-white border border-gray-100 rounded-lg shadow-sm p-6 space-y-8">
      <h3 className="font-serif text-2xl text-dark mb-4">Categories</h3>

      <div className="space-y-2">
        <Link href="/shop" className={linkClass('')}>
          All Products
        </Link>
      </div>

      {/* Wines: jerarquía principal */}
      {wineCategories.length > 0 && (
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">
            Wines
          </p>
          <div className="space-y-1">
            {wineCategories.map((category) => (
              <Link
                key={category.id}
                href={`/shop?category=${encodeURIComponent(category.slug ?? String(category.id))}`}
                className={`${linkClass(category.slug ?? String(category.id))} pl-0`}
              >
                {decodeName(category.name)}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Wine Tours → /tours (nunca se marca como activo en /shop) */}
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">
          Experiences
        </p>
        <Link
          href="/tours"
          className="block py-2 text-dark hover:text-brand transition-colors"
        >
          Wine Tours
        </Link>
      </div>

      {/* Gifts & more: jerarquía secundaria */}
      {otherCategories.length > 0 && (
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">
            Gifts & more
          </p>
          <div className="space-y-1">
            {otherCategories.map((category) => {
              const slug = category.slug ?? String(category.id);
              return (
                <Link
                  key={category.id}
                  href={`/shop?category=${encodeURIComponent(slug)}`}
                  className={`${linkClass(slug)} pl-0 ${!isActive(slug) ? 'text-gray-600' : ''}`}
                >
                  {decodeName(category.name)}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
