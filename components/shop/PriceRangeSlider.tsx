'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

interface PriceRangeSliderProps {
  /** Min y max del resultado actual (precios en GBP). Si null, no se muestra el slider. */
  priceRange: { min: number; max: number } | null;
}

export default function PriceRangeSlider({ priceRange }: PriceRangeSliderProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlMin = searchParams.get('min_price');
  const urlMax = searchParams.get('max_price');

  const [minVal, setMinVal] = useState(
    urlMin ? parseFloat(urlMin) : priceRange?.min ?? 0
  );
  const [maxVal, setMaxVal] = useState(
    urlMax ? parseFloat(urlMax) : priceRange?.max ?? 100
  );

  const min = priceRange?.min ?? 0;
  const max = priceRange?.max ?? 100;

  useEffect(() => {
    if (!priceRange) return;
    setMinVal(urlMin ? parseFloat(urlMin) : priceRange.min);
    setMaxVal(urlMax ? parseFloat(urlMax) : priceRange.max);
  }, [priceRange, urlMin, urlMax]);

  const apply = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (minVal > min) params.set('min_price', minVal.toFixed(2));
    else params.delete('min_price');
    if (maxVal < max) params.set('max_price', maxVal.toFixed(2));
    else params.delete('max_price');
    params.delete('page');
    router.push(`/shop?${params.toString()}`);
  }, [minVal, maxVal, min, max, router, searchParams]);

  // Si no hay rango o min === max (un solo precio), no mostrar slider (el padre mostrará inputs)
  if (!priceRange || max <= min) return null;

  return (
    <div className="bg-white border border-gray-100 rounded-lg shadow-sm p-6">
      <h3 className="font-serif text-xl text-dark mb-4">Filter by price</h3>
      <div className="space-y-4">
        <div className="flex gap-2 items-center">
          <input
            type="range"
            min={min}
            max={max}
            step="0.5"
            value={minVal}
            onChange={(e) =>
              setMinVal(Math.min(parseFloat(e.target.value), maxVal - 0.5))
            }
            className="flex-1 h-2 rounded-lg appearance-none bg-gray-200 [accent-color:var(--color-brand)]"
          />
          <input
            type="range"
            min={min}
            max={max}
            step="0.5"
            value={maxVal}
            onChange={(e) =>
              setMaxVal(Math.max(parseFloat(e.target.value), minVal + 0.5))
            }
            className="flex-1 h-2 rounded-lg appearance-none bg-gray-200 [accent-color:var(--color-brand)]"
          />
        </div>
        <div className="flex justify-between text-sm text-gray-600">
          <span>£{minVal.toFixed(2)}</span>
          <span>£{maxVal.toFixed(2)}</span>
        </div>
        <button
          type="button"
          onClick={apply}
          className="w-full px-4 py-2 text-sm font-medium rounded transition-colors"
          style={{
            backgroundColor: 'var(--color-brand)',
            color: 'white',
          }}
        >
          Apply
        </button>
      </div>
    </div>
  );
}
