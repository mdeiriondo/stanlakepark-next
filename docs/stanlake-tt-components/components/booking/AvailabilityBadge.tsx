'use client';

import type { TTAvailability } from '@/lib/ticket-tailor';

interface AvailabilityBadgeProps {
  availability: TTAvailability;
  className?: string;
}

export function AvailabilityBadge({ availability, className = '' }: AvailabilityBadgeProps) {
  const { isSoldOut, isLowStock, ticketsAvailable } = availability;

  if (isSoldOut) {
    return (
      <span className={`inline-flex items-center gap-2 text-sm font-medium ${className}`}>
        <span className="h-2 w-2 rounded-full bg-dark" />
        <span className="uppercase tracking-widest text-dark">Sold Out</span>
      </span>
    );
  }

  if (isLowStock) {
    return (
      <span className={`inline-flex items-center gap-2 text-sm font-medium ${className}`}>
        <span className="h-2 w-2 rounded-full bg-gold animate-pulse" />
        <span className="uppercase tracking-widest text-gold">
          Only {ticketsAvailable} left
        </span>
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-2 text-sm font-medium ${className}`}>
      <span className="h-2 w-2 rounded-full bg-brand" />
      <span className="uppercase tracking-widest text-brand/70">
        {ticketsAvailable} available
      </span>
    </span>
  );
}
