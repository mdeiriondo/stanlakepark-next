'use client';

import Image from 'next/image';
import { useCart } from '@/contexts/CartContext';
import type { CartItem as CartItemType } from '@/contexts/CartContext';

interface CartItemProps {
  item: CartItemType;
}

export default function CartItem({ item }: CartItemProps) {
  const { updateQuantity, removeItem } = useCart();

  return (
    <div className="flex gap-4 py-4 border-b border-gray-100 last:border-0">
      <div className="relative w-24 h-24 shrink-0 bg-cream/30 rounded overflow-hidden">
        {item.image ? (
          <Image
            src={item.image}
            alt={item.name}
            fill
            className="object-cover rounded"
            sizes="96px"
          />
        ) : null}
      </div>

      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-dark">{item.name}</h3>
        <p className="text-sm text-gray-500">
          £{item.price.toFixed(2)} each
        </p>
      </div>

      <div className="flex items-center gap-4 shrink-0">
        <input
          type="number"
          min={1}
          value={item.quantity}
          onChange={(e) =>
            updateQuantity(
              item.product_id,
              Math.max(1, parseInt(e.target.value, 10) || 1),
              item.variation_id
            )
          }
          className="w-16 px-2 py-1 border border-gray-200 rounded text-center focus:border-brand focus:outline-none"
        />

        <div className="text-lg font-serif text-dark w-24 text-right">
          £{(item.price * item.quantity).toFixed(2)}
        </div>

        <button
          type="button"
          onClick={() => removeItem(item.product_id, item.variation_id)}
          className="text-gray-500 hover:text-brand text-sm uppercase tracking-wider"
        >
          Remove
        </button>
      </div>
    </div>
  );
}
