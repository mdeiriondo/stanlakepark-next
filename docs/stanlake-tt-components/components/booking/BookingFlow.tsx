'use client';

import { useState, useEffect } from 'react';
import { useEventDetails } from '@/hooks/useTicketTailor';
import { generateCheckoutUrl } from '@/lib/ticket-tailor';
import { AvailabilityBadge } from './AvailabilityBadge';
import { AddOnsSelector } from './AddOnsSelector';
import { CheckoutModal } from './CheckoutModal';
import { Button } from '@/components/ui/Button';

interface BookingFlowProps {
  /** Ticket Tailor Event ID from ACF field */
  ticketTailorEventId: string;
  /** Experience name for display */
  experienceName: string;
  /** Optional: custom button text */
  buttonText?: string;
}

export function BookingFlow({ 
  ticketTailorEventId, 
  experienceName,
  buttonText = 'Book Now'
}: BookingFlowProps) {
  const { data, loading, error } = useEventDetails(ticketTailorEventId);
  
  const [selectedAddOns, setSelectedAddOns] = useState<Array<{ id: string; quantity: number }>>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [checkoutUrl, setCheckoutUrl] = useState('');

  // Calculate total price
  const totalPrice = data ? (() => {
    const mainTicket = data.ticketTypes[0]; // Assume first is main ticket
    const addOnsPrice = selectedAddOns.reduce((sum, addon) => {
      const addOnTicket = data.ticketTypes.find(tt => tt.id === addon.id);
      return sum + (addOnTicket?.price || 0) * addon.quantity;
    }, 0);
    
    return (mainTicket?.price || 0) + addOnsPrice;
  })() : 0;

  const handleBookNow = () => {
    if (!data) return;

    const mainTicketType = data.ticketTypes[0]; // First ticket type is main
    
    const url = generateCheckoutUrl({
      eventId: ticketTailorEventId,
      ticketTypeId: mainTicketType.id,
      quantity: 1,
      addons: selectedAddOns,
    });

    setCheckoutUrl(url);
    setIsModalOpen(true);
  };

  if (loading) {
    return (
      <div className="py-8 text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-brand border-r-transparent" />
        <p className="mt-4 text-sm uppercase tracking-widest text-dark/60">
          Loading availability...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-dark/10 bg-cream p-6">
        <p className="text-sm text-dark/60">
          Unable to load booking information. Please try again later.
        </p>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const { event, availability, ticketTypes } = data;
  const isSoldOut = availability.isSoldOut;

  return (
    <div className="space-y-8">
      {/* Event Info */}
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="font-serif text-2xl text-dark">
              {event.name}
            </h3>
            <p className="mt-2 text-dark/60">
              {new Date(event.start.iso).toLocaleDateString('en-GB', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
              {' at '}
              {new Date(event.start.iso).toLocaleTimeString('en-GB', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>

          <AvailabilityBadge availability={availability} />
        </div>

        {event.description && (
          <p className="text-dark/70">
            {event.description}
          </p>
        )}
      </div>

      {/* Add-ons (if available) */}
      {!isSoldOut && ticketTypes.length > 1 && (
        <AddOnsSelector
          ticketTypes={ticketTypes}
          onSelectionChange={setSelectedAddOns}
          currency={event.currency}
        />
      )}

      {/* Price & CTA */}
      <div className="flex items-center justify-between gap-4 pt-4 border-t border-dark/10">
        <div>
          <p className="text-sm uppercase tracking-widest text-dark/60">
            Total Price
          </p>
          <p className="mt-1 font-serif text-3xl text-brand">
            {new Intl.NumberFormat('en-GB', {
              style: 'currency',
              currency: event.currency,
            }).format(totalPrice)}
          </p>
        </div>

        <Button
          variant="primary"
          onClick={handleBookNow}
          disabled={isSoldOut}
        >
          {isSoldOut ? 'Sold Out' : buttonText}
        </Button>
      </div>

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        checkoutUrl={checkoutUrl}
        eventName={experienceName}
      />
    </div>
  );
}
