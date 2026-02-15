import { NextResponse } from 'next/server';

const API_BASE = 'https://api.tickettailor.com/v1';

/**
 * GET /api/ticket-tailor/health
 * Comprueba si la API key de Ticket Tailor es válida (llama a GET /v1/overview).
 * Útil para diagnosticar 404 en GET /v1/events.
 */
export async function GET() {
  const key = process.env.TICKET_TAILOR_API_KEY;
  if (!key) {
    return NextResponse.json({ ok: false, error: 'TICKET_TAILOR_API_KEY not set' }, { status: 500 });
  }

  try {
    const auth = 'Basic ' + Buffer.from(key + ':', 'utf8').toString('base64');
    const res = await fetch(`${API_BASE}/overview`, {
      headers: { Accept: 'application/json', Authorization: auth },
    });
    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json({
        ok: false,
        status: res.status,
        error: text || res.statusText,
      });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({
      ok: false,
      error: e instanceof Error ? e.message : 'Request failed',
    }, { status: 500 });
  }
}
