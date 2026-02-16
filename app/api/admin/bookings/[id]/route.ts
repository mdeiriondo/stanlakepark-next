import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const { rows } = await sql.query(
      `SELECT 
        b.*,
        s.experience_slug,
        s.date as slot_date,
        s.time as slot_time,
        s.capacity,
        s.price_per_person
      FROM bookings b
      JOIN slots s ON b.slot_id = s.id
      WHERE b.id = $1`,
      [id]
    );
    
    if (rows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Booking not found',
        },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      booking: rows[0],
    });
  } catch (error) {
    console.error('Error fetching booking:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch booking',
      },
      { status: 500 }
    );
  }
}
