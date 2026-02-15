// GET /api/tt/event/[id]/occurrences — fechas disponibles para este evento (mismo nombre, próximas)
import { NextResponse } from 'next/server';

const TT_API_KEY = process.env.TICKET_TAILOR_API_KEY!;
const TT_API_BASE = 'https://api.tickettailor.com/v1';

function getAuthHeader() {
  const credentials = Buffer.from(`${TT_API_KEY}:`).toString('base64');
  return `Basic ${credentials}`;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const eventRes = await fetch(`${TT_API_BASE}/events/${id}`, {
      headers: {
        Authorization: getAuthHeader(),
        'Content-Type': 'application/json',
      },
      next: { revalidate: 60 },
    });

    if (!eventRes.ok) {
      return NextResponse.json(
        { success: false, error: 'Event not found' },
        { status: 404 }
      );
    }

    const eventJson = await eventRes.json();
    const currentEvent = eventJson?.data ?? eventJson;
    if (!currentEvent?.name) {
      return NextResponse.json(
        { success: false, error: 'Invalid event data' },
        { status: 404 }
      );
    }

    const eventName = String(currentEvent.name).trim().toLowerCase();

    const allEventsRes = await fetch(`${TT_API_BASE}/events?limit=100`, {
      headers: {
        Authorization: getAuthHeader(),
        'Content-Type': 'application/json',
      },
      next: { revalidate: 60 },
    });

    const account = process.env.NEXT_PUBLIC_TT_ACCOUNT_NAME || 'stanlakepark';
    if (!allEventsRes.ok) {
      const occId = currentEvent.id ?? id;
      const occUrl =
        currentEvent.url && String(currentEvent.url).startsWith('http')
          ? currentEvent.url
          : /^\d+$/.test(String(occId))
            ? `https://buytickets.at/${account}/${occId}`
            : null;
      return NextResponse.json({
        success: true,
        occurrences: [
          {
            id: occId,
            name: currentEvent.name,
            start: currentEvent.start ?? null,
            end: currentEvent.end ?? null,
            url: occUrl,
          },
        ],
      });
    }

    const allEventsJson = await allEventsRes.json();
    const allEvents = Array.isArray(allEventsJson?.data)
      ? allEventsJson.data
      : Array.isArray(allEventsJson)
        ? allEventsJson
        : [];
    const now = new Date().toISOString();
    const occurrences = allEvents
      .filter((ev: Record<string, unknown>) => {
        const name = String(ev?.name ?? '').trim().toLowerCase();
        const start = (ev?.start as { iso?: string })?.iso;
        return name === eventName && start && start >= now;
      })
      .map((ev: Record<string, unknown>) => {
        const id = ev?.id ?? '';
        const url =
          ev?.url && String(ev.url).startsWith('http')
            ? String(ev.url)
            : /^\d+$/.test(String(id))
              ? `https://buytickets.at/${account}/${id}`
              : null;
        return {
          id,
          name: ev.name,
          start: ev.start,
          end: ev.end,
          url: url || (ev?.url ?? null),
        };
      })
      .sort((a: { start?: { iso?: string } }, b: { start?: { iso?: string } }) => {
        const aIso = a.start?.iso ?? '';
        const bIso = b.start?.iso ?? '';
        return aIso.localeCompare(bIso);
      });

    if (occurrences.length === 0) {
      const occId = currentEvent.id ?? id;
      const occUrl =
        currentEvent.url && String(currentEvent.url).startsWith('http')
          ? currentEvent.url
          : /^\d+$/.test(String(occId))
            ? `https://buytickets.at/${account}/${occId}`
            : null;
      occurrences.push({
        id: occId,
        name: currentEvent.name,
        start: currentEvent.start,
        end: currentEvent.end,
        url: occUrl,
      });
    }

    return NextResponse.json({ success: true, occurrences });
  } catch (err) {
    console.error('Error fetching occurrences:', err);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch dates' },
      { status: 500 }
    );
  }
}
