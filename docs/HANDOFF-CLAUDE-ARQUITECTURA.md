# Handoff para Claude — Continuar arquitectura del sitio Stanlake Park

**Objetivo:** Dar a un asistente de arquitectura (Claude) todo el contexto para seguir el desarrollo sin repetir decisiones descartadas y alineado al estado actual del repo.

**Rama de referencia:** `main` (estado “oficial” del proyecto).  
**Último commit en main:** `fix: correct layout issues and improve image loading performance`

---

## 1. ESTADO ACTUAL DEL PROYECTO

### 1.1 Stack técnico (inmutable)

| Capa | Elección | Notas |
|------|----------|--------|
| Framework | Next.js 16.1.6 (App Router) | Con Turbopack en dev |
| Estilos | Tailwind CSS 4 | Configuración vía `@theme` en `app/globals.css`, no depender de `tailwind.config.ts` para tema |
| Lenguaje | TypeScript | Estricto |
| Iconos | Lucide React | `lucide-react` |
| Animaciones | Framer Motion + componente `Reveal` | Reveal = Intersection Observer + transiciones CSS |
| Fuentes | Playfair Display (serif) + Inter (sans) | Cargadas en `app/layout.tsx` con `display: "swap"` |

### 1.2 Estructura real de carpetas (no hay `src/`)

```
/
├── app/                    # Rutas App Router
│   ├── globals.css         # @theme + cursor none + base
│   ├── layout.tsx
│   ├── page.tsx            # Home
│   ├── our-wines/page.tsx
│   ├── shop/page.tsx, shop/[slug]/page.tsx
│   ├── stay/page.tsx
│   ├── tours/page.tsx, tours/[slug]/page.tsx
│   ├── visit/page.tsx
│   ├── wine-bar/page.tsx
│   ├── weddings/page.tsx, weddings/catering, weddings/enquire, weddings/venues/[slug]
│   └── studio/[[...tool]]/  # Carpeta presente pero vacía (Sanity no integrado)
├── components/
│   ├── layout/             # Navbar, Footer, Hero, PageHero, ExperienceHub, TheCellar, etc.
│   └── ui/                 # Button, CustomCursor, Reveal, TransitionLink, TourCard, WineCard
├── context/
│   └── TransitionContext.tsx
├── docs/                   # Documentación (este archivo, WordPress, Ticket Tailor, ACF)
├── public/
├── sanity/schemas/        # Carpeta presente pero vacía
├── next.config.ts
├── package.json
├── tailwind.config.ts      # Contiene paths a ./src/ (obsoletos); el tema real está en globals.css
├── tsconfig.json
├── PROJECT_CONTEXT.md      # Reglas de diseño y stack (referencia src/ — obsoleto)
├── README.md
└── SNAPSHOT-2025-02-07.md  # Estado detallado en una fecha dada
```

- **No existe** `src/` ni `lib/` en main. Cualquier doc que diga `src/app` o `src/components` está desactualizado; usar `app/` y `components/`.
- **Tailwind:** La fuente de verdad del tema (colores, fuentes, keyframes) es `app/globals.css` (`@theme`). El archivo `tailwind.config.ts` tiene paths a `./src/` que no existen; si se usa, hay que actualizar content a `./app/**/*`, `./components/**/*` o deprecarlo según PROJECT_CONTEXT.

### 1.3 Rutas dinámicas (Next 16)

En todas las páginas con `[slug]` (o similar), `params` es una **Promise**; hay que hacer `await`:

```ts
export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  // ...
}
```

Rutas afectadas: `app/shop/[slug]/page.tsx`, `app/tours/[slug]/page.tsx`, `app/weddings/venues/[slug]/page.tsx`.

### 1.4 Datos hoy

- Contenido y productos son **mock** (arrays en el propio código o constantes).
- No hay CMS ni API de e‑commerce conectada en main.
- Carpetas `app/studio` y `sanity/schemas` existen pero están vacías; no hay dependencias de Sanity en `package.json` en main.

---

