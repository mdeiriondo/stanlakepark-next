import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { addCorsHeaders, handleOptionsRequest } from '@/lib/api/cors';

export async function OPTIONS() {
  return handleOptionsRequest();
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      experience_slug,
      date,
      time,
      capacity,
      price_per_person,
      is_active = true,
    } = body;
    
    // Validaciones
    if (!experience_slug || !date || !time || capacity === undefined || price_per_person === undefined) {
      const response = NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: experience_slug, date, time, capacity, price_per_person',
        },
        { status: 400 }
      );
      
      return addCorsHeaders(response);
    }
    
    if (capacity < 1) {
      const response = NextResponse.json(
        {
          success: false,
          error: 'Capacity must be at least 1',
        },
        { status: 400 }
      );
      
      return addCorsHeaders(response);
    }
    
    if (price_per_person < 0) {
      const response = NextResponse.json(
        {
          success: false,
          error: 'Price per person must be >= 0',
        },
        { status: 400 }
      );
      
      return addCorsHeaders(response);
    }
    
    // Verificar duplicado
    const { rows: existingRows } = await sql.query(
      `SELECT id FROM slots WHERE experience_slug = $1 AND date = $2 AND time = $3`,
      [experience_slug, date, time]
    );
    
    if (existingRows.length > 0) {
      const response = NextResponse.json(
        {
          success: false,
          error: 'A slot with the same experience, date, and time already exists',
        },
        { status: 409 }
      );
      
      return addCorsHeaders(response);
    }
    
    // Insertar slot
    const { rows } = await sql.query(
      `INSERT INTO slots (experience_slug, date, time, capacity, price_per_person, is_active)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [experience_slug, date, time, capacity, price_per_person, is_active]
    );
    
    const response = NextResponse.json({
      success: true,
      slot: rows[0],
    });
    
    return addCorsHeaders(response);
  } catch (error) {
    console.error('Error creating slot:', error);
    const response = NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create slot',
      },
      { status: 500 }
    );
    
    return addCorsHeaders(response);
  }
}
