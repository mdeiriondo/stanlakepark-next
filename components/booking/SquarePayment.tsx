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
  const containerIdRef = useRef(`square-card-${Math.random().toString(36).substr(2, 9)}`);

  useEffect(() => {
    // Prevenir múltiples inicializaciones
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

    const initializeSquare = async (appId: string, locationId: string) => {
      try {
        if (initializedRef.current) {
          console.log('Square already initialized, skipping...');
          return;
        }

        if (!window.Square) {
          throw new Error('Square SDK not loaded');
        }

        console.log('Initializing Square with:', { appId: appId.substring(0, 20) + '...', locationId });

        const containerId = containerIdRef.current;

        // Esperar a que el elemento exista en el DOM (con retry)
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

        // Limpiar contenido previo si existe
        cardElement.innerHTML = '';

        const payments = await window.Square.payments(appId, locationId);
        console.log('Square payments initialized');
        
        const card = await payments.card();
        console.log('Square card instance created');
        
        await card.attach(`#${containerId}`);
        console.log('Square card attached to DOM');
        
        cardInstanceRef.current = card;
        initializedRef.current = true;
        setIsLoaded(true);

        // Exponer función de tokenización
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
        const errorMsg = err?.message || 'Failed to initialize payment form';
        onError(`Square error: ${errorMsg}`);
      }
    };

    loadSquare();

    // Cleanup function
    return () => {
      if (cardInstanceRef.current) {
        try {
          // Square SDK no tiene un método explícito de destroy, pero limpiamos la referencia
          cardInstanceRef.current = null;
        } catch (err) {
          console.error('Error cleaning up Square instance:', err);
        }
      }
      initializedRef.current = false;
    };
  }, []); // Sin dependencias para evitar re-ejecuciones


  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-dark/60 text-sm">
        <Lock size={14} />
        <span>Secure payment by Square</span>
      </div>

      <div
        id={containerIdRef.current}
        ref={cardContainerRef}
        className="w-full h-12 border border-dark/10 rounded-lg bg-white"
        style={{ padding: '8px' }}
      />

      {!isLoaded && (
        <p className="text-sm text-dark/40">Loading payment form...</p>
      )}

      <style jsx global>{`
        [id^="square-card-"] iframe {
          width: 100% !important;
          height: 100% !important;
        }
      `}</style>
    </div>
  );
}

export { SquarePayment as default };