## 2. REGLAS DE DISEÑO Y CÓDIGO (“The Luxury Standard”)

Seguir **PROJECT_CONTEXT.md** como referencia; aquí va el resumen ejecutivo:

- **Tipografía:** Headings `font-serif` (Playfair), cuerpo `font-sans` (Inter). Labels en mayúsculas con `tracking-widest` (o `tracking-[0.3em]`).
- **Colores (variables Tailwind):** `brand` (#760235), `cream` (#F2F0E9), `dark` (#0a0a0a), `gold` (#C5A059). Uso: `text-brand`, `bg-cream`, etc.
- **Cursor:** Cursor del sistema oculto en viewport ≥768px (`cursor: none !important`). Cursor custom “Ring & Dot” en `components/ui/CustomCursor.tsx`. Solo elementos interactivos (enlaces, botones) deben cambiar estado hover del cursor.
- **Navegación interna:** Usar `TransitionLink` (`@/components/ui/TransitionLink`), no `next/link`, para disparar el overlay de transición.
- **Animaciones de entrada:** Envolver contenido que entra al hacer scroll en `<Reveal>` (`@/components/ui/Reveal`).
- **Botones:** Usar el componente compartido `<Button>` con variantes: `primary`, `outline`, `whiteOutline`, `wedding`.
- **Diseño:** Editorial, limpio, de lujo. Evitar layouts tipo Bootstrap genérico.

---

## 3. COSAS HECHAS QUE NO SE QUIEREN / NO REPETIR

Estas decisiones o implementaciones se probaron y **no** deben repetirse o deben hacerse de otra forma.

### 3.1 Estructura y rutas

- **No usar ni documentar `src/`.** El proyecto está en raíz: `app/`, `components/`, `context/`. Actualizar cualquier doc o comentario que mencione `src/app`, `src/components` o `src/context`.
- **No asumir que existe `lib/` en main.** Si se introduce una carpeta `lib/`, documentarla y usarla de forma coherente; hoy en main no está.

### 3.2 Tailwind

- **No depender del tema definido en `tailwind.config.ts`.** El tema (colores, fuentes, keyframes Ken Burns) debe vivir en `app/globals.css` dentro de `@theme`. Si se mantiene `tailwind.config.ts`, usarlo solo para `content` (paths correctos: `./app/**/*`, `./components/**/*`) y no duplicar tema ahí.
- **No mezclar configuración Tailwind 3 con Tailwind 4:** con T4, la vía preferente es CSS-first (`@theme`).

### 3.3 Integraciones y flujos probados

- **Ticket Tailor — no embeber widget/iframe como solución principal en el flujo actual.** En la rama de experimentos se probó integración por API + webhooks: el usuario ve datos del evento en la app y es redirigido a buytickets.at para completar la compra; los webhooks notifican al backend. Si se retoma Ticket Tailor, seguir el enfoque descrito en `docs/TICKET_TAILOR_API_WEBHOOKS.md` (API en servidor, redirección a Ticket Tailor, webhooks con verificación de firma).
- **WordPress + Ticket Tailor:** Hay documentación de arquitectura híbrida (WordPress solo contenido, Ticket Tailor para bookings) en `docs/STANLAKE-HYBRID-SETUP.md` y `docs/WORDPRESS-EXPERIENCIAS.md`. Esa es la dirección elegida a nivel de diseño; no reintroducir Event Tickets Plus ni calendario de eventos en WordPress como motor de reservas.
- **Sanity:** Se crearon carpetas `app/studio/[[...tool]]` y `sanity/schemas` pero no se completó la integración (sin paquetes Sanity en package.json, sin archivos en esas carpetas). Si se retoma Sanity, hacerlo como integración explícita y documentada, no reutilizando código abandonado sin revisar.

### 3.4 UX y componentes

- **Wine Bar — CTA “Book a Table”:** En `app/wine-bar/page.tsx` el botón no debe quedar sin `href` ni handler. Definir un flujo claro (página de contacto, formulario, o enlace externo) antes de implementar.
- **No colocar archivos de IDE/repo en la UI:** Evitar que archivos como `*.code-workspace` estén dentro de `components/` o rutas públicas; si se usan, dejarlos en raíz o en `.gitignore` si no deben versionarse.

### 3.5 Espacio para añadir más “no hacer”

- *[Añadir aquí cualquier otra decisión o implementación que se haya probado y descartado, con una línea sobre el motivo.]*

---

## 4. DOCUMENTACIÓN DE REFERENCIA EN EL REPO

| Archivo | Contenido |
|---------|-----------|
| `PROJECT_CONTEXT.md` | Stack estricto, diseño (tipografía, colores, cursor, componentes obligatorios), Next 16 (params async), estructura. Tiene referencias a `src/` — ignorar paths, respetar reglas. |
| `README.md` | Visión general del proyecto, stack, estructura (con `src/` obsoleta), instalación, deploy. |
| `SNAPSHOT-2025-02-07.md` | Estado del proyecto en una fecha: completitud, código completado, bloqueadores, próximos pasos. |
| `docs/STANLAKE-HYBRID-SETUP.md` | Arquitectura híbrida: WordPress (contenido) + Ticket Tailor (bookings) + Next.js. Setup LocalWP, CPTs, ACF, CORS, Ticket Tailor, flujo y ROI. |
| `docs/WORDPRESS-EXPERIENCIAS.md` | Uso de la REST API de WordPress para experiencias, CPTs, ACF, CORS, URLs de prueba. |
| `docs/TICKET_TAILOR_API_WEBHOOKS.md` | Integración por API y webhooks (sin widget/iframe): rutas, env vars, verificación de firma, debug. |
| `docs/` (ACF, JSON) | Definiciones ACF y ejemplos para `experience_info`, `ticket_tailor_event_id`, etc. |

---

## 5. BLOQUEADORES Y DECISIONES PENDIENTES

- **Fuente de datos:** Aún no está decidida/conectada la fuente definitiva para contenido y shop (WordPress headless, Sanity, otro). Todo el contenido actual es mock.
- **Book a Table (Wine Bar):** Flujo no definido (formulario propio, enlace externo, integración con sistema de reservas).
- **Coherencia docs vs código:** Actualizar PROJECT_CONTEXT y README para que la estructura descrita sea `app/`, `components/`, `context/` (sin `src/` ni `lib/` salvo que se añadan).
- **tailwind.config.ts:** Decidir si se actualiza solo `content` o se elimina y se usa solo `@theme` en `globals.css`.

---

## 6. PRÓXIMOS PASOS TÉCNICOS SUGERIDOS

1. **Definir y conectar fuente de datos** para contenido y, si aplica, tienda (WordPress REST, Sanity, etc.) y sustituir mocks de forma incremental.
2. **Implementar el CTA “Book a Table”** en Wine Bar con un flujo definido (enlace o formulario).
3. **Alinear documentación con la estructura real:** quitar referencias a `src/` y a `lib/` en PROJECT_CONTEXT y README; opcionalmente documentar `lib/` si se crea.
4. **Metadata por ruta:** Añadir `metadata` o `generateMetadata` donde falte para SEO.
5. **Si se retoma Sanity:** Integrar desde cero en `app/studio` y `sanity/schemas` con dependencias y schemas documentados, o eliminar las carpetas vacías si no se usará.

---

## 7. CÓMO USAR ESTE DOCUMENTO CON CLAUDE

- Compartir este archivo (o su ruta) al iniciar una sesión de arquitectura o desarrollo.
- Indicar: “Sigue las reglas y el estado en `docs/HANDOFF-CLAUDE-ARQUITECTURA.md`; no uses `src/`, no embeber Ticket Tailor por iframe/widget, tema Tailwind en `globals.css`.”
- Para estado detallado en el tiempo (qué está completado, bloqueadores, próximos pasos), referir además a `SNAPSHOT-2025-02-07.md` y actualizarlo cuando cambie el estado del proyecto.

---

*Última actualización del handoff: febrero 2025. Rama: main.*
