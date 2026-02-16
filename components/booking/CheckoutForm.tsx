'use client';

import { useState, useRef, useCallback } from 'react';
import { CreditCard } from 'lucide-react';
import { SquarePayment } from './SquarePayment';

interface CheckoutFormProps {
  productId: number;
  slotId: number;
  totalPrice: number;
  experienceName: string;
  date: string;
  time: string;
  guests: number;
  onSuccess: () => void;
  onCancel: () => void;
}

export function CheckoutForm({
  productId,
  slotId,
  totalPrice,
  experienceName,
  date,
  time,
  guests,
  onSuccess,
  onCancel,
}: CheckoutFormProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const squarePaymentRef = useRef<{ tokenize: () => Promise<string> } | null>(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address1: '',
    address2: '',
    city: '',
    postcode: '',
    country: 'GB',
  });

  const handlePaymentReady = useCallback((tokenizeFn: () => Promise<string>) => {
    squarePaymentRef.current = { tokenize: tokenizeFn };
  }, []);

  const handlePaymentError = useCallback((error: string) => {
    setPaymentError(error);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!squarePaymentRef.current) {
      setPaymentError('Payment form not ready. Please wait...');
      return;
    }

    setIsProcessing(true);
    setPaymentError(null);

    try {
      // Tokenizar el pago con Square
      const paymentToken = await squarePaymentRef.current.tokenize();

      // Procesar checkout con el token
      const response = await fetch('/api/booking/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          slotId,
          paymentToken,
          ...formData,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Checkout failed');
      }

      onSuccess();
    } catch (error) {
      console.error('Checkout error:', error);
      setPaymentError(error instanceof Error ? error.message : 'Payment failed');
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-dark/10 p-8">
      <div className="mb-6">
        <h2 className="text-2xl font-serif text-dark mb-2">Complete Your Booking</h2>
        <p className="text-dark/60 text-sm">
          {experienceName} • {date} at {time} • {guests} {guests === 1 ? 'guest' : 'guests'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Billing Details */}
        <div>
          <h3 className="font-serif text-xl text-dark mb-4">Billing Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-dark mb-1">
                First Name *
              </label>
              <input
                type="text"
                required
                value={formData.firstName}
                onChange={(e) =>
                  setFormData({ ...formData, firstName: e.target.value })
                }
                className="w-full px-4 py-2 border border-dark/10 rounded-lg focus:outline-none focus:border-brand"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-dark mb-1">
                Last Name *
              </label>
              <input
                type="text"
                required
                value={formData.lastName}
                onChange={(e) =>
                  setFormData({ ...formData, lastName: e.target.value })
                }
                className="w-full px-4 py-2 border border-dark/10 rounded-lg focus:outline-none focus:border-brand"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-dark mb-1">
                Email *
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full px-4 py-2 border border-dark/10 rounded-lg focus:outline-none focus:border-brand"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-dark mb-1">
                Phone *
              </label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                className="w-full px-4 py-2 border border-dark/10 rounded-lg focus:outline-none focus:border-brand"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-dark mb-1">
                Address Line 1 *
              </label>
              <input
                type="text"
                required
                value={formData.address1}
                onChange={(e) =>
                  setFormData({ ...formData, address1: e.target.value })
                }
                className="w-full px-4 py-2 border border-dark/10 rounded-lg focus:outline-none focus:border-brand"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-dark mb-1">
                Address Line 2
              </label>
              <input
                type="text"
                value={formData.address2}
                onChange={(e) =>
                  setFormData({ ...formData, address2: e.target.value })
                }
                className="w-full px-4 py-2 border border-dark/10 rounded-lg focus:outline-none focus:border-brand"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-dark mb-1">
                City *
              </label>
              <input
                type="text"
                required
                value={formData.city}
                onChange={(e) =>
                  setFormData({ ...formData, city: e.target.value })
                }
                className="w-full px-4 py-2 border border-dark/10 rounded-lg focus:outline-none focus:border-brand"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-dark mb-1">
                Postcode *
              </label>
              <input
                type="text"
                required
                value={formData.postcode}
                onChange={(e) =>
                  setFormData({ ...formData, postcode: e.target.value })
                }
                className="w-full px-4 py-2 border border-dark/10 rounded-lg focus:outline-none focus:border-brand"
              />
            </div>
          </div>
        </div>

        {/* Payment Section */}
        <div>
          <h3 className="font-serif text-xl text-dark mb-4 flex items-center gap-2">
            <CreditCard size={20} />
            Payment
          </h3>
          <SquarePayment
            amount={totalPrice}
            onPaymentReady={handlePaymentReady}
            onError={handlePaymentError}
          />
          {paymentError && (
            <p className="mt-2 text-sm text-red-600">{paymentError}</p>
          )}
        </div>

        {/* Total & Actions */}
        <div className="border-t border-dark/10 pt-6">
          <div className="flex items-baseline justify-between mb-6">
            <span className="text-sm uppercase tracking-widest text-dark/60">
              Total
            </span>
            <span className="font-serif text-3xl text-brand">
              £{totalPrice.toFixed(2)}
            </span>
          </div>
          <div className="flex gap-4">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-6 py-3 border border-dark/10 rounded-lg font-medium text-dark hover:bg-dark/5 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isProcessing || !squarePaymentRef.current}
              className="flex-1 px-6 py-3 bg-brand text-cream rounded-lg font-medium uppercase tracking-widest hover:bg-brand/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isProcessing ? 'Processing...' : 'Complete Payment'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
