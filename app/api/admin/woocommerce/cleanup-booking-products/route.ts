import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import getWooCommerce from '@/lib/woocommerce';

/**
 * Limpia productos de WooCommerce de la categoría "Bookings" que:
 * - Nunca se vendieron (no están en bookings.wc_product_id)
 * - Fueron creados hace más de X horas (por defecto 24)
 *
 * Los mueve a la papelera de WooCommerce (no borrado permanente).
 * Llamar por cron (Vercel Cron) o manualmente con el secret.
 *
 * GET o POST ?hours=24&secret=BOOKING_CLEANUP_SECRET
 */
function requireCleanupSecret(request: Request): boolean {
  const secret = process.env.BOOKING_CLEANUP_SECRET;
  if (!secret) return false;
  const url = new URL(request.url);
  const paramSecret = url.searchParams.get('secret');
  const headerSecret = request.headers.get('x-cleanup-secret');
  return paramSecret === secret || headerSecret === secret;
}

export async function GET(request: Request) {
  if (!requireCleanupSecret(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return runCleanup(request);
}

export async function POST(request: Request) {
  if (!requireCleanupSecret(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return runCleanup(request);
}

async function runCleanup(request: Request) {
  try {
    const url = new URL(request.url);
    const hoursParam = url.searchParams.get('hours');
    const hours = Math.max(1, parseInt(hoursParam || '24', 10) || 24);
    const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();

    const { rows: soldRows } = await sql.query<{ wc_product_id: number }>(
      `SELECT wc_product_id FROM bookings WHERE wc_product_id IS NOT NULL`
    );
    const soldIds = new Set(soldRows.map((r) => r.wc_product_id));

    const WooCommerce = getWooCommerce();
    const categories = await WooCommerce.get('products/categories', {
      search: 'Bookings',
    });
    const data = categories.data as Array<{ id: number }>;
    const categoryId = data?.[0]?.id;
    if (!categoryId) {
      return NextResponse.json({
        success: true,
        trashed: 0,
        message: 'No Bookings category found',
      });
    }

    let trashed = 0;
    let page = 1;
    const perPage = 100;

    while (true) {
      const response = await WooCommerce.get('products', {
        category: categoryId,
        per_page: perPage,
        page,
        orderby: 'date',
        order: 'asc',
      });
      const products = (response.data as Array<{ id: number; date_created: string }>) ?? [];
      if (products.length === 0) break;

      for (const p of products) {
        if (soldIds.has(p.id)) continue;
        const created = p.date_created ? new Date(p.date_created).toISOString() : '';
        if (created && created < cutoff) {
          try {
            await WooCommerce.delete(`products/${p.id}`, { force: false });
            trashed++;
          } catch (err) {
            console.warn(`Failed to trash product ${p.id}:`, err);
          }
        }
      }

      if (products.length < perPage) break;
      page++;
    }

    return NextResponse.json({
      success: true,
      trashed,
      message: `Moved ${trashed} orphan booking products to trash (older than ${hours}h, never sold)`,
    });
  } catch (error) {
    console.error('Cleanup booking products error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Cleanup failed',
      },
      { status: 500 }
    );
  }
}
