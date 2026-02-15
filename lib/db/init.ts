import { sql } from '@vercel/postgres';
import { readFileSync } from 'fs';
import { join } from 'path';

export async function initDatabase() {
  const schemaSQL = readFileSync(
    join(process.cwd(), 'lib/db/schema.sql'),
    'utf-8'
  );

  // Ejecutar cada sentencia por separado (algunos clientes no soportan múltiples en uno)
  const statements = schemaSQL
    .split(';')
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  try {
    for (const statement of statements) {
      if (statement) await sql.query(statement + ';');
    }
    console.log('✅ Database initialized successfully');
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  }
}
