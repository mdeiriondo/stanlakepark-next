'use client';

import { useState, useEffect } from 'react';
import { useEventDetails } from '@/hooks/useTicketTailor';
import { generateCheckoutUrl } from '@/lib/ticket-tailor';
import { CheckoutModal } from './CheckoutModal';
import Button from '@/components/ui/Button';
import { Calendar, Users } from 'lucide-react';

const TT_ACCOUNT = process.env.NEXT_PUBLIC_TT_ACCOUNT_NAME || 'stanlakepark';

interface Occurrence {
  id: string;
  name?: string;
  start?: { date?: string; time?: string; iso?: string };
  end?: { date?: string; time?: string; iso?: string };
  /** URL pública de checkout (buytickets.at/…/2061731). Usar esta, no el id ev_xxx. */
  url?: string | null;
}

interface BookingFlowProps {
  ticketTailorEventId: string;
  experienceName: string;
  buttonText?: string;
}

function formatOccurrenceLabel(occ: Occurrence): string {
  if (!occ.start?.iso) return occ.name || 'Select date';
  const d = new Date(occ.start.iso);
  return d.toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function BookingFlow({
  ticketTailorEventId,
  experienceName,
  buttonText = 'Continue to payment',
}: BookingFlowProps) {
  const { data, loading, error } = useEventDetails(ticketTailorEventId);
  const [occurrences, setOccurrences] = useState<Occurrence[]>([]);
  const [occurrencesLoading, setOccurrencesLoading] = useState(true);
  const [selectedOccurrenceId, setSelectedOccurrenceId] = useState<string>(ticketTailorEventId);
  const [guestCount, setGuestCount] = useState(2);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [checkoutUrl, setCheckoutUrl] = useState('');
  const [paymentLoading, setPaymentLoading] = useState(false);

  useEffect(() => {
    if (!ticketTailorEventId) return;
    let cancelled = false;
    setOccurrencesLoading(true);
    fetch(`/api/tt/event/${ticketTailorEventId}/occurrences`)
      .then((res) => res.json())
      .then((json) => {
        if (cancelled || !json.success || !Array.isArray(json.occurrences)) return;
        setOccurrences(json.occurrences);
        const ids = json.occurrences.map((o: Occurrence) => o.id);
        if (json.occurrences.length > 0 && !ids.includes(ticketTailorEventId)) {
          setSelectedOccurrenceId(json.occurrences[0].id);
        }
      })
      .finally(() => {
        if (!cancelled) setOccurrencesLoading(false);
      });
    return () => { cancelled = true; };
  }, [ticketTailorEventId]);

  const buildPaymentUrl = async (): Promise<string> => {
    const eventId = selectedOccurrenceId || ticketTailorEventId;
    const selectedOcc = occurrences.find((o) => o.id === eventId);
    const baseUrl = selectedOcc?.url || data?.event?.url || null;

    const withParams = (checkoutBase: string, ticketTypeId: string) =>
      generateCheckoutUrl({
        checkoutBaseUrl: checkoutBase,
        ticketTypeId,
        quantity: guestCount,
      });

    if (eventId === ticketTailorEventId && data?.ticketTypes?.length && (baseUrl || eventId)) {
      return withParams(
        baseUrl || `https://buytickets.at/${TT_ACCOUNT}/${eventId}`,
        data.ticketTypes[0].id
      );
    }
    const res = await fetch(`/api/tt/event/${eventId}`);
    const json = await res.json();
    const fetchedBase = json?.event?.url || (baseUrl ?? (eventId ? `https://buytickets.at/${TT_ACCOUNT}/${eventId}` : ''));
    if (json?.success && json?.ticketTypes?.length && fetchedBase) {
      return withParams(fetchedBase, json.ticketTypes[0].id);
    }
    if (fetchedBase) {
      return `${fetchedBase}?quantity=${guestCount}`;
    }
    return `https://buytickets.at/${TT_ACCOUNT}/${eventId}?quantity=${guestCount}`;
  };

  const handleContinueToPayment = async () => {
    setPaymentLoading(true);
    try {
      const url = await buildPaymentUrl();
      setCheckoutUrl(url);
      setIsModalOpen(true);
    } finally {
      setPaymentLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-6 text-center">
        <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-brand border-r-transparent" />
        <p className="mt-3 text-xs uppercase tracking-widest text-dark/50">Loading...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <p className="text-sm text-dark/60 py-4">
        Unable to load booking. Please try again later.
      </p>
    );
  }

  const { availability } = data;
  const isSoldOut = availability?.isSoldOut ?? false;

  return (
    <>
      <div className="space-y-4">
        {/* Select Date — fechas desde nuestra API */}
        <div className="p-4 border border-gray-200 hover:border-brand transition-colors">
          <span className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">
            Select Date
          </span>
          {occurrencesLoading ? (
            <span className="text-dark/60 text-sm flex items-center gap-2">
              <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-brand border-r-transparent" />
              Loading dates...
            </span>
          ) : occurrences.length > 0 ? (
            <select
              value={selectedOccurrenceId}
              onChange={(e) => setSelectedOccurrenceId(e.target.value)}
              className="w-full text-dark font-medium bg-transparent border-0 p-0 focus:ring-0 focus:outline-none cursor-pointer flex items-center gap-2"
              aria-label="Choose date"
            >
              {occurrences.map((occ) => (
                <option key={occ.id} value={occ.id}>
                  {formatOccurrenceLabel(occ)}
                </option>
              ))}
            </select>
          ) : (
            <span className="text-dark font-medium flex justify-between items-center">
              Choose a date <Calendar size={16} className="text-dark/40" />
            </span>
          )}
        </div>

        {/* Guests */}
        <div className="p-4 border border-gray-200 cursor-pointer hover:border-brand transition-colors">
          <span className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">
            Guests
          </span>
          <span className="text-dark font-medium flex justify-between items-center">
            <button
              type="button"
              onClick={() => setGuestCount((n) => Math.max(1, n - 1))}
              className="px-1 text-brand hover:underline"
              aria-label="Fewer guests"
            >
              −
            </button>
            <span>{guestCount} Adult{guestCount !== 1 ? 's' : ''}</span>
            <button
              type="button"
              onClick={() => setGuestCount((n) => n + 1)}
              className="px-1 text-brand hover:underline flex items-center gap-1"
              aria-label="More guests"
            >
              + <Users size={16} className="text-dark/40" />
            </button>
          </span>
        </div>

        <Button
          variant="primary"
          className="w-full justify-center"
          onClick={handleContinueToPayment}
          disabled={isSoldOut || paymentLoading}
        >
          {paymentLoading
            ? 'Preparing…'
            : isSoldOut
              ? 'Sold Out'
              : buttonText}
        </Button>
      </div>

      <CheckoutModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        checkoutUrl={checkoutUrl}
        eventName={experienceName}
      />
    </>
  );
}
