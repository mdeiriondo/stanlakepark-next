'use client';

import { useCallback } from 'react';

const BOOK_SECTION_ID = 'book-experience';

interface BookExperienceButtonProps {
  /** Si false, no mostrar botón (ej. cuando no hay ticket_tailor_event_id) */
  show: boolean;
  className?: string;
  children?: React.ReactNode;
}

/**
 * Botón que hace scroll suave hasta el widget de Ticket Tailor en la misma página,
 * para que el usuario reserve sin salir del sitio.
 */
export default function BookExperienceButton({
  show,
  className = '',
  children = 'Book experience',
}: BookExperienceButtonProps) {
  const scrollToBooking = useCallback(() => {
    const el = document.getElementById(BOOK_SECTION_ID);
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  if (!show) return null;

  return (
    <button
      type="button"
      onClick={scrollToBooking}
      className={className}
      aria-label="Ir a reservar esta experiencia"
    >
      {children}
    </button>
  );
}
