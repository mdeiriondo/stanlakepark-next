'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

interface PriceFilterInlineProps {
  /** Min y max de los productos que se están visualizando en la página. */
  priceRange: { min: number; max: number } | null;
}

export default function PriceFilterInline({ priceRange }: PriceFilterInlineProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlMin = searchParams.get('min_price');
  const urlMax = searchParams.get('max_price');

  const min = priceRange?.min ?? 0;
  const max = Math.max(priceRange?.max ?? 100, min + 0.5);

  const [minVal, setMinVal] = useState(urlMin ? parseFloat(urlMin) : min);
  const [maxVal, setMaxVal] = useState(urlMax ? parseFloat(urlMax) : max);

  useEffect(() => {
    if (!priceRange) return;
    setMinVal(urlMin ? parseFloat(urlMin) : min);
    setMaxVal(urlMax ? parseFloat(urlMax) : max);
  }, [priceRange, urlMin, urlMax, min, max]);

  const apply = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('min_price', minVal.toFixed(2));
    params.set('max_price', maxVal.toFixed(2));
    params.delete('page');
    router.push(`/shop?${params.toString()}`);
  }, [minVal, maxVal, router, searchParams]);

  // Siempre mostrar el filtro: si hay rango válido usamos slider; si no, inputs con rango por defecto
  const hasRange = priceRange && max > min;
  const rangeMin = hasRange ? min : 0;
  const rangeMax = hasRange ? max : 200;

  return (
    <div className="flex flex-wrap items-center gap-3">
      <span className="text-sm text-gray-600 whitespace-nowrap">Price</span>
      <div className="flex items-center gap-2 min-w-[140px]">
        <input
          type="range"
          min={rangeMin}
          max={rangeMax}
          step="0.5"
          value={Math.max(rangeMin, Math.min(minVal, rangeMax))}
          onChange={(e) =>
            setMinVal(Math.min(parseFloat(e.target.value), maxVal - 0.5))
          }
          className="w-20 sm:w-28 h-2 rounded-lg appearance-none bg-gray-200 [accent-color:var(--color-brand)]"
          aria-label="Precio mínimo"
        />
        <input
          type="range"
          min={rangeMin}
          max={rangeMax}
          step="0.5"
          value={Math.min(rangeMax, Math.max(maxVal, rangeMin + 0.5))}
          onChange={(e) =>
            setMaxVal(Math.max(parseFloat(e.target.value), minVal + 0.5))
          }
          className="w-20 sm:w-28 h-2 rounded-lg appearance-none bg-gray-200 [accent-color:var(--color-brand)]"
          aria-label="Precio máximo"
        />
      </div>
      <span className="text-sm text-gray-600 whitespace-nowrap">
        £{minVal.toFixed(2)} – £{maxVal.toFixed(2)}
      </span>
      <button
        type="button"
        onClick={apply}
        className="px-3 py-1.5 text-sm font-medium rounded whitespace-nowrap"
        style={{
          backgroundColor: 'var(--color-brand)',
          color: 'white',
        }}
      >
        Filter
      </button>
    </div>
  );
}
