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
    let query = `
      SELECT 
        id,
        experience_slug,
        date,
        time,
        capacity,
        booked,
        (capacity - booked) as available,
        price_per_person,
        is_active
      FROM slots
      WHERE experience_slug = $1
        AND is_active = true
        AND date >= $2
        AND (capacity - booked) > 0
    `;

    const params: (string | number)[] = [experienceSlug, fromDate];

    if (toDate) {
      query += ` AND date <= $3`;
      params.push(toDate);
    }

    query += ` ORDER BY date ASC, time ASC`;

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
