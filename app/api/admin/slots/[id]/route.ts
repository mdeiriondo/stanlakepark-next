import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { addCorsHeaders, handleOptionsRequest } from '@/lib/api/cors';

export async function OPTIONS() {
  return handleOptionsRequest();
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const { rows } = await sql.query(
      `SELECT * FROM slots WHERE id = $1`,
      [id]
    );
    
    if (rows.length === 0) {
      const response = NextResponse.json(
        {
          success: false,
          error: 'Slot not found',
        },
        { status: 404 }
      );
      
      return addCorsHeaders(response);
    }
    
    const response = NextResponse.json({
      success: true,
      slot: rows[0],
    });
    
    return addCorsHeaders(response);
  } catch (error) {
    console.error('Error fetching slot:', error);
    const response = NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch slot',
      },
      { status: 500 }
    );
    
    return addCorsHeaders(response);
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { date, time, capacity, price_per_person, is_active } = body;
    
    // Verificar que el slot existe
    const { rows: existingRows } = await sql.query(
      `SELECT booked FROM slots WHERE id = $1`,
      [id]
    );
    
    if (existingRows.length === 0) {
      const response = NextResponse.json(
        {
          success: false,
          error: 'Slot not found',
        },
        { status: 404 }
      );
      
      return addCorsHeaders(response);
    }
    
    const currentBooked = parseInt(existingRows[0].booked || '0', 10);
    
    // Validación crítica: no permitir reducir capacity por debajo de booked
    if (capacity !== undefined && capacity < currentBooked) {
      const response = NextResponse.json(
        {
          success: false,
          error: `Cannot set capacity to ${capacity}. Current bookings: ${currentBooked}`,
        },
        { status: 400 }
      );
      
      return addCorsHeaders(response);
    }
    
    // Construir query de actualización dinámica
    const updates: string[] = [];
    const values: (string | number | boolean)[] = [];
    let paramIndex = 1;
    
    if (date !== undefined) {
      updates.push(`date = $${paramIndex}`);
      values.push(date);
      paramIndex++;
    }
    
    if (time !== undefined) {
      updates.push(`time = $${paramIndex}`);
      values.push(time);
      paramIndex++;
    }
    
    if (capacity !== undefined) {
      updates.push(`capacity = $${paramIndex}`);
      values.push(capacity);
      paramIndex++;
    }
    
    if (price_per_person !== undefined) {
      updates.push(`price_per_person = $${paramIndex}`);
      values.push(price_per_person);
      paramIndex++;
    }
    
    if (is_active !== undefined) {
      updates.push(`is_active = $${paramIndex}`);
      values.push(is_active);
      paramIndex++;
    }
    
    if (updates.length === 0) {
      const response = NextResponse.json(
        {
          success: false,
          error: 'No fields to update',
        },
        { status: 400 }
      );
      
      return addCorsHeaders(response);
    }
    
    // Agregar updated_at y el id al final
    updates.push(`updated_at = NOW()`);
    values.push(id);
    
    const query = `
      UPDATE slots 
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;
    
    const { rows } = await sql.query(query, values);
    
    const response = NextResponse.json({
      success: true,
      slot: rows[0],
    });
    
    return addCorsHeaders(response);
  } catch (error) {
    console.error('Error updating slot:', error);
    const response = NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update slot',
      },
      { status: 500 }
    );
    
    return addCorsHeaders(response);
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Verificar que no tenga bookings
    const { rows: slotRows } = await sql.query(
      `SELECT booked FROM slots WHERE id = $1`,
      [id]
    );
    
    if (slotRows.length === 0) {
      const response = NextResponse.json(
        {
          success: false,
          error: 'Slot not found',
        },
        { status: 404 }
      );
      
      return addCorsHeaders(response);
    }
    
    const booked = parseInt(slotRows[0].booked || '0', 10);
    
    if (booked > 0) {
      const response = NextResponse.json(
        {
          success: false,
          error: 'Cannot delete slot with bookings',
        },
        { status: 400 }
      );
      
      return addCorsHeaders(response);
    }
    
    await sql.query(`DELETE FROM slots WHERE id = $1`, [id]);
    
    const response = NextResponse.json({
      success: true,
      message: 'Slot deleted successfully',
    });
    
    return addCorsHeaders(response);
  } catch (error) {
    console.error('Error deleting slot:', error);
    const response = NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete slot',
      },
      { status: 500 }
    );
    
    return addCorsHeaders(response);
  }
}
