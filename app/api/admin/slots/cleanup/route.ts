import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { addCorsHeaders, handleOptionsRequest } from '@/lib/api/cors';

/**
 * Limpia slots que tienen booked > 0 pero no tienen bookings asociados
 * Esto corrige el problema de slots que quedaron ocupados sin pago
 */
export async function OPTIONS() {
  return handleOptionsRequest();
}

export async function POST() {
  try {
    // Encontrar slots con booked > 0 pero sin bookings confirmados
    const { rows: orphanedSlots } = await sql.query(
      `SELECT 
        s.id, 
        s.booked,
        COALESCE(SUM(b.guests), 0) as actual_bookings
      FROM slots s
      LEFT JOIN bookings b ON s.id = b.slot_id AND b.status = 'confirmed'
      WHERE s.booked > 0
      GROUP BY s.id, s.booked
      HAVING COALESCE(SUM(b.guests), 0) < s.booked`
    );
    
    let fixed = 0;
    let totalOrphaned = 0;
    
    for (const slot of orphanedSlots) {
      const actualBookings = parseInt(slot.actual_bookings || '0', 10);
      const currentBooked = parseInt(slot.booked || '0', 10);
      const orphaned = currentBooked - actualBookings;
      
      if (orphaned > 0) {
        totalOrphaned += orphaned;
        
        // Actualizar el slot con el número correcto de bookings
        await sql.query(
          `UPDATE slots SET booked = $1 WHERE id = $2`,
          [actualBookings, slot.id]
        );
        
        fixed++;
      }
    }
    
    const response = NextResponse.json({
      success: true,
      message: `Cleaned up ${fixed} slots`,
      fixed_slots: fixed,
      total_orphaned_bookings: totalOrphaned,
      details: orphanedSlots.map((s: any) => ({
        slot_id: s.id,
        previous_booked: s.booked,
        actual_bookings: s.actual_bookings,
        fixed_to: s.actual_bookings,
      })),
    });
    
    return addCorsHeaders(response);
  } catch (error) {
    console.error('Error cleaning up slots:', error);
    const response = NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to cleanup slots',
      },
      { status: 500 }
    );
    
    return addCorsHeaders(response);
  }
}
