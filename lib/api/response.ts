import { NextResponse } from 'next/server';
import { addCorsHeaders } from './cors';

/**
 * Helper para crear respuestas JSON con CORS automático
 */
export function jsonResponse(data: any, status: number = 200): NextResponse {
  const response = NextResponse.json(data, { status });
  return addCorsHeaders(response);
}
