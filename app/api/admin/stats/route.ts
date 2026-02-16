import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { addCorsHeaders, handleOptionsRequest } from '@/lib/api/cors';

export async function OPTIONS() {
  return handleOptionsRequest();
}

export async function GET() {
  try {
    // 1. Bookings hoy
    const { rows: todayRows } = await sql.query(
      `SELECT COUNT(*) as today 
       FROM bookings 
       WHERE DATE(created_at) = CURRENT_DATE`
    );
    const bookingsToday = parseInt(todayRows[0]?.today || '0', 10);
    
    // 2. Bookings esta semana
    const { rows: weekRows } = await sql.query(
      `SELECT COUNT(*) as this_week 
       FROM bookings 
       WHERE created_at >= DATE_TRUNC('week', CURRENT_DATE)`
    );
    const bookingsThisWeek = parseInt(weekRows[0]?.this_week || '0', 10);
    
    // 3. Bookings próximos 7 días
    const { rows: next7Rows } = await sql.query(
      `SELECT COUNT(*) as next_7_days 
       FROM bookings b
       JOIN slots s ON b.slot_id = s.id
       WHERE s.date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '7 days'`
    );
    const bookingsNext7Days = parseInt(next7Rows[0]?.next_7_days || '0', 10);
    
    // 4. Revenue últimos 30 días
    const { rows: revenueRows } = await sql.query(
      `SELECT COALESCE(SUM(total_price), 0) as revenue 
       FROM bookings 
       WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
         AND status = 'confirmed'`
    );
    const revenueLast30Days = parseFloat(revenueRows[0]?.revenue || '0');
    
    // 5. Próximos slots con bookings
    const { rows: upcomingSlots } = await sql.query(
      `SELECT 
        s.id, s.experience_slug, s.date, s.time,
        s.capacity, s.booked,
        (s.capacity - s.booked) as available
       FROM slots s
       WHERE s.date >= CURRENT_DATE
         AND s.is_active = true
         AND s.booked > 0
       ORDER BY s.date ASC, s.time ASC
       LIMIT 10`
    );
    
    // 6. Ocupación por experiencia
    const { rows: occupancyRows } = await sql.query(
      `SELECT 
        experience_slug,
        COUNT(*) as total_slots,
        SUM(booked) as total_booked,
        SUM(capacity) as total_capacity,
        ROUND((SUM(booked)::decimal / NULLIF(SUM(capacity), 0) * 100), 2) as occupancy_rate
       FROM slots
       WHERE date >= CURRENT_DATE AND is_active = true
       GROUP BY experience_slug
       ORDER BY occupancy_rate DESC`
    );
    
    const response = NextResponse.json({
      success: true,
      stats: {
        bookings_today: bookingsToday,
        bookings_this_week: bookingsThisWeek,
        bookings_next_7_days: bookingsNext7Days,
        revenue_last_30_days: revenueLast30Days,
      },
      upcoming_slots: upcomingSlots,
      occupancy_by_experience: occupancyRows,
    });
    
    return addCorsHeaders(response);
  } catch (error) {
    console.error('Error fetching stats:', error);
    const response = NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch stats',
      },
      { status: 500 }
    );
    
    return addCorsHeaders(response);
  }
}
