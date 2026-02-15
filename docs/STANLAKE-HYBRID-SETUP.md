# STANLAKE PARK - ARQUITECTURA HÍBRIDA
## WordPress Headless + Ticket Tailor + Next.js

**Versión:** 2.0 (Actualizado 8 Feb 2026)  
**Stack:** WordPress (contenido) + Ticket Tailor (bookings) + Next.js 16 (frontend)  
**Budget:** £180/año Ticket Tailor + hosting

---

## 📋 ÍNDICE

1. [Decisión Arquitectónica](#1-decisión-arquitectónica)
2. [Setup LocalWP](#2-setup-localwp)
3. [WordPress: Solo Contenido](#3-wordpress-solo-contenido)
4. [Ticket Tailor Setup](#4-ticket-tailor-setup)
5. [Next.js Frontend](#5-nextjs-frontend)
6. [Integración Completa](#6-integración-completa)
7. [Migration Plan](#7-migration-plan)
8. [ROI Analysis](#8-roi-analysis)

---

## 1. DECISIÓN ARQUITECTÓNICA

### 🎯 Por qué Híbrido en lugar de Full WordPress

**Análisis del sitio actual:**
- ✅ WooCommerce funciona bien (shop de vinos)
- ✅ Event Tickets Plus funciona pero es limitado
- ❌ Sin waitlist nativa
- ❌ Sin add-ons fáciles
- ❌ Dynamic pricing complejo
- ❌ Vouchers terceros son manual

### 💡 Solución: Divide & Conquer

```
┌─────────────────────────────────────────────────┐
│           Next.js 16 Frontend                    │
│   (Single Source of Truth para el usuario)      │
└─────────────────────────────────────────────────┘
              ↓                    ↓
    ┌──────────────────┐   ┌──────────────────┐
    │   WordPress      │   │  Ticket Tailor   │
    │   Headless       │   │   (Embedded)     │
    └──────────────────┘   └──────────────────┘
    
    Sirve:                  Sirve:
    - Wines catalog         - All experiences
    - Weddings info         - Booking engine
    - Venues details        - Waitlist
    - Stay content          - Add-ons
    - Blog/News             - Payments
    - General pages         - Vouchers
                            - Capacity mgmt
```

### 📊 ROI Justificación

**Inversión Ticket Tailor:**
- £15/mes flat = £180/año
- O £0.65/ticket (~£650 con 1000 tickets)
- Recomendado: Flat £15/mes

**Revenue Adicional Estimado:**
```
Add-ons (30% take rate × 1100 bookings × £12 avg):  £3,960
Waitlist conversions (5% más bookings × £25):        £1,375
Mejor UX = más conversión (10% mejora):              £2,500
                                          TOTAL:      £7,835/año
```

**ROI:** £7,835 / £180 = **4,353% anual** 🚀

**Payback period:** ~8 días

### ✅ Decisión Final: HÍBRIDO

---

## 2. SETUP LOCALWP

### 2.1 Crear Sitio

```bash
Nombre: stanlake-park-headless
PHP: 8.2
Web Server: nginx
Database: MySQL 8.0.16
```

**URL Local:** `http://stanlake-park-headless.local`

### 2.2 WordPress Settings Básicos

**General:**
- Site Title: Stanlake Park Wine Estate
- Tagline: English Wine & Vineyard Experiences
- Timezone: Europe/London
- Language: English (UK)

**Permalinks:**
- ✅ Post name (CRÍTICO para REST API)

**Reading:**
- Posts per page: 12
- ❌ Discourage search engines

---

## 3. WORDPRESS: SOLO CONTENIDO

### 3.1 Plugins a Instalar

**CRÍTICOS:**
1. **Advanced Custom Fields PRO**
   - Upload license key
   - Activate

2. **ACF to REST API**
   - Free plugin
   - Auto-expone ACF fields en REST API

3. **WooCommerce**
   - Ya existe, mantener para shop de vinos
   - Currency: GBP
   - Location: UK

**OPCIONALES (Recomendados):**
4. **WPGraphQL** + **WPGraphQL for ACF**
   - Si prefieres GraphQL sobre REST
   - Más performante para queries complejas

5. **WP REST Cache**
   - Cachea responses del REST API
   - Mejora performance

### 3.2 Plugins a DEPRECAR/ELIMINAR

```
❌ Event Tickets Plus → Migrar a Ticket Tailor
❌ The Events Calendar → No más calendario WP
❌ (cualquier plugin de booking viejo)
```

**Migración:**
- Exportar eventos existentes como CSV
- Importar a Ticket Tailor manualmente
- Mantener plugins activos hasta migración completa
- Luego desactivar y eliminar

### 3.3 Custom Post Types

Solo para **contenido editorial**, NO para bookings.

**Archivo:** `wp-content/themes/YOUR-THEME/functions.php`

```php
<?php
/**
 * Stanlake Park - Custom Post Types
 * Solo contenido, NO bookings
 */

// 1. WINES
function stanlake_register_wine_cpt() {
    register_post_type('wine', array(
        'label' => 'Wines',
        'labels' => array(
            'singular_name' => 'Wine',
            'add_new' => 'Add New Wine',
        ),
        'public' => true,
        'has_archive' => true,
        'rewrite' => array('slug' => 'wines'),
        'supports' => array('title', 'editor', 'thumbnail', 'excerpt'),
        'menu_icon' => 'dashicons-products',
        'show_in_rest' => true,
        'rest_base' => 'wines',
        'taxonomies' => array('wine_type', 'wine_category'),
    ));
    
    // Taxonomies
    register_taxonomy('wine_type', 'wine', array(
        'label' => 'Wine Type',
        'hierarchical' => true,
        'show_in_rest' => true,
    ));
    
    register_taxonomy('wine_category', 'wine', array(
        'label' => 'Category',
        'hierarchical' => false,
        'show_in_rest' => true,
    ));
}
add_action('init', 'stanlake_register_wine_cpt');

// 2. WEDDING VENUES
function stanlake_register_venue_cpt() {
    register_post_type('venue', array(
        'label' => 'Venues',
        'labels' => array(
            'singular_name' => 'Venue',
        ),
        'public' => true,
        'has_archive' => false,
        'rewrite' => array('slug' => 'weddings/venues'),
        'supports' => array('title', 'editor', 'thumbnail'),
        'menu_icon' => 'dashicons-admin-home',
        'show_in_rest' => true,
        'rest_base' => 'venues',
    ));
}
add_action('init', 'stanlake_register_venue_cpt');

// 3. ACCOMMODATION
function stanlake_register_accommodation_cpt() {
    register_post_type('accommodation', array(
        'label' => 'Accommodation',
        'labels' => array(
            'singular_name' => 'Accommodation',
        ),
        'public' => true,
        'has_archive' => true,
        'rewrite' => array('slug' => 'stay'),
        'supports' => array('title', 'editor', 'thumbnail', 'excerpt'),
        'menu_icon' => 'dashicons-admin-multisite',
        'show_in_rest' => true,
        'rest_base' => 'accommodation',
    ));
}
add_action('init', 'stanlake_register_accommodation_cpt');

// 4. EXPERIENCE INFO (Editorial only, NO booking data)
function stanlake_register_experience_info_cpt() {
    register_post_type('experience_info', array(
        'label' => 'Experience Info',
        'labels' => array(
            'singular_name' => 'Experience Info',
        ),
        'public' => true,
        'has_archive' => false,
        'rewrite' => array('slug' => 'experiences'),
        'supports' => array('title', 'editor', 'thumbnail', 'excerpt'),
        'menu_icon' => 'dashicons-tickets-alt',
        'show_in_rest' => true,
        'rest_base' => 'experience_info',
    ));
}
add_action('init', 'stanlake_register_experience_info_cpt');
```

**Guardar** → Settings → Permalinks → Save (flush rewrite)

### 3.4 ACF Fields para Contenido

**Solo campos informativos, NO scheduling/pricing/booking**

**Field Group: Wine Details**
```json
{
  "key": "group_wine_details",
  "title": "Wine Details",
  "fields": [
    {
      "key": "field_vintage",
      "label": "Vintage",
      "name": "vintage",
      "type": "number"
    },
    {
      "key": "field_grape_varieties",
      "label": "Grape Varieties",
      "name": "grape_varieties",
      "type": "text"
    },
    {
      "key": "field_tasting_notes",
      "label": "Tasting Notes",
      "name": "tasting_notes",
      "type": "textarea"
    },
    {
      "key": "field_alcohol_percentage",
      "label": "Alcohol %",
      "name": "alcohol_percentage",
      "type": "number",
      "step": 0.1
    },
    {
      "key": "field_awards",
      "label": "Awards",
      "name": "awards",
      "type": "repeater",
      "sub_fields": [
        {
          "key": "field_award_name",
          "label": "Award",
          "name": "award",
          "type": "text"
        },
        {
          "key": "field_award_year",
          "label": "Year",
          "name": "year",
          "type": "number"
        }
      ]
    }
  ],
  "location": [
    [
      {
        "param": "post_type",
        "operator": "==",
        "value": "wine"
      }
    ]
  ]
}
```

**Field Group: Experience Info** (Editorial)
```json
{
  "key": "group_experience_editorial",
  "title": "Experience Info (Editorial Only)",
  "fields": [
    {
      "key": "field_duration_display",
      "label": "Duration (Display)",
      "name": "duration_display",
      "type": "text",
      "placeholder": "e.g., 1.5 hours"
    },
    {
      "key": "field_whats_included",
      "label": "What's Included",
      "name": "whats_included",
      "type": "wysiwyg"
    },
    {
      "key": "field_gallery",
      "label": "Photo Gallery",
      "name": "gallery",
      "type": "gallery"
    },
    {
      "key": "field_ticket_tailor_event_id",
      "label": "Ticket Tailor Event ID",
      "name": "ticket_tailor_event_id",
      "type": "text",
      "instructions": "ID del evento en Ticket Tailor para embedear widget"
    },
    {
      "key": "field_short_description",
      "label": "Short Description",
      "name": "short_description",
      "type": "textarea",
      "maxlength": 200
    },
    {
      "key": "field_faq",
      "label": "FAQ",
      "name": "faq",
      "type": "repeater",
      "sub_fields": [
        {
          "key": "field_question",
          "label": "Question",
          "name": "question",
          "type": "text"
        },
        {
          "key": "field_answer",
          "label": "Answer",
          "name": "answer",
          "type": "textarea"
        }
      ]
    }
  ],
  "location": [
    [
      {
        "param": "post_type",
        "operator": "==",
        "value": "experience_info"
      }
    ]
  ]
}
```

### 3.5 Habilitar CORS

**functions.php:**
```php
<?php
// CORS para Next.js en localhost
function stanlake_enable_cors() {
    $allowed_origins = array(
        'http://localhost:3000',
        'http://localhost:3001',
        'https://stanlake-park.vercel.app', // Production
    );
    
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    
    if (in_array($origin, $allowed_origins)) {
        header("Access-Control-Allow-Origin: $origin");
        header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
        header("Access-Control-Allow-Headers: Content-Type, Authorization");
        header("Access-Control-Allow-Credentials: true");
    }
    
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        status_header(200);
        exit();
    }
}
add_action('rest_api_init', 'stanlake_enable_cors');
```

---

## 4. TICKET TAILOR SETUP

### 4.1 Crear Cuenta

**URL:** https://www.tickettailor.com

**Plan recomendado:**
- £15/month flat fee
- Unlimited events & tickets
- Sin fees por ticket
- Full branding

**Trial:** 14 días gratis para testear

### 4.2 Configuración Inicial

**Account Settings:**
- Business name: Stanlake Park Wine Estate
- Currency: GBP (£)
- Timezone: Europe/London
- Language: English (UK)

**Branding:**
- Logo: Upload Stanlake Park logo
- Primary color: `#3d6b1f` (verde viñedo)
- Secondary color: `#d4af37` (dorado)
- Fonts: Similar a sitio (Playfair/Inter)

### 4.3 Conectar Stripe

**Payment Settings:**
- Connect Stripe account (ya existente de Stanlake Park)
- Fees: Stripe standard (2.9% + £0.20)
- Payout schedule: Daily o Weekly

### 4.4 Email Templates

**Customize emails:**

**Booking Confirmation:**
```
Subject: Your Stanlake Park booking is confirmed! 🍷

Hi {customer_first_name},

We're delighted to confirm your booking:

{event_name}
📅 {event_date} at {event_time}
👥 {quantity} guests

BOOKING DETAILS
Confirmation #: {booking_reference}
Amount paid: £{amount_paid}

WHAT TO BRING
• Your ticket (show on phone or print PDF)
• Comfortable walking shoes
• We'll provide the wine glasses! 🍷

GETTING HERE
Stanlake Park Wine Estate
Twyford, Berkshire RG10 0BN
[Map Link]

See you soon!
The Stanlake Park Team
```

**Waitlist Notification:**
```
Subject: 🎉 Great news - a spot just opened!

Hi {customer_first_name},

A spot just became available for:
{event_name}
📅 {event_date} at {event_time}

You have priority booking for the next 24 hours.

[BOOK NOW]

Cheers,
Stanlake Park
```

### 4.5 Crear Primera Experiencia (Test)

**Event Details:**
- Name: Wine Tour & Tasting
- Description: [copiar de documentos]
- Duration: 1.5 hours
- Capacity: 20 per event

**Schedule:**
- Type: Recurring
- Days: Friday, Saturday, Sunday
- Time: 14:00 (2:00 PM)
- Start date: Next Friday
- End date: Open-ended

**Pricing (Dynamic):**

Crear múltiples "releases" para precios dinámicos:

```
Release 1: "Weekday Winter"
- Available: Fridays in Jan, Feb, Mar, Nov, Dec
- Price: £20

Release 2: "Weekend Winter"
- Available: Sat/Sun in Jan, Feb, Mar, Nov, Dec
- Price: £22

Release 3: "Weekday Spring/Autumn"
- Available: Fridays in Apr, May, Jun, Sep, Oct
- Price: £22

Release 4: "Weekend Spring/Autumn"
- Available: Sat/Sun in Apr, May, Jun, Sep, Oct
- Price: £24

Release 5: "Summer Peak"
- Available: All days in Jul, Aug
- Price: £25
```

**Add-ons:**
```
Add-on 1: Cheese Board
- Price: £12
- Optional
- Description: British artisan cheeses

Add-on 2: Charcuterie Board
- Price: £15
- Optional
- Description: Premium cured meats
```

**Waitlist:**
- ✅ Enable automatic waitlist
- ✅ Notify via email when available
- Priority window: 24 hours

**Vouchers:**

Crear códigos de descuento:
```
EARLYBIRD10
- Type: Percentage
- Discount: 10%
- Valid: 30+ days before event

GROUPOF6
- Type: Fixed amount
- Discount: £5 per ticket
- Minimum quantity: 6
```

**Save & Publish**

### 4.6 Embed Widget Code

**Ticket Tailor generará:**

```html
<!-- Widget embed -->
<div 
  class="tt-widget"
  data-tt-event="{EVENT_ID}"
></div>
<script src="https://cdn.tickettailor.com/js/widgets/min/widget.js"></script>
```

**O iFrame alternativo:**
```html
<iframe 
  src="https://www.tickettailor.com/checkout/view-event/id/{EVENT_ID}" 
  width="100%" 
  height="700px" 
  frameborder="0"
></iframe>
```

**Guardar estos códigos** para usar en Next.js

---

## 5. NEXT.JS FRONTEND

### 5.1 Crear Proyecto

```bash
cd ~/Sites/
npx create-next-app@latest stanlake-frontend

Options:
✅ TypeScript
✅ App Router
✅ Tailwind CSS
❌ src/ directory
✅ import alias (@/*)
```

### 5.2 Estructura de Carpetas

```
stanlake-frontend/
├── app/
│   ├── globals.css
│   ├── layout.tsx
│   ├── page.tsx (home)
│   ├── our-wines/
│   │   ├── page.tsx
│   │   └── [slug]/page.tsx
│   ├── experiences/
│   │   ├── page.tsx (hub)
│   │   └── [slug]/page.tsx (detail + TT widget)
│   ├── weddings/
│   ├── wine-bar/
│   ├── visit/
│   └── stay/
├── components/
│   ├── layout/
│   │   ├── Navbar.tsx
│   │   ├── Footer.tsx
│   │   └── ...
│   └── ui/
│       ├── WineCard.tsx
│       ├── ExperienceCard.tsx
│       └── TicketTailorWidget.tsx 🆕
├── lib/
│   ├── wordpress.ts (fetch WP content)
│   └── tickettailor.ts 🆕
└── types/
    ├── wordpress.ts
    └── tickettailor.ts 🆕
```

### 5.3 Variables de Entorno

**.env.local:**
```bash
# WordPress Backend
NEXT_PUBLIC_WORDPRESS_API_URL=http://stanlake-park-headless.local/wp-json/wp/v2
WORDPRESS_AUTH_USER=admin
WORDPRESS_AUTH_PASSWORD=your-app-password

# Ticket Tailor
NEXT_PUBLIC_TICKET_TAILOR_URL=https://www.tickettailor.com
TICKET_TAILOR_API_KEY=your-api-key-here

# Site
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SITE_NAME=Stanlake Park Wine Estate
```

### 5.4 WordPress API Helper

**lib/wordpress.ts:**
```typescript
const WP_API = process.env.NEXT_PUBLIC_WORDPRESS_API_URL!;

// Fetch wines
export async function getWines() {
  const res = await fetch(`${WP_API}/wines?_embed&per_page=100`, {
    next: { revalidate: 300 }, // 5min cache
  });
  
  if (!res.ok) throw new Error('Failed to fetch wines');
  return res.json();
}

export async function getWine(slug: string) {
  const res = await fetch(`${WP_API}/wines?slug=${slug}&_embed`);
  const data = await res.json();
  return data[0] || null;
}

// Fetch experience info (editorial only)
export async function getExperienceInfo() {
  const res = await fetch(`${WP_API}/experience_info?_embed&per_page=100`, {
    next: { revalidate: 60 },
  });
  
  if (!res.ok) throw new Error('Failed to fetch experiences');
  return res.json();
}

export async function getExperienceInfoBySlug(slug: string) {
  const res = await fetch(`${WP_API}/experience_info?slug=${slug}&_embed`);
  const data = await res.json();
  return data[0] || null;
}
```

### 5.5 Ticket Tailor Widget Component

**components/ui/TicketTailorWidget.tsx:**
```typescript
'use client';

import { useEffect, useRef } from 'react';

interface TicketTailorWidgetProps {
  eventId: string;
  className?: string;
}

export default function TicketTailorWidget({ 
  eventId,
  className = ''
}: TicketTailorWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // Load Ticket Tailor script
    const script = document.createElement('script');
    script.src = 'https://cdn.tickettailor.com/js/widgets/min/widget.js';
    script.async = true;
    document.body.appendChild(script);
    
    return () => {
      document.body.removeChild(script);
    };
  }, []);
  
  return (
    <div 
      ref={containerRef}
      className={`tt-widget ${className}`}
      data-tt-event={eventId}
    />
  );
}
```

### 5.6 Experience Detail Page

**app/experiences/[slug]/page.tsx:**
```typescript
import { getExperienceInfoBySlug } from '@/lib/wordpress';
import TicketTailorWidget from '@/components/ui/TicketTailorWidget';
import PageHero from '@/components/layout/PageHero';
import { notFound } from 'next/navigation';

export default async function ExperienceDetailPage({
  params
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params;
  const experience = await getExperienceInfoBySlug(slug);
  
  if (!experience) notFound();
  
  const {
    title,
    content,
    acf: {
      duration_display,
      whats_included,
      ticket_tailor_event_id,
      short_description,
      faq,
      gallery,
    },
    _embedded,
  } = experience;
  
  const featuredImage = _embedded?.['wp:featuredmedia']?.[0]?.source_url;
  
  return (
    <div>
      <PageHero 
        title={title.rendered}
        description={short_description}
        image={featuredImage}
      />
      
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid lg:grid-cols-3 gap-12">
          {/* Content Column */}
          <div className="lg:col-span-2">
            <div className="prose prose-lg max-w-none">
              <div dangerouslySetInnerHTML={{ __html: content.rendered }} />
            </div>
            
            {/* What's Included */}
            <div className="mt-12">
              <h3 className="text-2xl font-bold mb-4">What's Included</h3>
              <div 
                className="prose" 
                dangerouslySetInnerHTML={{ __html: whats_included }} 
              />
            </div>
            
            {/* FAQ */}
            {faq && faq.length > 0 && (
              <div className="mt-12">
                <h3 className="text-2xl font-bold mb-6">FAQ</h3>
                {faq.map((item: any, idx: number) => (
                  <details key={idx} className="mb-4 group">
                    <summary className="font-semibold cursor-pointer">
                      {item.question}
                    </summary>
                    <p className="mt-2 text-gray-600">{item.answer}</p>
                  </details>
                ))}
              </div>
            )}
          </div>
          
          {/* Booking Widget Column */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold mb-4">Book Your Experience</h3>
              
              {ticket_tailor_event_id ? (
                <TicketTailorWidget eventId={ticket_tailor_event_id} />
              ) : (
                <div className="text-gray-500 text-center py-8">
                  Booking widget coming soon
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
```

### 5.7 Experiences Hub Page

**app/experiences/page.tsx:**
```typescript
import { getExperienceInfo } from '@/lib/wordpress';
import ExperienceCard from '@/components/ui/ExperienceCard';
import PageHero from '@/components/layout/PageHero';

export default async function ExperiencesPage() {
  const experiences = await getExperienceInfo();
  
  // Group by category (puedes usar ACF field para esto)
  const wineTours = experiences.filter((exp: any) => 
    exp.title.rendered.includes('Wine Tour') || 
    exp.title.rendered.includes('Wine & Cheese Tour')
  );
  
  const seasonal = experiences.filter((exp: any) => 
    exp.title.rendered.includes('Cream Tea') || 
    exp.title.rendered.includes('Tasting')
  );
  
  return (
    <div>
      <PageHero 
        title="Experiences at Stanlake Park"
        description="Discover English wine at one of the country's oldest vineyards"
      />
      
      <div className="max-w-7xl mx-auto px-6 py-16">
        {/* Wine Tours Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8">Wine Tours</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {wineTours.map((exp: any) => (
              <ExperienceCard key={exp.id} experience={exp} />
            ))}
          </div>
        </section>
        
        {/* Seasonal Experiences */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8">Seasonal Experiences</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {seasonal.map((exp: any) => (
              <ExperienceCard key={exp.id} experience={exp} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
```

---

## 6. INTEGRACIÓN COMPLETA

### 6.1 Flujo de Usuario Completo

```
1. Usuario → stanlakepark.com (Next.js)
2. Click "Experiences" → /experiences (WP content via API)
3. Ve cards de experiencias (data de WP + preview de TT)
4. Click "Wine Tour & Tasting" → /experiences/wine-tour-tasting
5. Lee contenido editorial (WP)
6. Ve Ticket Tailor widget embebido (TT)
7. Selecciona fecha/hora (TT)
8. Agrega add-ons (TT)
9. Ingresa voucher (TT)
10. Checkout (TT → Stripe)
11. Recibe confirmation email (TT)
```

### 6.2 Data Flow Diagram

```
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │
       ▼
┌─────────────────────┐
│  Next.js Frontend   │
│  (SSG + ISR)        │
└──┬──────────────┬───┘
   │              │
   │ API          │ Embed
   │ Calls        │ Widgets
   ▼              ▼
┌────────┐   ┌──────────────┐
│   WP   │   │Ticket Tailor │
│ Headless│   │   (iframe)   │
└────────┘   └──────────────┘
```

---

## 7. MIGRATION PLAN

### 7.1 Fase 1: Setup Local (Esta Semana)

**Day 1-2:**
- [x] LocalWP instalado
- [ ] WordPress configurado (solo contenido)
- [ ] ACF Pro activado
- [ ] CPTs creados (wines, venues, accommodation, experience_info)
- [ ] CORS habilitado

**Day 3-4:**
- [ ] Ticket Tailor trial activado
- [ ] 1 experiencia de prueba creada (Wine Tour)
- [ ] Test booking completo
- [ ] Embed widget funcionando

**Day 5-7:**
- [ ] Next.js project setup
- [ ] WP API integration
- [ ] Ticket Tailor widget component
- [ ] 1 página de experiencia completa funcionando

### 7.2 Fase 2: Content Migration (Semana 2)

**Migrar de Event Tickets Plus a Ticket Tailor:**

1. **Export eventos actuales:**
   ```
   Event Tickets Plus → Export CSV
   Guardar datos: dates, times, prices, capacities
   ```

2. **Crear en Ticket Tailor:**
   - Wine Tour & Tasting
   - Wine & Cheese Tour
   - Wine & Cream Tea Tour
   - Wine & Cheese Tasting
   - Work from Vineyard
   - Special Tastings (template)
   - Special Events (template)

3. **Crear Experience Info en WP:**
   - 8 posts en `experience_info` CPT
   - Contenido editorial completo
   - Gallery images
   - FAQs
   - Link cada post a su Ticket Tailor event ID

4. **Test completo:**
   - Booking flow cada experiencia
   - Waitlist
   - Add-ons
   - Vouchers
   - Email notifications

### 7.3 Fase 3: Frontend Build (Semana 3)

**Next.js Pages:**
- [ ] Home (hero + experience hub)
- [ ] /experiences (hub con todas)
- [ ] /experiences/[slug] × 8 (detail pages)
- [ ] /our-wines
- [ ] /wine-bar
- [ ] /weddings
- [ ] /stay
- [ ] /visit

**Components:**
- [ ] Navbar (winery/wedding modes)
- [ ] Footer
- [ ] ExperienceCard
- [ ] WineCard
- [ ] TicketTailorWidget
- [ ] PageHero

### 7.4 Fase 4: Production Deploy (Semana 4)

**Hosting:**
- [ ] Next.js → Vercel o Cloudflare Pages
- [ ] WordPress → Continúa en hosting actual
- [ ] DNS updates

**Go Live:**
- [ ] Soft launch (URL test)
- [ ] Staff training
- [ ] Monitor bookings 3 días
- [ ] Full launch
- [ ] Deprecar Event Tickets Plus
- [ ] Email a base de clientes

---

## 8. ROI ANALYSIS

### 8.1 Costos

**One-time:**
- Development: £600-800 (tu tiempo)
- Stock photos: £50
- **Total one-time: £650-850**

**Recurrente anual:**
- Ticket Tailor: £180/año
- Vercel/Cloudflare: £0 (free tier) o £20/mes
- **Total anual: £180-420**

### 8.2 Revenue Adicional

**Conservador:**
```
Add-ons (25% take × 1000 bookings × £12):     £3,000
Waitlist (3% más bookings × £25):              £750
Mejor UX (5% mejora conversión):               £1,250
                                    TOTAL:      £5,000/año
```

**Realista:**
```
Add-ons (30% take × 1100 bookings × £12):     £3,960
Waitlist (5% más bookings × £25):              £1,375
Mejor UX (10% mejora conversión):              £2,500
                                    TOTAL:      £7,835/año
```

**Optimista:**
```
Add-ons (35% take × 1200 bookings × £15):     £6,300
Waitlist (7% más bookings × £25):              £2,100
Mejor UX (15% mejora conversión):              £3,750
Dynamic pricing (£2 avg increase):             £2,400
                                    TOTAL:      £14,550/año
```

### 8.3 ROI

**Scenario Realista:**
```
Inversión Año 1: £850 + £180 = £1,030
Revenue adicional: £7,835
ROI: (£7,835 - £1,030) / £1,030 = 661%

Payback period: ~7 semanas
```

**Años siguientes:**
```
Inversión: £180/año
Revenue: £7,835/año
ROI: 4,253%
```

### 8.4 Intangibles

**Beneficios no cuantificados:**
- ✅ Mejor experiencia de usuario
- ✅ Brand perception mejorado
- ✅ Menos trabajo manual (waitlist auto)
- ✅ Datos centralizados
- ✅ Reportes automáticos
- ✅ Escalabilidad sin límites
- ✅ Stack moderno (futuro-proof)

---

## ✅ CHECKLIST FINAL

### WordPress
- [ ] LocalWP site creado
- [ ] ACF Pro instalado con license
- [ ] ACF to REST API activo
- [ ] CPTs registrados (wines, venues, accommodation, experience_info)
- [ ] CORS configurado
- [ ] Permalinks = Post name
- [ ] Application Password creada

### Ticket Tailor
- [ ] Cuenta creada (trial o paid)
- [ ] Branding configurado
- [ ] Stripe conectado
- [ ] Email templates personalizados
- [ ] 1 experiencia de prueba creada
- [ ] Test booking exitoso
- [ ] Embed code copiado

### Next.js
- [ ] Project creado
- [ ] .env.local configurado
- [ ] lib/wordpress.ts funciona
- [ ] TicketTailorWidget component creado
- [ ] 1 página de experiencia funcional
- [ ] Test local exitoso

### Testing
- [ ] Fetch WP content works
- [ ] Ticket Tailor embed renders
- [ ] Booking flow completo (test transaction)
- [ ] Waitlist funciona
- [ ] Add-ons funcionan
- [ ] Voucher se aplica
- [ ] Email received

---

## 🚀 NEXT STEPS

1. **LocalWP:** Crear site ahora
2. **WordPress:** Install plugins + create CPTs
3. **Ticket Tailor:** Start trial + create test event
4. **Next.js:** Setup project + fetch WP data
5. **Test:** Complete booking flow
6. **Iterate:** Fix bugs, improve UX
7. **Deploy:** Vercel staging
8. **Launch:** Production

---

*Ready to build the future of Stanlake Park! 🍷*
