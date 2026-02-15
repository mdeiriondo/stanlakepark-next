/**
 * Ticket Tailor API – uso solo en servidor (API key no debe exponerse al cliente).
 * Docs: https://developers.tickettailor.com/docs/intro
 *
 * Autenticación: HTTP Basic con la API key (Base64(api_key) en header Authorization).
 */

const API_BASE = 'https://api.tickettailor.com/v1';

function getAuthHeader(): string {
  const key = process.env.TICKET_TAILOR_API_KEY;
  if (!key) throw new Error('TICKET_TAILOR_API_KEY is not set');
  return 'Basic ' + Buffer.from(key + ':', 'utf8').toString('base64');
}

async function fetchApi<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      Accept: 'application/json',
      Authorization: getAuthHeader(),
      ...options.headers,
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(
      `Ticket Tailor API ${res.status}: ${(err as { message?: string }).message ?? res.statusText}`
    );
  }
  return res.json() as Promise<T>;
}

/** Respuesta de un evento (campos habituales) */
export type TicketTailorEvent = {
  id: string;
  name: string;
  description?: string;
  start: string;
  end?: string;
  venue?: { name?: string; [k: string]: unknown };
  ticket_types?: { id: string; name: string; price: number; [k: string]: unknown }[];
  [key: string]: unknown;
};

/** Lista de eventos (paginada) */
export type TicketTailorEventsResponse = {
  data: TicketTailorEvent[];
  meta?: { next_cursor?: string; prev_cursor?: string };
};

/** Obtener un evento por ID */
export async function getEvent(eventId: string): Promise<TicketTailorEvent | null> {
  try {
    return await fetchApi<TicketTailorEvent>(`/events/${eventId}`);
  } catch (e) {
    if (e instanceof Error && (e.message.includes('404') || e.message.includes('Not Found')))
      return null;
    throw e;
  }
}

/** Listar eventos del box office (paginación con starting_after / ending_before / limit) */
export async function getEvents(params?: {
  starting_after?: string;
  ending_before?: string;
  limit?: number;
}): Promise<TicketTailorEventsResponse> {
  const search = new URLSearchParams();
  if (params?.starting_after) search.set('starting_after', params.starting_after);
  if (params?.ending_before) search.set('ending_before', params.ending_before);
  if (params?.limit != null) search.set('limit', String(params.limit));
  const qs = search.toString();
  return fetchApi<TicketTailorEventsResponse>(`/events${qs ? `?${qs}` : ''}`);
}

/** Listar occurrences de una event series (GET /v1/event_series/:id/events) */
export async function getEventOccurrences(seriesId: string): Promise<{ data: TicketTailorEvent[] }> {
  return fetchApi<{ data: TicketTailorEvent[] }>(`/event_series/${seriesId}/events`);
}

const toId = (x: unknown): string => (x != null ? String(x) : '');

/**
 * Busca un evento por ID: primero directo, luego en la lista de events,
 * luego en las occurrences de cada event series.
 * Si la API de Ticket Tailor devuelve 404 en /v1/events (p. ej. API key o cuenta),
 * esta función devuelve null y el modal sigue mostrando el enlace a buytickets.at.
 */
export async function findEventById(eventId: string): Promise<TicketTailorEvent | null> {
  const id = eventId.trim();
  if (!id) return null;

  let event = await getEvent(id);
  if (event) return event;

  let events: TicketTailorEvent[];
  try {
    const res = await getEvents({ limit: 100 });
    events = res.data ?? [];
  } catch {
    return null;
  }

  const matchId = (e: TicketTailorEvent) =>
    toId(e.id) === id ||
    toId((e as Record<string, unknown>).event_id) === id ||
    toId((e as Record<string, unknown>).occurrence_id) === id;
  event = events.find(matchId) ?? null;
  if (event) return event;

  for (const series of events) {
    const seriesId = toId(series.id);
    if (seriesId === id) return series;
    try {
      const { data: occurrences } = await getEventOccurrences(seriesId);
      const occurrence = occurrences.find((o) => toId(o.id) === id) ?? null;
      if (occurrence) return occurrence;
    } catch {
      continue;
    }
  }
  return null;
}

/** Orden (campos habituales para webhooks) */
export type TicketTailorOrder = {
  id: string;
  event_id: string;
  status?: string;
  customer?: { email?: string; name?: string; [k: string]: unknown };
  [key: string]: unknown;
};

/** Obtener una orden por ID */
export async function getOrder(orderId: string): Promise<TicketTailorOrder | null> {
  try {
    return await fetchApi<TicketTailorOrder>(`/orders/${orderId}`);
  } catch (e) {
    if (e instanceof Error && (e.message.includes('404') || e.message.includes('Not Found')))
      return null;
    throw e;
  }
}
