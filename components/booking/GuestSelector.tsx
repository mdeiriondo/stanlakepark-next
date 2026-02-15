'use client';

import { Minus, Plus } from 'lucide-react';

interface GuestSelectorProps {
  guests: number;
  maxGuests: number;
  onGuestsChange: (guests: number) => void;
  pricePerPerson: number;
}

export function GuestSelector({
  guests,
  maxGuests,
  onGuestsChange,
  pricePerPerson,
}: GuestSelectorProps) {
  const totalPrice = guests * pricePerPerson;

  const handleDecrement = () => {
    if (guests > 1) onGuestsChange(guests - 1);
  };

  const handleIncrement = () => {
    if (guests < maxGuests) onGuestsChange(guests + 1);
  };

  return (
    <div className="space-y-4">
      <h3 className="font-serif text-xl text-dark">Number of Guests</h3>

      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={handleDecrement}
          disabled={guests <= 1}
          className="rounded-full border border-dark/10 p-3 transition-all hover:border-brand hover:bg-brand/5 disabled:cursor-not-allowed disabled:opacity-30"
          aria-label="Decrease guests"
        >
          <Minus className="h-5 w-5" />
        </button>

        <div className="flex-1 text-center">
          <p className="font-serif text-4xl text-dark">{guests}</p>
          <p className="mt-1 text-sm uppercase tracking-widest text-dark/60">
            {guests === 1 ? 'Guest' : 'Guests'}
          </p>
        </div>

        <button
          type="button"
          onClick={handleIncrement}
          disabled={guests >= maxGuests}
          className="rounded-full border border-dark/10 p-3 transition-all hover:border-brand hover:bg-brand/5 disabled:cursor-not-allowed disabled:opacity-30"
          aria-label="Increase guests"
        >
          <Plus className="h-5 w-5" />
        </button>
      </div>

      {maxGuests < 10 && (
        <p className="text-center text-xs uppercase tracking-widest text-dark/40">
          Maximum {maxGuests} guests for this slot
        </p>
      )}

      <div className="border-t border-dark/10 pt-4">
        <div className="flex items-baseline justify-between">
          <p className="text-sm uppercase tracking-widest text-dark/60">
            Total Price
          </p>
          <p className="font-serif text-3xl text-brand">
            £{totalPrice.toFixed(2)}
          </p>
        </div>
        <p className="mt-1 text-right text-xs text-dark/40">
          £{pricePerPerson.toFixed(2)} × {guests}{' '}
          {guests === 1 ? 'guest' : 'guests'}
        </p>
      </div>
    </div>
  );
}
