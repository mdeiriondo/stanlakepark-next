import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import {
  createBookingProduct,
  getCheckoutUrl,
} from '@/lib/woocommerce';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { slotId, guests, experienceName } = body;

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

    let product;
    try {
      product = await createBookingProduct({
        experienceName,
        experienceSlug: slot.experience_slug,
        date: slot.date,
        time: slot.time,
        guests,
        pricePerPerson: parseFloat(slot.price_per_person),
        slotId: slot.id,
      });
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

    const checkoutUrl = getCheckoutUrl(product.id);

    await sql.query(
      `UPDATE slots SET booked = booked + $1 WHERE id = $2`,
      [guests, slotId]
    );

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
