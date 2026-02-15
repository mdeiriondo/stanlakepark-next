'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink } from 'lucide-react';
import Button from '@/components/ui/Button';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  checkoutUrl: string;
  eventName: string;
}

/**
 * Ticket Tailor (buytickets.at) no permite cargar su checkout en iframe por seguridad.
 * Mostramos un modal con enlace para abrir el checkout en una pestaña nueva.
 */
export function CheckoutModal({
  isOpen,
  onClose,
  checkoutUrl,
  eventName,
}: CheckoutModalProps) {
  const openCheckout = () => {
    if (checkoutUrl) window.open(checkoutUrl, '_blank', 'noopener,noreferrer');
  };

  useEffect(() => {
    if (!isOpen) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleEscape);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-dark/80 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={(e) => e.target === e.currentTarget && onClose()}
          >
            <div
              className="relative w-full max-w-md bg-cream rounded-lg shadow-2xl p-8 text-center"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-dark/5 transition-colors"
                aria-label="Close"
              >
                <X className="h-5 w-5 text-dark/60" />
              </button>

              <h2 className="font-serif text-2xl text-dark mt-2">
                Continue to payment
              </h2>
              <p className="mt-1 text-sm text-dark/60 uppercase tracking-widest">
                {eventName}
              </p>

              <p className="mt-6 text-dark/70 text-sm leading-relaxed">
                You&apos;ve chosen your date and group size here on Stanlake Park.
                You&apos;ll only leave our site now to enter your payment details
                on our secure payment page.
              </p>

              <Button
                variant="primary"
                className="w-full mt-8 justify-center gap-2"
                onClick={openCheckout}
              >
                Go to secure payment <ExternalLink size={16} />
              </Button>

              <button
                type="button"
                onClick={onClose}
                className="mt-4 text-sm text-dark/50 hover:text-dark/70 underline"
              >
                Cancel
              </button>

              <p className="mt-6 text-xs text-dark/40 uppercase tracking-widest">
                Secure checkout powered by Ticket Tailor
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
