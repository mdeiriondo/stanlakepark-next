import { NextRequest, NextResponse } from 'next/server';
import { findEventById } from '@/lib/ticket-tailor';

/**
 * GET /api/ticket-tailor/events/[eventId]
 * Devuelve los datos del evento desde la API de Ticket Tailor.
 * Busca: 1) GET /v1/events/:id, 2) en la lista GET /v1/events, 3) en las occurrences
 * de cada event series (el ID de buytickets.at suele ser una occurrence).
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  const { eventId } = await params;
  if (!eventId) {
    return NextResponse.json({ error: 'eventId required' }, { status: 400 });
  }

  try {
    const event = await findEventById(eventId);
    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }
    return NextResponse.json(event);
  } catch (e) {
    console.error('[Ticket Tailor API]', e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'API error' },
      { status: 500 }
    );
  }
}
