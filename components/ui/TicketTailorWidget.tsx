'use client';

import { useEffect, useRef } from 'react';

interface TicketTailorWidgetProps {
  /** ID del evento en Ticket Tailor (campo ticket_tailor_event_id de WordPress) */
  eventId: string;
  /** ID del contenedor para enlaces de ancla (ej. scroll desde "Book experience") */
  id?: string;
  className?: string;
}

/**
 * Widget de Ticket Tailor embebido: el checkout se muestra en esta misma página
 * (iframe inyectado por el script), sin redirigir al usuario fuera del sitio.
 */
export default function TicketTailorWidget({
  eventId,
  id,
  className = '',
}: TicketTailorWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Evitar cargar el script más de una vez
    if (document.querySelector('script[src*="tickettailor.com/js/widgets"]')) {
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://cdn.tickettailor.com/js/widgets/min/widget.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      const existing = document.querySelector('script[src*="tickettailor.com/js/widgets"]');
      if (existing?.parentNode) existing.parentNode.removeChild(existing);
    };
  }, []);

  return (
    <div
      {...(id ? { id } : {})}
      ref={containerRef}
      className={`tt-widget min-h-[280px] ${className}`}
      data-tt-event={eventId}
      aria-label="Reserva de entradas para esta experiencia"
    />
  );
}