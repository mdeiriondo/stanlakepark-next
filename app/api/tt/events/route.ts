// app/api/tt/events/route.ts
import { NextResponse } from 'next/server';

const TT_API_KEY = process.env.TICKET_TAILOR_API_KEY!;
const TT_API_BASE = 'https://api.tickettailor.com/v1';

// Helper function to create Basic Auth header
function getAuthHeader() {
  const credentials = Buffer.from(`${TT_API_KEY}:`).toString('base64');
  return `Basic ${credentials}`;
}

export async function GET() {
  try {
    const response = await fetch(`${TT_API_BASE}/events`, {
      headers: {
        'Authorization': getAuthHeader(),
        'Content-Type': 'application/json',
      },
      next: { revalidate: 60 }, // Cache for 60 seconds
    });

    if (!response.ok) {
      throw new Error(`Ticket Tailor API error: ${response.status}`);
    }

    const data = await response.json();

    // Filter out past events and sort by start date
    const upcomingEvents = data.data
      .filter((event: any) => new Date(event.start.iso) > new Date())
      .sort((a: any, b: any) => 
        new Date(a.start.iso).getTime() - new Date(b.start.iso).getTime()
      );

    return NextResponse.json({
      success: true,
      events: upcomingEvents,
      total: upcomingEvents.length,
    });

  } catch (error) {
    console.error('Error fetching Ticket Tailor events:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch events' },
      { status: 500 }
    );
  }
}
