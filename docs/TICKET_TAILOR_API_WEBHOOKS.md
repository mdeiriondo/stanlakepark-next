# Ticket Tailor – API y Webhooks

Integración por API y webhooks (sin widgets/iframe). La API key **nunca** se expone al cliente.

## Flujo de integración

1. **Usuario en el tour** (`/tours/[slug]`): elige fecha e invitados y pulsa «Check Availability».
2. **Modal**: la app llama a `GET /api/ticket-tailor/events/[eventId]` (servidor usa la API de Ticket Tailor). Si hay datos, se muestran nombre del evento, fecha y precio; si no (p. ej. ID solo válido en buytickets.at), se muestra el CTA igual.
3. **Usuario** pulsa «Complete booking on Ticket Tailor» → se abre **buytickets.at/stanlakepark/[eventId]** en una pestaña nueva para pagar.
4. **Ticket Tailor** envía un webhook `ORDER.CREATED` (o `ORDER.UPDATED`) a `POST /api/webhooks/ticket-tailor`. La app verifica la firma, responde 200 y puede procesar la orden (email, DB, etc.).

Rutas implicadas:
- `GET /api/ticket-tailor/events/[eventId]` – devuelve datos del evento (desde la API de TT).
- `POST /api/webhooks/ticket-tailor` – recibe webhooks de Ticket Tailor (orden creada/actualizada, etc.).

## Variables de entorno

| Variable | Dónde se usa | Dónde obtenerla |
|----------|--------------|------------------|
| `TICKET_TAILOR_API_KEY` | Servidor: `lib/ticket-tailor.ts` (listar eventos, obtener evento, órdenes) | Ticket Tailor → Settings → API → crear API key |
| `TICKET_TAILOR_WEBHOOK_SECRET` | Servidor: `app/api/webhooks/ticket-tailor/route.ts` (verificar firma) | Ticket Tailor → Settings → API → Webhooks → al agregar la URL te muestran el **shared secret** |

- **No** uses `NEXT_PUBLIC_` para la API key ni para el webhook secret.

## API (servidor)

- **`lib/ticket-tailor.ts`**
  - `getEvent(eventId)` – obtener un evento por ID
  - `getEvents(params?)` – listar eventos (paginación)
  - `getOrder(orderId)` – obtener una orden por ID

Uso solo en Server Components, Route Handlers o API routes (nunca en cliente).

## Webhooks

1. **URL a configurar en Ticket Tailor**  
   `https://tu-dominio.com/api/webhooks/ticket-tailor`  
   En local: exponer con [ngrok](https://ngrok.com/) y poner esa URL.

2. **En Ticket Tailor**  
   Settings → API → Webhooks → Add webhook:
   - Tipo de evento: Order → Created / Updated, etc.
   - URL: la de arriba.
   - Copiar el **webhook secret** y ponerlo en `.env.local` como `TICKET_TAILOR_WEBHOOK_SECRET`.

3. **En esta app**  
   - `POST /api/webhooks/ticket-tailor` recibe el webhook.
   - Verifica la firma HMAC-SHA256 y rechaza si el timestamp tiene más de 5 minutos.
   - Responde 200 para que Ticket Tailor no reintente.
   - La lógica de negocio (enviar email, actualizar DB, etc.) se puede añadir en el `switch (event)` del route.

## Eventos de webhook soportados

- `ORDER.CREATED` / `ORDER.UPDATED`
- `ISSUED_TICKET.CREATED` / `ISSUED_TICKET.UPDATED`
- `EVENT.CREATED` / `EVENT.UPDATED` / `EVENT.DELETED`
- `WAITLIST_SIGNUP.CREATED`

Docs: https://developers.tickettailor.com/docs/webhook/configuration

## Qué ID usar en WordPress (ACF `ticket_tailor_event_id`)

Ticket Tailor usa **dos IDs** distintos:

| Origen | Ejemplo | ¿Funciona en la URL de checkout? |
|--------|---------|----------------------------------|
| **ID público (numérico)** | `2061731` | ✅ Sí. URL: `https://buytickets.at/stanlakepark/2061731` |
| **ID de la API** | `ev_7632424` | ❌ No. Esa URL da 404 en el navegador. |

**Recomendación:** En WordPress guardá siempre el **ID numérico** que aparece en la URL del evento en Ticket Tailor / buytickets.at. Por ejemplo, si el enlace del evento es `https://buytickets.at/stanlakepark/2061731`, usá **`2061731`** en el campo ACF `ticket_tailor_event_id`. La app acepta ambos (si pasás `ev_xxx`, la API puede devolver la URL pública; si pasás el numérico, construimos la URL de checkout con ese número).

## Depurar: ver los IDs que devuelve la API

Abrí en el navegador:

**`GET /api/ticket-tailor/debug`**  
(ej. `http://localhost:3000/api/ticket-tailor/debug`)

Ahí vas a ver:

- **overview**: si la API key es válida.
- **events_endpoint**: si `GET /v1/events` responde bien o error (ej. 404).
- **event_ids_for_wordpress**: lista de `{ id, name }` de eventos. Si la API devuelve `ev_xxx`, en la app usamos `event.url` de la respuesta para el checkout; si no hay datos, **usá el ID numérico de la URL** (ej. 2061731) en `ticket_tailor_event_id`.

## Si GET /api/ticket-tailor/events/ID devuelve 404

1. **Comprobar que la API key es válida:** abrí `GET /api/ticket-tailor/health`. Si devuelve `{ "ok": false }` o error, revisá `TICKET_TAILOR_API_KEY` en Ticket Tailor (Settings → API) y que no tenga espacios ni esté cortada.
2. **Ver IDs disponibles:** abrí `GET /api/ticket-tailor/debug` y mirá `event_ids_for_wordpress`. Si hay datos, usá uno de esos `id` en WordPress. Si no hay datos o `events_endpoint` es 404, usá el ID de la URL de buytickets.at (ej. 2061731).
