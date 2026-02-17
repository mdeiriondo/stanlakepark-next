'use client';

import { useRouter, useSearchParams } from 'next/navigation';

const OPTIONS: { value: string; label: string; order?: string }[] = [
  { value: 'menu_order', label: 'Default sorting', order: 'asc' },
  { value: 'popularity', label: 'Sort by popularity', order: 'asc' },
  { value: 'date', label: 'Sort by latest', order: 'desc' },
  { value: 'price', label: 'Sort by price: low to high', order: 'asc' },
  { value: 'price-desc', label: 'Sort by price: high to low', order: 'desc' },
];

export default function SortSelect() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderby = searchParams.get('orderby') || 'menu_order';
  const order = searchParams.get('order') || 'asc';

  const currentValue =
    orderby === 'price-desc' ? 'price-desc' : orderby;
  const currentOrder =
    orderby === 'price-desc' ? 'desc' : orderby === 'price' ? 'asc' : order;

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const v = e.target.value;
    const opt = OPTIONS.find((o) => o.value === v) ?? OPTIONS[0];
    const params = new URLSearchParams(searchParams.toString());
    params.set('orderby', opt.value === 'price-desc' ? 'price' : opt.value);
    params.set('order', opt.order ?? 'asc');
    params.delete('page');
    router.push(`/shop?${params.toString()}`);
  };

  const displayOrderby = orderby === 'price-desc' ? 'price-desc' : orderby;

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="shop-sort" className="text-sm text-gray-600 whitespace-nowrap">
        Sort by
      </label>
      <select
        id="shop-sort"
        value={displayOrderby}
        onChange={handleChange}
        className="flex-1 min-w-0 px-3 py-2 border border-gray-200 rounded text-sm bg-white"
      >
        {OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
