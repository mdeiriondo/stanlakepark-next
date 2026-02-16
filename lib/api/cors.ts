import { NextResponse } from 'next/server';

/**
 * Helper para agregar headers CORS a las respuestas de las rutas admin
 * Permite que WordPress desde stanlakepark.com pueda hacer requests
 */
export function addCorsHeaders(response: NextResponse): NextResponse {
  const origin = process.env.ALLOWED_ORIGIN || 'https://stanlakepark.com';
  
  response.headers.set('Access-Control-Allow-Origin', origin);
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-WC-Webhook-Signature');
  response.headers.set('Access-Control-Allow-Credentials', 'true');
  
  return response;
}

/**
 * Maneja las peticiones OPTIONS (preflight) para CORS
 */
export function handleOptionsRequest(): NextResponse {
  const response = new NextResponse(null, { status: 204 });
  return addCorsHeaders(response);
}
