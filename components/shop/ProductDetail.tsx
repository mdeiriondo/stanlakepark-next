'use client';

import { useState } from 'react';
import Image from 'next/image';
import VariationSelector from './VariationSelector';
import AddToCartButton from './AddToCartButton';

interface ProductDetailProps {
  product: {
    id: number;
    name: string;
    slug: string;
    type?: string;
    price?: string;
    short_description?: string;
    description?: string;
    images?: { src: string }[];
    categories?: { name: string }[];
    attributes?: { name: string; variation?: boolean }[];
  };
  variations: {
    id: number;
    price: string;
    stock_status?: string;
    attributes?: { option?: string }[];
  }[];
}

export default function ProductDetail({ product, variations }: ProductDetailProps) {
  const [selectedVariation, setSelectedVariation] = useState<
    (typeof variations)[0] | null
  >(null);
  const [quantity, setQuantity] = useState(1);

  const image = product.images?.[0];
  const hasVariations =
    String(product.type ?? '').toLowerCase() === 'variable' &&
    Array.isArray(variations) &&
    variations.length > 0;

  const currentPrice = selectedVariation
    ? parseFloat(selectedVariation.price)
    : parseFloat(product.price ?? '0');

  return (
    <div className="max-w-[1400px] mx-auto px-6 md:px-12 py-24 grid grid-cols-1 lg:grid-cols-12 gap-20">
      {/* Columna imagen + descripción */}
      <div className="lg:col-span-7">
        <div className="relative aspect-[3/4] bg-cream/30 rounded-lg overflow-hidden mb-12">
          {image ? (
            <Image
              src={image.src}
              alt={product.name}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              No image available
            </div>
          )}
        </div>

        {product.short_description && (
          <div
            className="prose prose-lg mb-8 max-w-none prose-p:text-gray-600 prose-p:leading-relaxed"
            dangerouslySetInnerHTML={{ __html: product.short_description }}
          />
        )}

        {product.description && (
          <div className="mt-12 pt-12 border-t border-gray-100">
            <h2 className="text-3xl font-serif text-dark mb-8">About this wine</h2>
            <div
              className="prose prose-lg max-w-none prose-p:text-gray-600 prose-p:leading-relaxed"
              dangerouslySetInnerHTML={{ __html: product.description }}
            />
          </div>
        )}
      </div>

      {/* Sidebar compra — mismo estilo que experiences */}
      <div className="lg:col-span-5 relative">
        <div className="lg:sticky lg:top-32 bg-white border border-gray-100 shadow-xl p-10 rounded-lg">
          {product.categories?.[0] && (
            <p className="text-brand text-[10px] font-bold uppercase tracking-widest mb-4">
              {product.categories[0].name}
            </p>
          )}

          <div className="flex justify-between items-baseline mb-2">
            <span className="text-3xl font-serif text-dark">
              £{currentPrice.toFixed(2)}
            </span>
          </div>
          <p className="text-gray-500 text-sm mb-6">Free shipping on orders over £100</p>

          {hasVariations && (
            <div className="mb-6">
              <VariationSelector
                product={product}
                variations={variations}
                selectedVariation={selectedVariation}
                onSelect={setSelectedVariation}
              />
            </div>
          )}

          <div className="mb-6">
            <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">
              Quantity
            </label>
            <input
              type="number"
              min={1}
              value={quantity}
              onChange={(e) =>
                setQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))
              }
              className="w-24 px-4 py-2 border border-gray-200 rounded focus:border-[var(--color-brand)] focus:outline-none"
            />
          </div>

          <AddToCartButton
            product={product}
            variation={selectedVariation}
            quantity={quantity}
            disabled={hasVariations && !selectedVariation}
          />
        </div>
      </div>
    </div>
  );
}
