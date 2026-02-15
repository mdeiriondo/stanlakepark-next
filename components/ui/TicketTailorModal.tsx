'use client';

import { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';

interface TicketTailorModalProps {
  /** ID del evento en Ticket Tailor */
  eventId: string | null;
  /** Controla si el modal está abierto */
  isOpen: boolean;
  /** Callback cuando se cierra el modal */
  onClose: () => void;
}

/**
 * Modal que muestra el widget de Ticket Tailor para reservas.
 * Se abre desde el botón "Book Experience" en la home.
 */
export default function TicketTailorModal({
  eventId,
  isOpen,
  onClose,
}: TicketTailorModalProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  // Cargar el script de Ticket Tailor solo una vez
  useEffect(() => {
    if (!isOpen) return;

    // Verificar si el script ya existe
    const existingScript = document.querySelector('script[src*="tickettailor.com/js/widgets"]');
    
    if (existingScript) {
      setScriptLoaded(true);
      // Forzar reinicialización del widget cuando el modal se abre
      if (containerRef.current && (window as any).TicketTailor) {
        (window as any).TicketTailor.init();
      }
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://cdn.tickettailor.com/js/widgets/min/widget.js';
    script.async = true;
    script.onload = () => {
      setScriptLoaded(true);
      // Inicializar el widget después de cargar el script
      setTimeout(() => {
        if ((window as any).TicketTailor) {
          (window as any).TicketTailor.init();
        }
      }, 100);
    };
    document.body.appendChild(script);

    return () => {
      // No removemos el script para evitar recargas innecesarias
    };
  }, [isOpen]);

  // Cerrar modal con Escape
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    // Prevenir scroll del body cuando el modal está abierto
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !eventId) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      onClick={(e) => {
        // Cerrar al hacer clic en el fondo
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      {/* Overlay oscuro */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

      {/* Contenedor del modal */}
      <div className="relative z-10 bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header del modal */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-serif text-dark">Book Your Experience</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Cerrar modal"
          >
            <X size={24} className="text-gray-600" />
          </button>
        </div>

        {/* Contenedor del widget */}
        <div className="flex-1 overflow-y-auto p-6">
          <div
            ref={containerRef}
            className="tt-widget min-h-[400px]"
            data-tt-event={eventId}
            aria-label="Reserva de entradas"
          />
        </div>
      </div>
    </div>
  );
}
