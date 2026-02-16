'use client';

import { useEffect, useState } from 'react';

export default function SquareDebugPage() {
  const [env, setEnv] = useState<Record<string, string>>({});

  useEffect(() => {
    setEnv({
      NEXT_PUBLIC_SQUARE_APPLICATION_ID:
        process.env.NEXT_PUBLIC_SQUARE_APPLICATION_ID || '(not set)',
      NEXT_PUBLIC_SQUARE_LOCATION_ID:
        process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID || '(not set)',
      SQUARE_ACCESS_TOKEN: process.env.SQUARE_ACCESS_TOKEN
        ? `${process.env.SQUARE_ACCESS_TOKEN.substring(0, 20)}...`
        : '(not set - server only)',
      SQUARE_LOCATION_ID: process.env.SQUARE_LOCATION_ID || '(not set - server only)',
    });
  }, []);

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Square Configuration Debug</h1>
      <div className="space-y-4">
        <div>
          <h2 className="font-semibold mb-2">Environment Variables (Client-side)</h2>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
            {JSON.stringify(env, null, 2)}
          </pre>
        </div>
        <div>
          <h2 className="font-semibold mb-2">Checks</h2>
          <ul className="space-y-2">
            <li>
              Application ID:{' '}
              {env.NEXT_PUBLIC_SQUARE_APPLICATION_ID?.startsWith('sandbox-') ||
              env.NEXT_PUBLIC_SQUARE_APPLICATION_ID?.startsWith('sq0idb-') ? (
                <span className="text-green-600">✓ Valid</span>
              ) : (
                <span className="text-red-600">✗ Invalid or missing</span>
              )}
            </li>
            <li>
              Location ID:{' '}
              {env.NEXT_PUBLIC_SQUARE_LOCATION_ID &&
              env.NEXT_PUBLIC_SQUARE_LOCATION_ID !== '(not set)' ? (
                <span className="text-green-600">✓ Set</span>
              ) : (
                <span className="text-red-600">✗ Missing</span>
              )}
            </li>
          </ul>
        </div>
        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded">
          <p className="text-sm">
            <strong>Note:</strong> Si ves "(not set)", asegúrate de:
            <br />1. Tener las variables en .env.local
            <br />2. Reiniciar el servidor de desarrollo (Ctrl+C y npm run dev)
            <br />3. Las variables NEXT_PUBLIC_* deben estar sin espacios antes del =
          </p>
        </div>
      </div>
    </div>
  );
}
