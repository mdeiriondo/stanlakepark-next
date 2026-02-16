import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import crypto from 'crypto';

/** WooCommerce envía la firma en X-WC-Webhook-Signature (HMAC-SHA256 del body en base64). */
function getSignatureHeader(request: Request): string | null {
  const v =
    request.headers.get('x-wc-webhook-signature') ??
    request.headers.get('X-WC-Webhook-Signature');
  return v ? v.trim() : null;
}

function verifyWebhookSignature(body: string, signature: string): boolean {
  const secret = process.env.WC_WEBHOOK_SECRET;
  if (!secret) return false;
  const sigTrim = signature.trim();

  const tryVerify = (payload: string) => {
    const hashBase64 = crypto
      .createHmac('sha256', secret)
      .update(payload, 'utf8')
      .digest('base64');
    const hashHex = crypto
      .createHmac('sha256', secret)
      .update(payload, 'utf8')
      .digest('hex');

    if (sigTrim.length === hashBase64.length && /^[A-Za-z0-9+/=]+$/.test(sigTrim)) {
      const sigBuf = Buffer.from(sigTrim, 'utf8');
      const hashBuf = Buffer.from(hashBase64, 'utf8');
      if (sigBuf.length === hashBuf.length && crypto.timingSafeEqual(sigBuf, hashBuf)) return true;
    }
    if (sigTrim.length === hashHex.length && /^[a-f0-9]+$/i.test(sigTrim)) {
      const sigBuf = Buffer.from(sigTrim.toLowerCase(), 'utf8');
      const hashBuf = Buffer.from(hashHex, 'utf8');
      if (sigBuf.length === hashBuf.length && crypto.timingSafeEqual(sigBuf, hashBuf)) return true;
    }
    return false;
  };

  if (tryVerify(body)) return true;
  // Por si algo en el camino normaliza \r\n → \n
  const bodyNormalized = body.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  return bodyNormalized !== body && tryVerify(bodyNormalized);
}

function generateBookingReference(): string {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, '0');
  return `SP-${year}-${random}`;
}

/** GET: para comprobar que la URL existe (evita 405 al abrir en el navegador). */
export async function GET() {
  return NextResponse.json({
    ok: true,
    message: 'WooCommerce webhook endpoint. Use POST with X-WC-Webhook-Signature.',
    url: 'https://stanlakepark.vercel.app/api/webhooks/woocommerce',
  });
}

