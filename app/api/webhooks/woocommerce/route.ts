import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import crypto from 'crypto';

function verifyWebhookSignature(body: string, signature: string): boolean {
  const secret = process.env.WC_WEBHOOK_SECRET!;
  if (!secret) return false;
  const hash = crypto
    .createHmac('sha256', secret)
    .update(body)
    .digest('base64');
  return hash === signature;
}

function generateBookingReference(): string {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, '0');
  return `SP-${year}-${random}`;
}

export async function POST(request: Request) {
  try {
    const signature = request.headers.get('x-wc-webhook-signature');
    const body = await request.text();

    if (!signature || !verifyWebhookSignature(body, signature)) {
      return NextResponse.json(
        { error: 'Invalid webhook signature' },
        { status: 401 }
      );
    }

    const payload = JSON.parse(body) as {
      id: number;
      number?: string;
      status: string;
      billing?: { email?: string; first_name?: string; last_name?: string };
      payment_method_title?: string;
      line_items?: Array<{
        total: string;
        meta_data?: Array<{ key: string; value: string }>;
      }>;
    };

    if (!['completed', 'processing'].includes(payload.status)) {
      return NextResponse.json({ message: 'Order status not actionable' });
    }

    const lineItems = payload.line_items ?? [];
    const billing = payload.billing ?? {};

    for (const item of lineItems) {
      const meta = item.meta_data ?? [];
      const getMeta = (key: string) =>
        meta.find((m: { key: string; value: string }) => m.key === key)?.value;
      const slotId = getMeta('_booking_slot_id');
      const guests = getMeta('_booking_guests');
      const date = getMeta('_booking_date');
      const time = getMeta('_booking_time');

      if (!slotId || !guests) continue;

      const { rows: existingBookings } = await sql.query(
        `SELECT id FROM bookings WHERE wc_order_id = $1 AND slot_id = $2`,
        [payload.id, parseInt(slotId, 10)]
      );

      if (existingBookings.length > 0) {
        continue;
      }

      const bookingReference = generateBookingReference();
      const customerName = [
        billing.first_name,
        billing.last_name,
      ]
        .filter(Boolean)
        .join(' ')
        .trim() || 'Guest';

      await sql.query(
        `INSERT INTO bookings (
          slot_id,
          wc_order_id,
          customer_email,
          customer_name,
          guests,
          total_price,
          status,
          booking_reference,
          metadata
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [
          parseInt(slotId, 10),
          payload.id,
          billing.email || '',
          customerName,
          parseInt(guests, 10),
          parseFloat(item.total),
          'confirmed',
          bookingReference,
          JSON.stringify({
            date,
            time,
            order_number: payload.number,
            payment_method: payload.payment_method_title,
          }),
        ]
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
