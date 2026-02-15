# Estado de situación: booking de experiencias y abandono de Ticket Tailor

**Fecha:** Febrero 2025  
**Objetivo:** Documentar el estado actual, los problemas con Ticket Tailor (TT) y las opciones para diseñar una alternativa (lógica y arquitectura de información) desde Claude u otro asistente.

---

## 1. Requisitos del negocio (lo que se quiere)

- **Todo en Stanlake Park (stanlakepark.com):**
  - Elegir **experiencia** (ej. Wine Tour & Tasting).
  - Elegir **fecha** (de un calendario o lista de fechas disponibles).
  - Elegir **hora** (o franja horaria).
  - Elegir **número de personas** (invitados).
  - Ver **precio total** (ej. £25 × 2 = £50).
- **Solo salir del sitio para pagar:** redirección a una pasarela de pago (Stripe u otra); tras el pago, vuelta a Stanlake Park (thank-you, confirmación, email).
- **No** es aceptable que el usuario tenga que re-elegir fecha, hora o cantidad en una web externa (redundante y mala UX).

---

## 2. Qué se intentó con Ticket Tailor (TT)

- Integración con la **API de Ticket Tailor** (GET eventos, evento por ID, ocurrencias).
- **URL de checkout** a `buytickets.at/stanlakepark/{eventId}` (y variantes con `tickettailor.com/events/stanlakepark/...`).
- Pasar parámetros por query: `ticket_type_id`, `quantity`, etc.
- En nuestra web: selector de **fecha** (lista de ocurrencias desde la API), selector de **cantidad de invitados**, botón “Continue to payment” que abría TT en nueva pestaña.

### Problemas concretos que nos encontramos

| Problema | Descripción |
|----------|-------------|
| **Dos IDs distintos** | La API devuelve IDs tipo `ev_7632424`; las URLs públicas de checkout usan un ID **numérico** (ej. `2061731`). Usar `ev_xxx` en la URL da **HTTP 404**. Tuvimos que normalizar y documentar: usar siempre el ID numérico o `event.url` de la API para construir el enlace. |
| **Parámetros no respetados** | Aunque se construye una URL con `?ticket_type_id=...&quantity=...`, en la práctica el checkout de TT **no** pre-rellena de forma fiable. El usuario termina eligiendo otra vez fecha, hora y cantidad en TT. |
| **Checkout no embeber** | TT no permite cargar su checkout en iframe (seguridad/pagos). Solo se puede redirigir a su dominio. Mostrar “Complete your booking” en modal y abrir TT en nueva pestaña. |
| **Página no disponible (404 / “not available”)** | Varias URLs de TT devolvían “This page is not available” o HTTP 404 según el ID usado (API vs público) y el estado del evento (publicado, fechas, etc.). |
| **Flujo redundante** | En resumen: el flujo “real” es el de TT. Nuestra web solo puede enviar al usuario a TT; no hay forma fiable de “solo pagar” sin re-elegir todo en su sitio. |

**Conclusión:** TT **no sirve** para el requisito “fecha, hora y personas en Stanlake Park; solo salir para pagar”. Se decidió dejar de usarlo como motor de reservas y valorar una alternativa.

---

## 3. Código y activos actuales relacionados con TT

- **Rutas API (Next.js):**
  - `app/api/tt/event/[id]/route.ts` — detalle de evento, disponibilidad, ticket types.
  - `app/api/tt/event/[id]/occurrences/route.ts` — lista de fechas/ocurrencias para un evento.
  - (Si existen) `app/api/tt/events/route.ts`, `app/api/webhooks/ticket-tailor/route.ts`, `app/api/ticket-tailor/...` — listado eventos, webhooks.
- **Cliente:**
  - `components/booking/BookingFlow.tsx` — selector de fecha (occurrences), invitados, botón “Continue to payment”, construcción de URL de TT.
  - `components/booking/CheckoutModal.tsx` — modal que explica “solo salir para pagar” y abre TT en nueva pestaña.
  - `hooks/useTicketTailor.ts` — `useEventDetails`, `useEvents`.
  - `lib/ticket-tailor.ts` — `generateCheckoutUrl`, `getCheckoutBaseUrl`, tipos.
