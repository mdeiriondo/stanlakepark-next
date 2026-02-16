import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { eachDayOfInterval, format, parseISO } from 'date-fns';

// Mapeo de días de la semana
const DAY_MAP: Record<string, number> = {
  sunday: 0,
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      experience_slug,
      days_of_week,
      times,
      date_from,
      date_until,
      capacity,
      price_per_person,
    } = body;
    
    // Validaciones
    if (!experience_slug || !days_of_week || !times || !date_from || !date_until || capacity === undefined || price_per_person === undefined) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: experience_slug, days_of_week, times, date_from, date_until, capacity, price_per_person',
        },
        { status: 400 }
      );
    }
    
    if (!Array.isArray(days_of_week) || days_of_week.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'days_of_week must be a non-empty array',
        },
        { status: 400 }
      );
    }
    
    if (!Array.isArray(times) || times.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'times must be a non-empty array',
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
    
    // Convertir nombres de días a números
    const dayNumbers = days_of_week.map((day: string) => {
      const dayLower = day.toLowerCase();
      if (DAY_MAP[dayLower] === undefined) {
        throw new Error(`Invalid day: ${day}`);
      }
      return DAY_MAP[dayLower];
    });
    
    // Generar todas las fechas en el rango
    const startDate = parseISO(date_from);
    const endDate = parseISO(date_until);
    const allDates = eachDayOfInterval({ start: startDate, end: endDate });
    
    // Filtrar fechas que coinciden con los días de la semana
    const matchingDates = allDates.filter((date) => {
      const dayOfWeek = date.getDay();
      return dayNumbers.includes(dayOfWeek);
    });
    
    let created = 0;
    let skipped = 0;
    const total = matchingDates.length * times.length;
    
    // Crear slots para cada fecha y hora
    for (const date of matchingDates) {
      const dateStr = format(date, 'yyyy-MM-dd');
      
      for (const time of times) {
        try {
          // Usar ON CONFLICT DO NOTHING para evitar duplicados
          const { rowCount } = await sql.query(
            `INSERT INTO slots (experience_slug, date, time, capacity, price_per_person, is_active)
             VALUES ($1, $2, $3, $4, $5, true)
             ON CONFLICT (experience_slug, date, time) DO NOTHING`,
            [experience_slug, dateStr, time, capacity, price_per_person]
          );
          
          if (rowCount && rowCount > 0) {
            created++;
          } else {
            skipped++;
          }
        } catch (error) {
          console.error(`Error creating slot for ${dateStr} ${time}:`, error);
          skipped++;
        }
      }
    }
    
    return NextResponse.json({
      success: true,
      created,
      skipped,
      total,
    });
  } catch (error) {
    console.error('Error bulk creating slots:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to bulk create slots',
      },
      { status: 500 }
    );
  }
}
