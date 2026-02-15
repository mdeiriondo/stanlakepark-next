import { NextResponse } from 'next/server';

const API_BASE = 'https://api.tickettailor.com/v1';

/**
 * GET /api/ticket-tailor/debug
 * Muestra la respuesta cruda de la API de Ticket Tailor para depurar IDs.
 * - overview: GET /v1/overview
 * - events: GET /v1/events (lista; aquí suelen venir los IDs que podés usar)
 * Abrí esta URL en el navegador para ver qué IDs tiene tu box office.
 */
export async function GET() {
  const key = process.env.TICKET_TAILOR_API_KEY;
  if (!key) {
    return NextResponse.json({ error: 'TICKET_TAILOR_API_KEY not set' }, { status: 500 });
  }

  const auth = 'Basic ' + Buffer.from(key + ':', 'utf8').toString('base64');
  const headers = { Accept: 'application/json', Authorization: auth };

  const overviewRes = await fetch(`${API_BASE}/overview`, { headers });
  const overviewOk = overviewRes.ok;
  const overview = overviewOk ? await overviewRes.json() : { status: overviewRes.status, body: await overviewRes.text() };

  const eventsRes = await fetch(`${API_BASE}/events?limit=50`, { headers });
  const eventsOk = eventsRes.ok;
  const eventsPayload = eventsOk ? await eventsRes.json() : { status: eventsRes.status, body: await eventsRes.text() };

  const eventsList = eventsOk && eventsPayload?.data ? eventsPayload.data : [];
  const ids = Array.isArray(eventsList)
    ? eventsList.map((e: { id?: unknown; name?: string }) => ({ id: e?.id, name: e?.name ?? '(sin nombre)' }))
    : [];

  return NextResponse.json({
    overview: overviewOk ? 'ok' : overview,
    events_endpoint: eventsOk ? 'ok' : eventsPayload,
    event_ids_for_wordpress: ids,
    hint: 'Usá uno de los "id" de event_ids_for_wordpress en el ACF ticket_tailor_event_id. Si la lista está vacía, GET /v1/events puede no devolver eventos para tu cuenta.',
  });
}
