'use client';

import { useState, useMemo } from 'react';
import { useAvailableSlots, type Slot } from '@/hooks/useSlots';
import { format, parseISO } from 'date-fns';

interface SlotPickerProps {
  experienceSlug: string;
  onSlotSelected: (
    slotId: number,
    date: string,
    time: string,
    pricePerPerson: number,
    available?: number
  ) => void;
}

export function SlotPicker({
  experienceSlug,
  onSlotSelected,
}: SlotPickerProps) {
  const { slots, loading, error } = useAvailableSlots(experienceSlug);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const slotsByDate = useMemo(() => {
    const grouped = new Map<string, Slot[]>();
    slots.forEach((slot) => {
      if (!grouped.has(slot.date)) {
        grouped.set(slot.date, []);
      }
      grouped.get(slot.date)!.push(slot);
    });
    return grouped;
  }, [slots]);

  const availableDates = Array.from(slotsByDate.keys()).sort();
  const timesForSelectedDate = selectedDate
    ? slotsByDate.get(selectedDate) ?? []
    : [];

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    setSelectedTime(null);
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    const selectedSlot = timesForSelectedDate.find((s) => s.time === time);
    if (selectedSlot) {
      onSlotSelected(
        selectedSlot.id,
        selectedSlot.date,
        selectedSlot.time,
        Number(selectedSlot.price_per_person),
        selectedSlot.available
      );
    }
  };

  if (loading) {
    return (
      <div className="py-8 text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-brand border-r-transparent" />
        <p className="mt-4 text-sm uppercase tracking-widest text-dark/60">
          Loading available dates...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-dark/10 bg-cream p-6">
        <p className="text-sm text-dark/60">
          Unable to load available dates. Please try again later.
        </p>
      </div>
    );
  }

  if (slots.length === 0) {
    return (
      <div className="rounded-lg border border-dark/10 bg-cream p-6">
        <p className="text-sm text-dark/60">
          No dates currently available for booking.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="mb-3 font-serif text-xl text-dark">Select Date</h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {availableDates.map((date) => {
            const dateObj = parseISO(date);
            const isSelected = selectedDate === date;
            return (
              <button
                key={date}
                type="button"
                onClick={() => handleDateSelect(date)}
                className={
                  isSelected
                    ? 'rounded-lg border border-brand bg-brand p-4 text-cream transition-all'
                    : 'rounded-lg border border-dark/10 bg-white p-4 transition-all hover:border-brand/30'
                }
              >
                <div className="text-center">
                  <p className="text-sm uppercase tracking-widest opacity-70">
                    {format(dateObj, 'EEE')}
                  </p>
                  <p className="mt-1 font-serif text-2xl">
                    {format(dateObj, 'd')}
                  </p>
                  <p className="text-sm">{format(dateObj, 'MMM yyyy')}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {selectedDate && timesForSelectedDate.length > 0 && (
        <div>
          <h3 className="mb-3 font-serif text-xl text-dark">Select Time</h3>
          <div className="grid grid-cols-2 gap-3">
            {timesForSelectedDate.map((slot) => {
              const timeStr =
                typeof slot.time === 'string'
                  ? slot.time.slice(0, 5)
                  : String(slot.time).slice(0, 5);
              const isSelected = selectedTime === slot.time;
              const isLowStock = slot.available <= 3;
              return (
                <button
                  key={`${slot.date}-${slot.time}`}
                  type="button"
                  onClick={() => handleTimeSelect(slot.time)}
                  disabled={slot.available === 0}
                  className={
                    isSelected
                      ? 'rounded-lg border border-brand bg-brand p-4 text-left text-cream transition-all'
                      : slot.available === 0
                        ? 'cursor-not-allowed rounded-lg border border-dark/10 bg-gray-100 p-4 text-left opacity-50 transition-all'
                        : 'rounded-lg border border-dark/10 bg-white p-4 text-left transition-all hover:border-brand/30'
                  }
                >
                  <p className="text-lg font-medium">{timeStr}</p>
                  <p
                    className={
                      isSelected
                        ? 'mt-1 text-xs uppercase tracking-widest text-cream/70'
                        : 'mt-1 text-xs uppercase tracking-widest text-dark/60'
                    }
                  >
                    {slot.available === 0
                      ? 'Sold Out'
                      : isLowStock
                        ? `Only ${slot.available} left`
                        : `${slot.available} available`}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
