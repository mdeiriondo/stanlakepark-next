// app/api/tt/event/[id]/route.ts
import { NextResponse } from 'next/server';

const TT_API_KEY = process.env.TICKET_TAILOR_API_KEY!;
const TT_API_BASE = 'https://api.tickettailor.com/v1';

function getAuthHeader() {
  const credentials = Buffer.from(`${TT_API_KEY}:`).toString('base64');
  return `Basic ${credentials}`;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Fetch event details
    const eventResponse = await fetch(`${TT_API_BASE}/events/${id}`, {
      headers: {
        'Authorization': getAuthHeader(),
        'Content-Type': 'application/json',
      },
      next: { revalidate: 30 },
    });

    if (!eventResponse.ok) {
      // Si el ID es numérico (ej. 2061731), es el "public ID" de la URL; la API solo acepta ev_xxx
      const numericId = /^\d+$/.test(id) ? id : null;
      if (eventResponse.status === 404 && numericId) {
        const account = process.env.NEXT_PUBLIC_TT_ACCOUNT_NAME || 'stanlakepark';
        return NextResponse.json({
          success: true,
          event: {
            id: numericId,
            name: '',
            description: null,
            start: null,
            end: null,
            venue: null,
            currency: 'GBP',
            url: `https://buytickets.at/${account}/${numericId}`,
            images: null,
          },
          availability: { totalCapacity: 0, ticketsSold: 0, ticketsAvailable: 0, isSoldOut: false, isLowStock: false },
          ticketTypes: [],
        });
      }
      throw new Error(`Event not found: ${eventResponse.status}`);
    }

    const eventData = await eventResponse.json();
    // API puede devolver el evento en .data o en la raíz
    const event = eventData?.data ?? eventData;

    if (!event || typeof event !== 'object') {
      return NextResponse.json(
        { success: false, error: 'Event data invalid or empty' },
        { status: 404 }
      );
    }

    // Fetch issued tickets to calculate availability
    const ticketsResponse = await fetch(
      `${TT_API_BASE}/issued_tickets?event_id=${id}`,
      {
        headers: {
          'Authorization': getAuthHeader(),
          'Content-Type': 'application/json',
        },
        next: { revalidate: 10 }, // More frequent revalidation for availability
      }
    );

    const ticketsData = await ticketsResponse.json();
    const issuedTickets = Array.isArray(ticketsData?.data) ? ticketsData.data : (Array.isArray(ticketsData) ? ticketsData : []);

    // Calcular disponibilidad. Si total_tickets no viene en la API, no asumir "Sold Out"
    const totalCapacity = Number(event.total_tickets) || 0;
    const ticketsSold = issuedTickets.length;
    const ticketsAvailable = totalCapacity > 0 ? totalCapacity - ticketsSold : null;
    const isSoldOut = totalCapacity > 0 && ticketsAvailable !== null && ticketsAvailable <= 0;
    const isLowStock = ticketsAvailable !== null && ticketsAvailable > 0 && ticketsAvailable <= 5;

    // Get ticket types (for add-ons)
    const ticketTypesResponse = await fetch(
      `${TT_API_BASE}/ticket_types?event_id=${id}`,
      {
        headers: {
          'Authorization': getAuthHeader(),
          'Content-Type': 'application/json',
        },
        next: { revalidate: 60 },
      }
    );

    const ticketTypesData = await ticketTypesResponse.json();
    const ticketTypes = Array.isArray(ticketTypesData?.data) ? ticketTypesData.data : (Array.isArray(ticketTypesData) ? ticketTypesData : []);

    const account = process.env.NEXT_PUBLIC_TT_ACCOUNT_NAME || 'stanlakepark';
    const eventIdRaw = event.id ?? id;
    const publicUrl =
      event.url && String(event.url).startsWith('http')
        ? String(event.url)
        : /^\d+$/.test(String(eventIdRaw))
          ? `https://buytickets.at/${account}/${eventIdRaw}`
          : null;

    return NextResponse.json({
      success: true,
      event: {
        id: eventIdRaw,
        name: event.name ?? '',
        description: event.description ?? '',
        start: event.start ?? null,
        end: event.end ?? null,
        venue: event.venue ?? null,
        currency: event.currency ?? 'GBP',
        url: publicUrl,
        images: event.images ?? null,
      },
      availability: {
        totalCapacity,
        ticketsSold,
        ticketsAvailable: ticketsAvailable ?? 0,
        isSoldOut,
        isLowStock,
      },
      ticketTypes: ticketTypes.map((tt: Record<string, unknown>) => ({
        id: tt?.id ?? '',
        name: tt?.name ?? '',
        price: tt?.price ?? 0,
        description: tt?.description ?? '',
        quantity: tt?.quantity ?? 0,
      })),
    });

  } catch (error) {
    console.error('Error fetching event details:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch event details' },
      { status: 500 }
    );
  }
}
