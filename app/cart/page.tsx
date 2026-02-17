'use client';

import { useCart } from '@/contexts/CartContext';
import CartItem from '@/components/cart/CartItem';
import CheckoutButton from '@/components/cart/CheckoutButton';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import PageHero from '@/components/layout/PageHero';

export default function CartPage() {
  const { items, total, itemCount } = useCart();

  if (itemCount === 0) {
    return (
      <main className="min-h-screen bg-white flex flex-col">
        <Navbar mode="winery" />
        <PageHero
          title="Shopping Cart"
          subtitle="Your basket is empty"
          image="https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?q=80&w=2670&auto=format&fit=crop"
        />
        <div className="flex-1 flex items-center justify-center py-24">
          <div className="text-center">
            <p className="text-gray-600 mb-6">Add wines from our shop to get started.</p>
            <Link
              href="/shop"
              className="text-brand font-semibold border-b border-brand pb-1"
            >
              Continue shopping
            </Link>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white">
      <Navbar mode="winery" />

      <PageHero
        title="Shopping Cart"
        subtitle="Review your items"
        image="https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?q=80&w=2670&auto=format&fit=crop"
      />

      <div className="max-w-4xl mx-auto px-6 md:px-12 py-16">
        <div className="bg-cream/30 rounded-lg p-6 mb-6">
          {items.map((item) => (
            <CartItem
              key={`${item.product_id}-${item.variation_id ?? 0}`}
              item={item}
            />
          ))}
        </div>

        {/* Summary */}
        <div className="bg-white border border-gray-100 shadow-sm rounded-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <span className="text-xl text-dark">Subtotal</span>
            <span className="text-3xl font-serif text-dark">£{total.toFixed(2)}</span>
          </div>

          <CheckoutButton />

          <p className="text-sm text-gray-500 mt-4 text-center">
            Shipping and taxes calculated at checkout
          </p>
        </div>
      </div>

      <Footer />
    </main>
  );
}
