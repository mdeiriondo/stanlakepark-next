'use client';

import { useState } from 'react';
import { useCart } from '@/contexts/CartContext';

export default function CheckoutButton() {
  const { items } = useCart();
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    setLoading(true);

    try {
      const res = await fetch('/api/cart/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map((item) => ({
            product_id: item.product_id,
            variation_id: item.variation_id,
            quantity: item.quantity,
          })),
        }),
      });

      const data = await res.json();

      if (data.success && data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        alert('Error creating checkout. Please try again.');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Error creating checkout. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleCheckout}
      disabled={loading || items.length === 0}
      className="w-full text-white py-4 rounded text-lg font-medium transition-colors disabled:opacity-50"
      style={{ backgroundColor: 'var(--color-brand)' }}
      onMouseEnter={(e) => {
        if (!e.currentTarget.disabled) e.currentTarget.style.backgroundColor = 'var(--color-brand-dark)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'var(--color-brand)';
      }}
    >
      {loading ? 'Processing...' : 'Proceed to Checkout'}
    </button>
  );
}
