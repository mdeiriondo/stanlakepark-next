'use client';

import { useState } from 'react';
import { SlotPicker } from './SlotPicker';
import { GuestSelector } from './GuestSelector';

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

  const handleSlotSelected = (
    id: number,
    date: string,
    time: string,
    pricePerPerson: number,
    available?: number
  ) => {
    setSelectedSlot({ id, date, time, pricePerPerson, available });
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

      if (!data.success) {
        throw new Error(data.error || 'Failed to create booking');
      }

      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      }
    } catch (error) {
      console.error('Error creating booking:', error);
      alert(
        error instanceof Error ? error.message : 'Failed to proceed to checkout'
      );
      setIsSubmitting(false);
    }
  };

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
