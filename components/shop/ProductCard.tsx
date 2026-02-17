'use client';

import Image from 'next/image';
import Link from 'next/link';

interface ProductCardProps {
  product: {
    id: number;
    slug: string;
    name: string;
    price?: string;
    price_html?: string;
    images?: { src: string }[];
    stock_status?: string;
    categories?: { name: string }[];
  };
}

export default function ProductCard({ product }: ProductCardProps) {
  const image = product.images?.[0];
  const priceRange = product.price_html
    ?.match(/£([\d.]+)/g)
    ?.map((p: string) => parseFloat(p.replace('£', '')));
  const isOutOfStock = product.stock_status === 'outofstock';

  return (
    <Link
      href={`/shop/${product.slug}`}
      className={`group block ${isOutOfStock ? 'pointer-events-auto' : ''}`}
    >
      <div
        className={`relative aspect-[3/4] bg-gray-100 rounded-lg overflow-hidden mb-4 ${
          isOutOfStock
            ? 'grayscale opacity-75 contrast-90'
            : ''
        }`}
      >
        {image ? (
          <Image
            src={image.src}
            alt={product.name}
            fill
            className={`object-cover transition-transform duration-300 ${
              isOutOfStock ? '' : 'group-hover:scale-105'
            }`}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            No image
          </div>
        )}

        {isOutOfStock && (
          <div className="absolute top-4 right-4 bg-gray-600 text-white px-3 py-1 rounded text-sm font-bold uppercase tracking-wider">
            Out of stock
          </div>
        )}
      </div>

      <h3
        className={`font-serif text-xl mb-2 transition-colors ${
          isOutOfStock
            ? 'text-gray-500'
            : 'text-dark group-hover:text-brand'
        }`}
      >
        {product.name}
      </h3>

      <div className={`text-lg ${isOutOfStock ? 'text-gray-500' : 'text-dark'}`}>
        {priceRange && priceRange.length > 1 ? (
          <span>
            £{priceRange[0].toFixed(2)} - £{priceRange[1].toFixed(2)}
          </span>
        ) : (
          <span>£{parseFloat(product.price ?? '0').toFixed(2)}</span>
        )}
      </div>

      {product.categories?.[0] && (
        <p className={`text-sm mt-1 uppercase tracking-wider ${isOutOfStock ? 'text-gray-400' : 'text-gray-500'}`}>
          {product.categories[0].name}
        </p>
      )}
    </Link>
  );
}
