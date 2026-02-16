import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function GET() {
  try {
    const { rows } = await sql.query(`SELECT NOW() as current_time`);
    
    return NextResponse.json({
      success: true,
      connected: true,
      server_time: rows[0]?.current_time,
    });
  } catch (error) {
    console.error('Database connection error:', error);
    return NextResponse.json(
      {
        success: false,
        connected: false,
        error: error instanceof Error ? error.message : 'Database connection failed',
      },
      { status: 500 }
    );
  }
}
