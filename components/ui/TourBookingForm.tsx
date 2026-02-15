'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Calendar, Users, Gift, Info, X } from 'lucide-react';

const BUYTICKETS_BASE = 'https://buytickets.at/stanlakepark';

interface BookingFlowProps {
  priceDisplay: string;
  /** URL completa del evento (buytickets.at/...) */
  ticketTailorUrl?: string;
  /** ID del evento; se usa para construir la URL si no se pasa ticketTailorUrl */
  ticketTailorEventId?: string | null;
}

function buildTicketUrl(url?: string, eventId?: string | null): string {
  if (url?.trim()) return url.trim();
  const id = (eventId ?? '').toString().trim();
  if (!id) return '';
  if (id.startsWith('http')) return id;
  return `${BUYTICKETS_BASE}/${id}`;
}

export default function BookingFlow({
  priceDisplay,
  ticketTailorUrl,
  ticketTailorEventId,
}: BookingFlowProps) {
  const [overlayOpen, setOverlayOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const ticketUrl = buildTicketUrl(ticketTailorUrl, ticketTailorEventId);
  const canBook = ticketUrl.length > 0;

  useEffect(() => {
    setMounted(true);
  }, []);
  useEffect(() => {
    if (overlayOpen) document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, [overlayOpen]);

  return (
    <div className="bg-white p-8 md:p-10 shadow-sm border border-gray-100 rounded-sm">
      <div className="flex justify-between items-baseline mb-6">
        <span className="text-4xl font-serif text-dark">{priceDisplay}</span>
        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Per Person</span>
      </div>

      <div className="space-y-6 mb-8">
        <div className="flex items-start gap-4 p-4 bg-[#F2F0E9]/50 rounded-sm">
          <Info size={18} className="text-brand shrink-0 mt-0.5" />
          <p className="text-sm text-gray-600 leading-relaxed">
            Las reservas se gestionan a través de nuestro partner <strong>Ticket Tailor</strong> para garantizar disponibilidad en tiempo real y pagos seguros.
          </p>
        </div>

        <ul className="space-y-3">
          <li className="flex items-center gap-3 text-sm text-gray-500">
            <Calendar size={14} className="text-brand" /> Selección de fecha flexible
          </li>
          <li className="flex items-center gap-3 text-sm text-gray-500">
            <Users size={14} className="text-brand" /> Grupos de hasta 20 personas
          </li>
        </ul>
      </div>

      <button
        type="button"
        onClick={() => canBook && setOverlayOpen(true)}
        disabled={!canBook}
        className="tt-widget-button w-full inline-flex items-center justify-center px-8 py-5 bg-[#760235] text-white text-[11px] font-bold uppercase tracking-[0.2em] hover:bg-dark transition-all duration-500 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        Select Date & Book
      </button>

      {mounted && overlayOpen && typeof document !== 'undefined' &&
        createPortal(
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60"
            onClick={() => setOverlayOpen(false)}
          >
            <div
              className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-4 border-b border-gray-100">
                <h3 className="text-lg font-bold text-dark">Select date & book</h3>
                <button
                  type="button"
                  onClick={() => setOverlayOpen(false)}
                  className="p-2 rounded-full hover:bg-gray-100 text-gray-500"
                  aria-label="Cerrar"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="flex-1 min-h-[480px]">
                <iframe
                  title="Ticket Tailor – Select date and book"
                  src={ticketUrl}
                  className="w-full h-full min-h-[480px] border-0"
                />
              </div>
            </div>
          </div>,
          document.body
        )}

      <div className="mt-8 pt-8 border-t border-gray-100 flex justify-between items-center">
        <button className="text-[10px] font-bold uppercase tracking-widest text-brand flex items-center gap-2 hover:underline">
          <Gift size={14} /> Buy as Gift
        </button>
        <span className="text-[10px] text-gray-400 italic">Instant Confirmation</span>
      </div>
    </div>
  );
}