import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

const WEBHOOK_SECRET = process.env.TICKET_TAILOR_WEBHOOK_SECRET;
const MAX_AGE_SECONDS = 60 * 5; // 5 minutos

/** Verifica la firma del webhook (HMAC-SHA256). */
function verifySignature(rawBody: string, signatureHeader: string | null): boolean {
  if (!WEBHOOK_SECRET || !signatureHeader) return false;
  const parts = signatureHeader.split(',');
  let t = '';
  let v = '';
  for (const p of parts) {
    const [key, val] = p.trim().split('=');
    if (key === 't') t = val ?? '';
    if (key === 'v') v = val ?? '';
  }
  if (!t || !v) return false;
  const timestamp = parseInt(t, 10);
  if (Number.isNaN(timestamp)) return false;
  if (Math.abs(Date.now() / 1000 - timestamp) > MAX_AGE_SECONDS) return false;
  const payload = t + rawBody;
  const expected = crypto.createHmac('sha256', WEBHOOK_SECRET).update(payload).digest('hex');
  if (expected.length !== v.length) return false;
  return crypto.timingSafeEqual(Buffer.from(expected, 'hex'), Buffer.from(v, 'hex'));
}

/** Payload típico de webhook Ticket Tailor */
export type TicketTailorWebhookPayload = {
  id: string;
  created_at: string;
  event: string;
  resource_url?: string;
  payload?: unknown;
};

/** GET: para que la URL no devuelva 405 al abrirla en el navegador o al hacer health check (ngrok, etc.) */
export async function GET() {
  return NextResponse.json({
    ok: true,
    message: 'Ticket Tailor webhook endpoint. Use POST to send webhooks.',
  });
}

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const signature = request.headers.get('tickettailor-webhook-signature');

  if (!verifySignature(rawBody, signature)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  let body: TicketTailorWebhookPayload;
  try {
    body = JSON.parse(rawBody) as TicketTailorWebhookPayload;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { id, event, payload: resourcePayload } = body;

  // Idempotencia: aquí podrías guardar `id` en DB y no procesar dos veces el mismo webhook.
  // switch (event) {
  //   case 'ORDER.CREATED': ...
  //   case 'ORDER.UPDATED': ...
  //   case 'ISSUED_TICKET.CREATED': ...
  // }

  switch (event) {
    case 'ORDER.CREATED':
      // Ejemplo: enviar confirmación, actualizar stock, etc.
      console.log('[Ticket Tailor] ORDER.CREATED', id, resourcePayload);
      break;
    case 'ORDER.UPDATED':
      console.log('[Ticket Tailor] ORDER.UPDATED', id, resourcePayload);
      break;
    case 'ISSUED_TICKET.CREATED':
    case 'ISSUED_TICKET.UPDATED':
    case 'EVENT.CREATED':
    case 'EVENT.UPDATED':
    case 'EVENT.DELETED':
    case 'WAITLIST_SIGNUP.CREATED':
      console.log('[Ticket Tailor]', event, id, resourcePayload);
      break;
    default:
      console.log('[Ticket Tailor] Unknown event', event, id);
  }

  return NextResponse.json({ received: true });
}
