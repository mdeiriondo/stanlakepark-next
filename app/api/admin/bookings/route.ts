import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Paginación
    const page = parseInt(searchParams.get('page') || '1', 10);
    const perPage = parseInt(searchParams.get('per_page') || '20', 10);
    const offset = (page - 1) * perPage;
    
    // Filtros
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    
    // Construir query base con JOIN
    let query = `
      SELECT 
        b.*,
        s.experience_slug,
        s.date as slot_date,
        s.time as slot_time
      FROM bookings b
      JOIN slots s ON b.slot_id = s.id
      WHERE 1=1
    `;
    
    const params: (string | number)[] = [];
    let paramIndex = 1;
    
    // Aplicar filtros
    if (status) {
      query += ` AND b.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }
    
    if (search) {
      query += ` AND (
        b.customer_email ILIKE $${paramIndex} OR 
        b.customer_name ILIKE $${paramIndex} OR 
        b.booking_reference ILIKE $${paramIndex}
      )`;
      params.push(`%${search}%`);
      paramIndex++;
    }
    
    // Ordenamiento
    query += ` ORDER BY b.created_at DESC`;
    
    // Contar total para paginación
    const countQuery = query.replace(
      /SELECT[\s\S]*?FROM/,
      'SELECT COUNT(*) as total FROM'
    ).replace(/ORDER BY[\s\S]*$/, '');
    
    const { rows: countRows } = await sql.query(countQuery, params);
    const total = parseInt(countRows[0]?.total || '0', 10);
    const totalPages = Math.ceil(total / perPage);
    
    // Aplicar límite y offset
    query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(perPage, offset);
    
    const { rows } = await sql.query(query, params);
    
    return NextResponse.json({
      success: true,
      bookings: rows,
      pagination: {
        page,
        per_page: perPage,
        total,
        total_pages: totalPages,
      },
    });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch bookings',
      },
      { status: 500 }
    );
  }
}
