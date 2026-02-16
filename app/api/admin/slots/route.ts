import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { addCorsHeaders, handleOptionsRequest } from '@/lib/api/cors';

export async function OPTIONS() {
  return handleOptionsRequest();
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Paginación
    const page = parseInt(searchParams.get('page') || '1', 10);
    const perPage = parseInt(searchParams.get('per_page') || '20', 10);
    const offset = (page - 1) * perPage;
    
    // Filtros
    const experience = searchParams.get('experience');
    const status = searchParams.get('status');
    const dateFrom = searchParams.get('date_from');
    const dateTo = searchParams.get('date_to');
    const search = searchParams.get('search');
    
    // Construir query base
    let query = `
      SELECT 
        id, experience_slug, date, time, capacity, booked,
        (capacity - booked) as available,
        price_per_person, is_active, created_at, updated_at
      FROM slots
      WHERE 1=1
    `;
    
    const params: (string | number)[] = [];
    let paramIndex = 1;
    
    // Aplicar filtros
    if (experience) {
      query += ` AND experience_slug = $${paramIndex}`;
      params.push(experience);
      paramIndex++;
    }
    
    if (status === 'active') {
      query += ` AND is_active = true`;
    } else if (status === 'inactive') {
      query += ` AND is_active = false`;
    } else if (status === 'soldout') {
      query += ` AND (capacity - booked) <= 0 AND is_active = true`;
    }
    
    if (dateFrom) {
      query += ` AND date >= $${paramIndex}`;
      params.push(dateFrom);
      paramIndex++;
    }
    
    if (dateTo) {
      query += ` AND date <= $${paramIndex}`;
      params.push(dateTo);
      paramIndex++;
    }
    
    if (search) {
      query += ` AND (experience_slug ILIKE $${paramIndex} OR date::text ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }
    
    // Ordenamiento
    query += ` ORDER BY date ASC, time ASC`;
    
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
    
    const response = NextResponse.json({
      success: true,
      slots: rows,
      pagination: {
        page,
        per_page: perPage,
        total,
        total_pages: totalPages,
      },
    });
    
    return addCorsHeaders(response);
  } catch (error) {
    console.error('Error fetching slots:', error);
    const response = NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch slots',
      },
      { status: 500 }
    );
    
    return addCorsHeaders(response);
  }
}