- **Datos en WordPress (GraphQL):**  
  En el CPT `experience` (WPGraphQL) hay un campo ACF tipo texto para **Ticket Tailor Event ID** (`ticket_tailor_event_id`). Las páginas de experiencia (`app/experiences/[slug]/page.tsx`) leen ese ID y renderizan `<BookingFlow ticketTailorEventId={...} />`.
- **Documentación:**  
  `docs/TICKET_TAILOR_API_WEBHOOKS.md` — integración TT, IDs, webhooks, debug.
- **Variables de entorno (ej. `.env.local`):**  
  `TICKET_TAILOR_API_KEY`, `TICKET_TAILOR_WEBHOOK_SECRET`, `NEXT_PUBLIC_TT_ACCOUNT_NAME`.

**Decisión de arquitectura:** Este código se puede **dejar inactivo** (no llamar a `BookingFlow` con ID de TT, o mostrar un CTA genérico “Reservas próximamente”) o **eliminar/refactorizar** cuando la alternativa esté definida. No conviene seguir desarrollando flujos que dependan de TT para fecha/hora/personas.

---

## 4. Opciones para la alternativa (resumen)

| Opción | Idea | Pros | Contras |
|--------|------|------|---------|
| **A. Otro SaaS de ticketing** | Tito, Pretix, Eventbrite, etc. | Menos desarrollo propio. | Habría que validar si permiten “todo en tu sitio, solo pagar fuera”; muchos tienen el mismo patrón que TT (checkout propio). |
| **B. Booking propio + Stripe** | Nosotros: experiencias, slots (fecha/hora), capacidad; UI en Next.js; Stripe solo para pago. | Fecha, hora y personas 100% en Stanlake Park; solo redirección a Stripe para pagar; control total de UX y datos. | Requiere definir modelo de datos (slots, reservas), lógica de disponibilidad y posiblemente emails/webhooks. |
| **C. Mantener TT solo como “enlace externo”** | Quitar la ilusión de “elegir aquí”: un botón “Reservar en Ticket Tailor” que abre TT. Usuario hace todo allí. | Cambio mínimo. | No cumple el requisito; misma redundancia que hoy. |

**Recomendación para trabajar en Claude:** Diseñar la **opción B (booking propio + Stripe)** como alternativa: arquitectura de información, modelo de datos, flujo de usuario y puntos de integración (WordPress/GraphQL, Stripe, emails).

---

## 5. Arquitectura de información sugerida (opción B)

Para que otro asistente (Claude) pueda bajar a lógica y datos:

### 5.1 Entidades

- **Experiencia**  
  Ya existe en WordPress (CPT `experience` vía GraphQL): nombre, descripción, precio base por persona, duración, etc. **Dejar de usar** `ticket_tailor_event_id` para el flujo de reserva; opcionalmente conservar el campo por si se quiere mostrar un enlace “Reservar en TT” como respaldo.

- **Slot (franja reservable)**  
  Una combinación **experiencia + fecha + hora** (o hora de inicio) con **capacidad máxima** y **capacidad vendida** (o “plazas libres”). Ej.: “Wine Tour & Tasting, 20 Feb 2026, 14:00, capacidad 20, vendidas 12”.

- **Reserva (booking)**  
  Una reserva confirmada: experiencia, slot (fecha + hora), cantidad de personas, precio total, estado (pendiente_pago, pagada, cancelada), identificador de pago (Stripe), email del cliente, nombre, etc.

### 5.2 Fuente de verdad de slots

- **Opción 1:** WordPress: custom post type o tabla (plugin) para “slots”; cada slot tiene experiencia, fecha, hora, capacidad.  
- **Opción 2:** Base de datos en Next.js (ej. Vercel Postgres, SQLite, etc.): tabla `slots`, tabla `bookings`.  
- **Opción 3:** Reglas + generación: por cada “experiencia” se definen reglas (ej. “Viernes a domingo, 14:00 y 16:00, capacidad 20”); los slots se generan a futuro (ej. próximos 90 días) y se almacenan o se calculan on the fly.  

