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
      throw new Error(`Event not found: ${eventResponse.status}`);
    }

    const eventData = await eventResponse.json();
    const event = eventData.data;

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
    const issuedTickets = ticketsData.data || [];

    // Calculate availability
    const totalCapacity = event.total_tickets || 0;
    const ticketsSold = issuedTickets.length;
    const ticketsAvailable = totalCapacity - ticketsSold;
    const isSoldOut = ticketsAvailable <= 0;
    const isLowStock = ticketsAvailable > 0 && ticketsAvailable <= 5;

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
    const ticketTypes = ticketTypesData.data || [];

    return NextResponse.json({
      success: true,
      event: {
        id: event.id,
        name: event.name,
        description: event.description,
        start: event.start,
        end: event.end,
        venue: event.venue,
        currency: event.currency,
        url: event.url,
        images: event.images,
      },
      availability: {
        totalCapacity,
        ticketsSold,
        ticketsAvailable,
        isSoldOut,
        isLowStock,
      },
      ticketTypes: ticketTypes.map((tt: any) => ({
        id: tt.id,
        name: tt.name,
        price: tt.price,
        description: tt.description,
        quantity: tt.quantity,
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
