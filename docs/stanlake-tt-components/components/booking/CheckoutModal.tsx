'use client';

import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  checkoutUrl: string;
  eventName: string;
}

export function CheckoutModal({ 
  isOpen, 
  onClose, 
  checkoutUrl,
  eventName 
}: CheckoutModalProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Listen for completion messages from Ticket Tailor iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Ticket Tailor sends messages on completion
      // You can customize this based on TT's actual postMessage events
      if (event.data && event.data.type === 'tickettailor:complete') {
        console.log('Booking completed!', event.data);
        // You could show a success message here or redirect
        setTimeout(() => {
          onClose();
        }, 2000);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-dark/80 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="
              fixed inset-4 md:inset-8 lg:inset-16 
              z-50 flex items-center justify-center
            "
          >
            <div className="
              relative w-full h-full max-w-4xl
              bg-cream rounded-lg shadow-2xl
              flex flex-col
            ">
              {/* Header */}
              <div className="
                flex items-center justify-between 
                px-6 py-4 border-b border-dark/10
                shrink-0
              ">
                <div>
                  <h2 className="font-serif text-2xl text-dark">
                    Complete Your Booking
                  </h2>
                  <p className="mt-1 text-sm text-dark/60 uppercase tracking-widest">
                    {eventName}
                  </p>
                </div>

                <button
                  onClick={onClose}
                  className="
                    p-2 rounded-full 
                    hover:bg-dark/5 
                    transition-colors
                    group
                  "
                  aria-label="Close"
                >
                  <X className="h-6 w-6 text-dark/60 group-hover:text-dark" />
                </button>
              </div>

              {/* Iframe Container */}
              <div className="flex-1 relative overflow-hidden">
                <iframe
                  ref={iframeRef}
                  src={checkoutUrl}
                  className="absolute inset-0 w-full h-full border-0"
                  title="Ticket Tailor Checkout"
                  allow="payment"
                  sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-top-navigation"
                />
              </div>

              {/* Footer hint */}
              <div className="
                px-6 py-3 border-t border-dark/10
                text-center text-xs text-dark/40 uppercase tracking-widest
                shrink-0
              ">
                Secure checkout powered by Ticket Tailor
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
