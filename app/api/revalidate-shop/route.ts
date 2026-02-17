import { NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';

/**
 * Invalida la caché del catálogo del shop.
 * Solo se refresca cuando se llama a esta ruta (p. ej. webhook WooCommerce o botón en admin).
 *
 * Uso:
 *   POST /api/revalidate-shop
 *   Header: x-revalidate-secret: <REVALIDATE_SHOP_SECRET>
 *   o Body: { "secret": "<REVALIDATE_SHOP_SECRET>" }
 *
 * Configurar REVALIDATE_SHOP_SECRET en .env (ej: un string aleatorio largo).
 */
export async function POST(request: Request) {
  try {
    let body: { secret?: string } = {};
    try {
      body = await request.json();
    } catch {
      // body vacío o no JSON
    }
    const secret =
      request.headers.get('x-revalidate-secret') ?? body.secret;

    const expected = process.env.REVALIDATE_SHOP_SECRET;
    if (!expected || secret !== expected) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    revalidateTag('shop-products');

    return NextResponse.json({
      success: true,
      message: 'Shop cache invalidated; next requests will refetch from WooCommerce.',
    });
  } catch (error) {
    console.error('Revalidate shop error:', error);
    return NextResponse.json(
      { success: false, error: 'Revalidation failed' },
      { status: 500 }
    );
  }
}
