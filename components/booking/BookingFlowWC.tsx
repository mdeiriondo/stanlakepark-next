'use client';

import { useState } from 'react';
import { SlotPicker } from './SlotPicker';
import { GuestSelector } from './GuestSelector';
import { CheckoutForm } from './CheckoutForm';

interface BookingFlowWCProps {
  experienceSlug: string;
  experienceName: string;
}

export function BookingFlowWC({
  experienceSlug,
  experienceName,
}: BookingFlowWCProps) {
  const [selectedSlot, setSelectedSlot] = useState<{
    id: number;
    date: string;
    time: string;
    pricePerPerson: number;
    available?: number;
  } | null>(null);

  const [guests, setGuests] = useState(2);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [checkoutData, setCheckoutData] = useState<{
    productId: number;
    slotId: number;
    totalPrice: number;
  } | null>(null);

  const handleSlotSelected = (
    id: number,
    date: string,
    time: string,
    pricePerPerson: number,
    available?: number
  ) => {
    setSelectedSlot({ id, date, time, pricePerPerson, available });
    setShowCheckout(false);
  };

  const maxGuests = selectedSlot?.available ?? 20;

  const handleReserveAndPay = async () => {
    if (!selectedSlot) return;

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/booking/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slotId: selectedSlot.id,
          guests,
          experienceName,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        const errorMsg =
          data.error ||
          data.details ||
          `HTTP ${response.status}: ${response.statusText}`;
        throw new Error(errorMsg);
      }

      // En lugar de redirigir, mostrar checkout custom
      setCheckoutData({
        productId: data.productId,
        slotId: data.slotId,
        totalPrice: selectedSlot.pricePerPerson * guests,
      });
      setShowCheckout(true);
    } catch (error) {
      console.error('Error creating booking:', error);
      alert(
        error instanceof Error ? error.message : 'Failed to proceed to checkout'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCheckoutSuccess = () => {
    alert('Booking confirmed! You will receive a confirmation email shortly.');
    // Resetear el flujo
    setShowCheckout(false);
    setSelectedSlot(null);
    setGuests(2);
    setCheckoutData(null);
  };

  const handleCheckoutCancel = () => {
    setShowCheckout(false);
  };

  if (showCheckout && checkoutData && selectedSlot) {
    return (
      <CheckoutForm
        productId={checkoutData.productId}
        slotId={checkoutData.slotId}
        totalPrice={checkoutData.totalPrice}
        experienceName={experienceName}
        date={selectedSlot.date}
        time={selectedSlot.time}
        guests={guests}
        onSuccess={handleCheckoutSuccess}
        onCancel={handleCheckoutCancel}
      />
    );
  }

  return (
    <div className="space-y-8">
      <SlotPicker
        experienceSlug={experienceSlug}
        onSlotSelected={(id, date, time, pricePerPerson, available) =>
          handleSlotSelected(id, date, time, pricePerPerson, available)
        }
      />

      {selectedSlot && (
        <GuestSelector
          guests={guests}
          maxGuests={maxGuests}
          onGuestsChange={setGuests}
          pricePerPerson={selectedSlot.pricePerPerson}
        />
      )}

      {selectedSlot && (
        <button
          type="button"
          onClick={handleReserveAndPay}
          disabled={isSubmitting}
          className="w-full rounded-lg bg-brand px-6 py-4 font-medium uppercase tracking-widest text-cream transition-all hover:bg-brand/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting ? 'Processing...' : 'Reserve & Pay'}
        </button>
      )}
    </div>
  );
}
