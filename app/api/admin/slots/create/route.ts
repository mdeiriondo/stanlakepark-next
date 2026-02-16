import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

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
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: experience_slug, date, time, capacity, price_per_person',
        },
        { status: 400 }
      );
    }
    
    if (capacity < 1) {
      return NextResponse.json(
        {
          success: false,
          error: 'Capacity must be at least 1',
        },
        { status: 400 }
      );
    }
    
    if (price_per_person < 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Price per person must be >= 0',
        },
        { status: 400 }
      );
    }
    
    // Verificar duplicado
    const { rows: existingRows } = await sql.query(
      `SELECT id FROM slots WHERE experience_slug = $1 AND date = $2 AND time = $3`,
      [experience_slug, date, time]
    );
    
    if (existingRows.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'A slot with the same experience, date, and time already exists',
        },
        { status: 409 }
      );
    }
    
    // Insertar slot
    const { rows } = await sql.query(
      `INSERT INTO slots (experience_slug, date, time, capacity, price_per_person, is_active)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [experience_slug, date, time, capacity, price_per_person, is_active]
    );
    
    return NextResponse.json({
      success: true,
      slot: rows[0],
    });
  } catch (error) {
    console.error('Error creating slot:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create slot',
      },
      { status: 500 }
    );
  }
}
