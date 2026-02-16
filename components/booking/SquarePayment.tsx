'use client';

import { useEffect, useRef, useState } from 'react';
import { CreditCard, Lock } from 'lucide-react';

interface SquarePaymentProps {
  amount: number;
  onPaymentReady: (tokenizeFn: () => Promise<string>) => void;
  onError: (error: string) => void;
}

declare global {
  interface Window {
    Square?: {
      payments: (
        appId: string,
        locationId: string
      ) => Promise<{
        card: () => Promise<{
          attach: (element: string) => Promise<void>;
          tokenize: () => Promise<{ status: string; token?: string; errors?: any[] }>;
        }>;
      }>;
    };
  }
}

// Detectar si estamos en sandbox basado en el Application ID
function isSandbox(appId: string): boolean {
  return appId.startsWith('sandbox-');
}

// Un solo contenedor en toda la app evita duplicados (Strict Mode o doble mount)
const SQUARE_CARD_CONTAINER_ID = 'square-card-container';

// Mutex a nivel de módulo: evita que dos ejecuciones hagan attach a la vez
let initPromise: Promise<void> | null = null;

export function SquarePayment({
  amount,
  onPaymentReady,
  onError,
}: SquarePaymentProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const cardContainerRef = useRef<HTMLDivElement>(null);
  const cardInstanceRef = useRef<any>(null);
  const initializedRef = useRef(false);
  const scriptLoadedRef = useRef(false);
  const containerIdRef = useRef(SQUARE_CARD_CONTAINER_ID);

  useEffect(() => {
    if (initializedRef.current) {
      return;
    }

    const appId = process.env.NEXT_PUBLIC_SQUARE_APPLICATION_ID;
    const locationId = process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID;

    console.log('Square config check:', {
      hasAppId: !!appId,
      hasLocationId: !!locationId,
      appIdPrefix: appId?.substring(0, 20),
      locationId,
    });

    if (!appId || !locationId) {
      console.error('Square missing config:', { appId, locationId });
      onError('Square payment is not configured. Check NEXT_PUBLIC_SQUARE_APPLICATION_ID and NEXT_PUBLIC_SQUARE_LOCATION_ID in .env.local');
      return;
    }

    const loadSquare = async () => {
      // Si ya está cargado, inicializar directamente
      if (window.Square && scriptLoadedRef.current) {
        await initializeSquare(appId, locationId);
        return;
      }

      // Determinar URL del SDK según sandbox o producción
      const sdkUrl = isSandbox(appId)
        ? 'https://sandbox.web.squarecdn.com/v1/square.js'
        : 'https://web.squarecdn.com/v1/square.js';

      // Verificar si el script ya existe
      const existingScript = document.querySelector(`script[src="${sdkUrl}"]`);
      if (existingScript) {
        scriptLoadedRef.current = true;
        await initializeSquare(appId, locationId);
        return;
      }

      const script = document.createElement('script');
      script.src = sdkUrl;
      script.async = true;
      script.onload = async () => {
        scriptLoadedRef.current = true;
        await initializeSquare(appId, locationId);
      };
      script.onerror = () => {
        onError('Failed to load Square payment SDK');
      };
      document.head.appendChild(script);
    };

    const waitForSquare = (maxWaitMs = 5000, intervalMs = 100): Promise<void> => {
      return new Promise((resolve, reject) => {
        if (typeof window === 'undefined') {
          reject(new Error('Window not available'));
          return;
        }
        if (window.Square) {
          resolve();
          return;
        }
        const start = Date.now();
        const t = setInterval(() => {
          if (window.Square) {
            clearInterval(t);
            resolve();
            return;
          }
          if (Date.now() - start >= maxWaitMs) {
            clearInterval(t);
            reject(new Error('Square SDK not loaded'));
          }
        }, intervalMs);
      });
    };

    const initializeSquare = async (appId: string, locationId: string) => {
      // Si otra ejecución ya está inicializando, esperar y no hacer nada más
      if (initPromise) {
        await initPromise;
        return;
      }
      if (initializedRef.current) {
        return;
      }

      let resolveInit: () => void;
      initPromise = new Promise((resolve) => {
        resolveInit = resolve;
      });

      try {
        await waitForSquare();

        if (initializedRef.current) {
          resolveInit!();
          return;
        }

        console.log('Initializing Square with:', { appId: appId.substring(0, 20) + '...', locationId });

        const containerId = containerIdRef.current;

        let cardElement = document.getElementById(containerId);
        let retries = 0;
        while (!cardElement && retries < 10) {
          await new Promise((resolve) => setTimeout(resolve, 100));
          cardElement = document.getElementById(containerId);
          retries++;
        }

        if (!cardElement) {
          throw new Error('Card container element not found after waiting');
        }

        cardElement.innerHTML = '';

        const payments = await window.Square!.payments(appId, locationId);
        const card = await payments.card();
        await card.attach(`#${containerId}`);

        cardInstanceRef.current = card;
        initializedRef.current = true;
        setIsLoaded(true);

        onPaymentReady(async () => {
          if (!cardInstanceRef.current) throw new Error('Card not initialized');
          const result = await cardInstanceRef.current.tokenize();
          if (result.status === 'OK' && result.token) {
            return result.token;
          }
          const errorMessage = result.errors?.[0]?.message || 'Tokenization failed';
          throw new Error(errorMessage);
        });
      } catch (err: any) {
        console.error('Square initialization error:', err);
        initPromise = null;
        const errorMsg = err?.message || 'Failed to initialize payment form';
        onError(`Square error: ${errorMsg}`);
      } finally {
        resolveInit!();
      }
    };

    loadSquare();

    // Cleanup: resetear initPromise con delay. Así la 2.ª ejecución del efecto (Strict Mode)
    // sigue viendo initPromise y no hace doble init; y al cancelar, 400ms después se libera
    // para que la próxima vez que se monte pueda inicializar de nuevo.
    return () => {
      setTimeout(() => {
        initPromise = null;
      }, 400);
      if (cardInstanceRef.current) {
        try {
          cardInstanceRef.current = null;
        } catch (err) {
          console.error('Error cleaning up Square instance:', err);
        }
      }
    };
  }, []);


  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-dark/60 text-sm">
        <Lock size={14} />
        <span>Secure payment by Square</span>
      </div>

      <div className="square-payment-container relative z-10 mb-6">
        <div
          id={containerIdRef.current}
          ref={cardContainerRef}
          className="w-full min-h-[60px] border border-dark/10 rounded-lg bg-white relative"
          style={{ padding: '12px', boxSizing: 'border-box' }}
        />
      </div>

      {!isLoaded && (
        <p className="text-sm text-dark/40">Loading payment form...</p>
      )}

      <style jsx global>{`
        #square-card-container {
          position: relative;
          z-index: 1;
          overflow: visible;
        }
        #square-card-container iframe {
          width: 100% !important;
          height: 100% !important;
          border: none !important;
        }
        /* Asegurar que el contenedor de Square tenga suficiente espacio */
        .square-payment-container {
          min-height: 60px;
          margin-bottom: 1rem;
        }
      `}</style>
    </div>
  );
}

export { SquarePayment as default };
