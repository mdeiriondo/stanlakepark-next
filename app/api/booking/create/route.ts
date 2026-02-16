import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import getWooCommerce, {
  createBookingProduct,
  getCheckoutUrl,
} from '@/lib/woocommerce';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { slotId, guests, experienceName, voucherCode } = body;

    if (!slotId || !guests || !experienceName) {
      return NextResponse.json(
        {
          error:
            'Missing required fields: slotId, guests, experienceName',
        },
        { status: 400 }
      );
    }

    const { rows: slotRows } = await sql.query(
      `SELECT * FROM slots WHERE id = $1 AND is_active = true`,
      [slotId]
    );
    const slot = slotRows[0];

    if (!slot) {
      return NextResponse.json(
        { error: 'Slot not found or inactive' },
        { status: 404 }
      );
    }

    const available = Number(slot.capacity) - Number(slot.booked);

    if (available < guests) {
      return NextResponse.json(
        {
          error: `Not enough availability. Only ${available} spots left.`,
        },
        { status: 400 }
      );
    }

    let product: { id: number };
    let checkoutUrl: string;

    let soldProductIds: number[] = [];
    try {
      const { rows: soldRows } = await sql.query<{ wc_product_id: number }>(
        `SELECT wc_product_id FROM bookings WHERE wc_product_id IS NOT NULL`
      );
      soldProductIds = soldRows.map((r) => r.wc_product_id);
    } catch {
      soldProductIds = [];
    }

    if (voucherCode) {
      const baseUrl =
        process.env.NEXT_PUBLIC_SITE_URL ||
        (process.env.VERCEL_URL
          ? `https://${process.env.VERCEL_URL}`
          : 'http://localhost:3000');
      const voucherResponse = await fetch(
        `${baseUrl}/api/vouchers/validate`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code: voucherCode }),
        }
      );

      const voucherData = await voucherResponse.json();

      if (!voucherData.success) {
        return NextResponse.json(
          { error: voucherData.error || 'Invalid voucher' },
          { status: 400 }
        );
      }

      try {
        product = await createBookingProduct(
          {
            experienceName,
            experienceSlug: slot.experience_slug,
            date: slot.date,
            time: slot.time,
            guests,
            pricePerPerson: 0,
            slotId: slot.id,
          },
          { soldProductIds }
        );
      } catch (productError) {
        console.error('Product creation failed:', productError);
        return NextResponse.json(
          {
            success: false,
            error:
              productError instanceof Error
                ? productError.message
                : 'Failed to create product in WooCommerce',
          },
          { status: 500 }
        );
      }

      const WooCommerce = getWooCommerce();
      const existingProduct = await WooCommerce.get(`products/${product.id}`);
      const meta = (existingProduct.data as { meta_data?: { key: string; value: string }[] })
        ?.meta_data ?? [];
      await WooCommerce.put(`products/${product.id}`, {
        meta_data: [
          ...meta,
          { key: '_used_voucher_code', value: voucherCode },
        ],
      });

      checkoutUrl = `${process.env.WC_STORE_URL}/checkout/?add-to-cart=${product.id}&coupon_code=${encodeURIComponent(voucherCode)}`;
    } else {
      try {
        product = await createBookingProduct(
          {
            experienceName,
            experienceSlug: slot.experience_slug,
            date: slot.date,
            time: slot.time,
            guests,
            pricePerPerson: parseFloat(slot.price_per_person),
            slotId: slot.id,
          },
          { soldProductIds }
        );
      } catch (productError) {
        console.error('Product creation failed:', productError);
        return NextResponse.json(
          {
            success: false,
            error:
              productError instanceof Error
                ? productError.message
                : 'Failed to create product in WooCommerce',
          },
          { status: 500 }
        );
      }

      checkoutUrl = getCheckoutUrl(product.id);
    }

    // NO incrementar booked aquí - solo se incrementa cuando el pago se confirma
    // en el webhook de WooCommerce. Esto evita que slots queden ocupados sin pago.

    return NextResponse.json({
      success: true,
      checkoutUrl,
      productId: product.id,
      slotId: slot.id,
    });
  } catch (error) {
    console.error('Error creating booking:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'Failed to create booking';
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        details:
          error instanceof Error && error.message
            ? error.message
            : 'Unknown error occurred',
      },
      { status: 500 }
    );
  }
}