export async function POST(request: Request) {
  try {
    const signature = getSignatureHeader(request);
    const body = await request.text();

    // Opción solo para desarrollo: saltar verificación (NUNCA en producción)
    const skipVerify = process.env.SKIP_WEBHOOK_VERIFICATION === 'true';
    if (skipVerify) {
      if (!body || !body.trim()) {
        return NextResponse.json({ success: true, message: 'Webhook OK (test ping)' });
      }
    } else {
      if (!signature) {
        return NextResponse.json(
          {
            error: 'Missing X-WC-Webhook-Signature header',
            hint: 'WooCommerce → Ajustes → Avanzado → Webhooks → editar webhook → campo "Secret" debe tener un valor. El mismo valor en .env como WC_WEBHOOK_SECRET. En Vercel: Project → Settings → Environment Variables.',
          },
          { status: 401 }
        );
      }
      if (!process.env.WC_WEBHOOK_SECRET) {
        return NextResponse.json(
          {
            error: 'WC_WEBHOOK_SECRET not configured',
            hint: 'En Vercel: Project → Settings → Environment Variables → añadir WC_WEBHOOK_SECRET con el mismo valor que el "Secret" del webhook en WooCommerce.',
          },
          { status: 501 }
        );
      }
      if (!verifyWebhookSignature(body, signature)) {
        console.warn(
          `Webhook 401: signature length=${signature?.length ?? 0}, body length=${body?.length ?? 0}, secret set=${!!process.env.WC_WEBHOOK_SECRET}`
        );
        // Incluir debug en la respuesta para verla en WooCommerce → Entregas recientes → Respuesta
        return NextResponse.json(
          {
            error: 'Invalid webhook signature',
            hint: 'Revisa: (1) URL exacta: .../woocommerce con "e" final. (2) Secret en WooCommerce = WC_WEBHOOK_SECRET en Vercel. (3) Para probar sin firma: en Vercel pon SKIP_WEBHOOK_VERIFICATION=true, redeploy, guarda el webhook; luego quita esa variable.',
            debug: {
              signatureLength: signature?.length ?? 0,
              bodyLength: body?.length ?? 0,
              bodyPreview: body?.length ? `${body.slice(0, 80)}...` : '(empty)',
            },
          },
          { status: 401 }
        );
      }
    }

    let payload: {
      id?: number;
      number?: string;
      status?: string;
      billing?: { email?: string; first_name?: string; last_name?: string };
      payment_method_title?: string;
      line_items?: Array<{
        product_id?: number;
        total?: string;
        meta_data?: Array<{ key: string; value: string }>;
      }>;
    };

    try {
      payload = JSON.parse(body) as typeof payload;
    } catch {
      return NextResponse.json({ success: true, message: 'Webhook OK (invalid JSON ignored)' });
    }

    if (!payload || typeof payload !== 'object') {
      return NextResponse.json({ success: true, message: 'Webhook OK (no payload to process)' });
    }

    if (!['completed', 'processing'].includes(payload.status ?? '')) {
      return NextResponse.json({ message: 'Order status not actionable' });
    }

    const lineItems = payload.line_items ?? [];
    const billing = payload.billing ?? {};
    const orderId = payload.id;

    for (const item of lineItems) {
      try {
        const meta = item.meta_data ?? [];
        const getMeta = (key: string) =>
          meta.find((m: { key: string; value: string }) => m.key === key)?.value;
        const slotId = getMeta('_booking_slot_id');
        const guests = getMeta('_booking_guests');
        const date = getMeta('_booking_date');
        const time = getMeta('_booking_time');

        if (!slotId || !guests || orderId == null) continue;

        const { rows: existingBookings } = await sql.query(
          `SELECT id FROM bookings WHERE wc_order_id = $1 AND slot_id = $2`,
          [orderId, parseInt(slotId, 10)]
        );

        if (existingBookings.length > 0) continue;

        const bookingReference = generateBookingReference();
        const customerName = [
          billing.first_name,
          billing.last_name,
        ]
          .filter(Boolean)
          .join(' ')
          .trim() || 'Guest';

        const wcProductId = item.product_id ?? null;

        // Crear el booking (wc_product_id se usa para no reutilizar productos ya vendidos)
        try {
          await sql.query(
            `INSERT INTO bookings (
            slot_id,
            wc_order_id,
            wc_product_id,
            customer_email,
            customer_name,
            guests,
            total_price,
            status,
            booking_reference,
            metadata
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
            [
              parseInt(slotId, 10),
              orderId,
              wcProductId,
              billing.email ?? '',
              customerName,
              parseInt(guests, 10),
              parseFloat(String(item.total ?? 0)) || 0,
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
        } catch (insertError: any) {
          const msg = String(insertError?.message ?? '');
          if (msg.includes('wc_product_id') && (msg.includes('does not exist') || msg.includes('column'))) {
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
                orderId,
                billing.email ?? '',
                customerName,
                parseInt(guests, 10),
                parseFloat(String(item.total ?? 0)) || 0,
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
          } else {
            throw insertError;
          }
        }

        // Incrementar booked SOLO cuando el pago se confirma
        await sql.query(
          `UPDATE slots SET booked = booked + $1 WHERE id = $2`,
          [parseInt(guests, 10), parseInt(slotId, 10)]
        );
      } catch (itemError) {
        console.error('Webhook: error processing line item', itemError);
        // No relanzar: aceptamos el webhook y seguimos (evita 500)
      }
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
