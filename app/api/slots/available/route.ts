import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const experienceSlug = searchParams.get('experience');
  const fromDate =
    searchParams.get('from') || new Date().toISOString().split('T')[0];
  const toDate = searchParams.get('to');

  if (!experienceSlug) {
    return NextResponse.json(
      { error: 'experience parameter is required' },
      { status: 400 }
    );
  }

  try {
    // Calcular available basándose en bookings confirmados reales, no solo en el campo booked
    // Esto asegura que los slots se muestren correctamente incluso si hay desincronización
    let query = `
      SELECT 
        s.id,
        s.experience_slug,
        s.date,
        s.time,
        s.capacity,
        s.booked,
        COALESCE(SUM(b.guests), 0) as actual_booked,
        (s.capacity - COALESCE(SUM(b.guests), 0)) as available,
        s.price_per_person,
        s.is_active
      FROM slots s
      LEFT JOIN bookings b ON s.id = b.slot_id AND b.status = 'confirmed'
      WHERE s.experience_slug = $1
        AND s.is_active = true
        AND s.date >= $2
      GROUP BY s.id, s.experience_slug, s.date, s.time, s.capacity, s.booked, s.price_per_person, s.is_active
      HAVING (s.capacity - COALESCE(SUM(b.guests), 0)) > 0
    `;

    const params: (string | number)[] = [experienceSlug, fromDate];

    if (toDate) {
      query += ` AND s.date <= $3`;
      params.push(toDate);
    }

    query += ` ORDER BY s.date ASC, s.time ASC`;

    const { rows } = await sql.query(query, params);

    return NextResponse.json({
      success: true,
      slots: rows,
    });
  } catch (error) {
    console.error('Error fetching available slots:', error);
    return NextResponse.json(
      { error: 'Failed to fetch available slots' },
      { status: 500 }
    );
  }
}
