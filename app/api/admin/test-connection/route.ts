import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { addCorsHeaders, handleOptionsRequest } from '@/lib/api/cors';

export async function OPTIONS() {
  return handleOptionsRequest();
}

export async function GET() {
  try {
    const { rows } = await sql.query(`SELECT NOW() as current_time`);
    
    const response = NextResponse.json({
      success: true,
      connected: true,
      server_time: rows[0]?.current_time,
    });
    
    return addCorsHeaders(response);
  } catch (error) {
    console.error('Database connection error:', error);
    const response = NextResponse.json(
      {
        success: false,
        connected: false,
        error: error instanceof Error ? error.message : 'Database connection failed',
      },
      { status: 500 }
    );
    
    return addCorsHeaders(response);
  }
}
