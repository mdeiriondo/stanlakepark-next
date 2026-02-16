import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { addCorsHeaders, handleOptionsRequest } from '@/lib/api/cors';

export async function OPTIONS() {
  return handleOptionsRequest();
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // 1. Get booking info
    const { rows } = await sql.query(
      'SELECT * FROM bookings WHERE id = $1',
      [id]
    );
    const booking = rows[0];

    if (!booking) {
      const response = NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
      return addCorsHeaders(response);
    }

    if (booking.status === 'cancelled') {
      const response = NextResponse.json(
        { error: 'Booking already cancelled' },
        { status: 400 }
      );
      return addCorsHeaders(response);
    }

    // 2. Update booking status to cancelled
    await sql.query(
      `UPDATE bookings 
       SET status = 'cancelled', updated_at = NOW()
       WHERE id = $1`,
      [id]
    );

    // 3. Free up slot capacity (ensure booked never goes negative)
    await sql.query(
      `UPDATE slots 
       SET booked = GREATEST(0, booked - $1), updated_at = NOW()
       WHERE id = $2`,
      [booking.guests, booking.slot_id]
    );

    const response = NextResponse.json({
      success: true,
      message: 'Booking cancelled and slot capacity freed',
    });

    return addCorsHeaders(response);
  } catch (error) {
    console.error('Error cancelling booking:', error);
    const response = NextResponse.json(
      { error: 'Failed to cancel booking' },
      { status: 500 }
    );
    return addCorsHeaders(response);
  }
}
