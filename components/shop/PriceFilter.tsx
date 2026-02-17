'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useState } from 'react';

export default function PriceFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [min, setMin] = useState(searchParams.get('min_price') ?? '');
  const [max, setMax] = useState(searchParams.get('max_price') ?? '');

  const apply = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (min) params.set('min_price', min);
    else params.delete('min_price');
    if (max) params.set('max_price', max);
    else params.delete('max_price');
    params.delete('page');
    router.push(`/shop?${params.toString()}`);
  }, [min, max, router, searchParams]);

  return (
    <div className="bg-white border border-gray-100 rounded-lg shadow-sm p-6">
      <h3 className="font-serif text-xl text-dark mb-4">Filter by price</h3>
      <div className="flex flex-wrap items-center gap-3">
        <input
          type="number"
          min="0"
          step="0.01"
          placeholder="Min £"
          value={min}
          onChange={(e) => setMin(e.target.value)}
          className="w-24 px-3 py-2 border border-gray-200 rounded text-sm"
        />
        <span className="text-gray-400">–</span>
        <input
          type="number"
          min="0"
          step="0.01"
          placeholder="Max £"
          value={max}
          onChange={(e) => setMax(e.target.value)}
          className="w-24 px-3 py-2 border border-gray-200 rounded text-sm"
        />
        <button
          type="button"
          onClick={apply}
          className="px-4 py-2 text-sm font-medium rounded transition-colors"
          style={{
            backgroundColor: 'var(--color-brand)',
            color: 'white',
          }}
        >
          Filter
        </button>
      </div>
    </div>
  );
}