Hay que decidir: ¿slots fijos en BD/WordPress o generados por reglas?

### 5.3 Flujo de usuario (objetivo)

1. Usuario en Stanlake Park: elige **experiencia** (ya existe la página `/experiences/[slug]`).
2. En la misma web: elige **fecha** (solo fechas con al menos un slot disponible).
3. Elige **hora** (solo horarios disponibles para esa fecha y experiencia).
4. Elige **número de personas**; se valida vs plazas libres del slot; se muestra el total (precio × personas).
5. Clic en “Reservar y pagar” → se crea una **reserva** en estado “pendiente_pago” (y se restan temporalmente las plazas o se hace “hold” si se quiere).
6. Redirección a **Stripe Checkout** (o Payment Link) con el importe correcto; metadata (reserva_id, experiencia, slot, cantidad).
7. Tras el pago: **webhook de Stripe** → actualizar reserva a “pagada”, confirmar disminución de capacidad del slot, enviar email de confirmación (y opcional: “ticket” o código de reserva).
8. Usuario redirigido a `/thank-you` (o similar) en Stanlake Park.

### 5.4 Integraciones técnicas

- **Stripe:** Checkout Session o Payment Link; webhook para `checkout.session.completed` (o equivalente) para marcar reserva como pagada y enviar email.
- **Email:** Servicio (Resend, SendGrid, o SMTP vía WordPress) para “Reserva confirmada” con detalle (experiencia, fecha, hora, personas, referencia).
- **Disponibilidad:** Al elegir fecha/hora en la UI, la app debe consultar slots y plazas libres (API propia o GraphQL que consulte WordPress/DB según donde vivan los slots).

---

## 6. Qué hacer con el código TT (sugerencia)

- **No borrar aún** la documentación ni las rutas TT si pueden servir de referencia (IDs, problemas, límites).
- En la **página de experiencia** (`app/experiences/[slug]/page.tsx`): dejar de usar `<BookingFlow ticketTailorEventId={...} />` como flujo principal; reemplazar por:
  - un nuevo componente de reserva (fecha, hora, personas, “Reservar y pagar” → Stripe), o
  - un CTA temporal tipo “Reservas próximamente” o “Contactar para reservar” hasta que la opción B esté lista.
- **BookingFlow, CheckoutModal, useTicketTailor, lib/ticket-tailor:** dejarlos en el repo como referencia o mover a una carpeta `_deprecated/` o `docs/stanlake-tt-components/` hasta que la alternativa esté estable.
- **WordPress:** el campo `ticket_tailor_event_id` puede mantenerse por si se quiere un enlace secundario “También puedes reservar en Ticket Tailor”; si no, se puede ocultar o eliminar más adelante.

---

## 7. Resumen para Claude (o quien implemente la alternativa)

- **TT no sirve** para: fecha, hora y personas en nuestra web y solo salir para pagar; los parámetros en la URL no se respetan y el flujo es redundante en TT.
- **Objetivo:** Booking propio en Stanlake Park (elegir experiencia, fecha, hora, personas, ver total) + solo Stripe para pago; vuelta a nuestra web y email de confirmación.
- **Entidades a definir bien:** Experiencia (ya en WP), Slot (experiencia + fecha + hora + capacidad), Reserva (slot + personas + precio + estado + pago).
- **Decisiones pendientes:** Dónde viven los slots (WordPress vs DB en Next), si slots son “fijos” o “generados por reglas”, y qué producto de Stripe usar (Checkout Session vs Payment Link).
- **Código TT:** No seguir desarrollando; dejar inactivo o deprecado; usar este doc para diseñar e implementar la opción B (booking propio + Stripe) sin depender de TT.

Con este estado de situación se puede trabajar en Claude (o en otro contexto) la lógica y la arquitectura de información de la alternativa sin asumir que TT forme parte del flujo principal de reserva.
