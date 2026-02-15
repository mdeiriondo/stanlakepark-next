# SISTEMA DE BOOKINGS STANLAKE PARK - INSTRUCCIONES PARA CURSOR

## 🎯 OBJETIVO

Implementar un sistema de reservas (bookings) para experiencias de vino que:
1. Permite seleccionar fecha, hora y número de personas en la web Next.js
2. Usa WooCommerce checkout para el pago (aprovechando usuarios existentes)
3. Almacena slots y bookings en Vercel Postgres
4. Se administra desde WordPress (plugin custom)

---

## 📊 ARQUITECTURA

### Stack Técnico:
- **Frontend:** Next.js 16 App Router
- **Base de Datos:** Vercel Postgres (@vercel/postgres)
- **Checkout/Pago:** WooCommerce REST API
- **Admin:** WordPress Plugin custom

### Flujo Completo:
```
Usuario elige experiencia/fecha/hora/personas
  ↓
Next.js valida disponibilidad (consulta DB)
  ↓
Click "Reserve & Pay"
  ↓
Next.js crea producto WooCommerce vía API
  ↓
Redirige a WooCommerce checkout
  ↓
Usuario paga (Stripe/Square/lo que esté configurado)
  ↓
WooCommerce webhook → Next.js
  ↓
Next.js crea booking en DB + reduce capacidad slot
```

---

## 🗄️ PARTE 1: BASE DE DATOS (Vercel Postgres)

### Schema SQL a ejecutar:

```sql
-- Tabla: slots (franjas horarias reservables)
CREATE TABLE IF NOT EXISTS slots (
  id SERIAL PRIMARY KEY,
  experience_slug VARCHAR(255) NOT NULL,
  date DATE NOT NULL,
  time TIME NOT NULL,
  capacity INT NOT NULL,
  booked INT DEFAULT 0,
  price_per_person DECIMAL(10,2) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT capacity_check CHECK (booked <= capacity),
  CONSTRAINT unique_slot UNIQUE (experience_slug, date, time)
);

-- Tabla: slot_rules (reglas recurrentes - para generación automática)
CREATE TABLE IF NOT EXISTS slot_rules (
  id SERIAL PRIMARY KEY,
  experience_slug VARCHAR(255) NOT NULL,
  days_of_week TEXT[] NOT NULL,
  times TIME[] NOT NULL,
  capacity INT NOT NULL,
  price_per_person DECIMAL(10,2) NOT NULL,
  valid_from DATE NOT NULL,
  valid_until DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabla: bookings (reservas confirmadas)
CREATE TABLE IF NOT EXISTS bookings (
  id SERIAL PRIMARY KEY,
  slot_id INT REFERENCES slots(id) ON DELETE CASCADE,
  wc_order_id INT NOT NULL,
  customer_email VARCHAR(255) NOT NULL,
  customer_name VARCHAR(255) NOT NULL,
  guests INT NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  booking_reference VARCHAR(50) UNIQUE NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_slots_experience_date ON slots(experience_slug, date);
CREATE INDEX IF NOT EXISTS idx_slots_active ON slots(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_bookings_wc_order ON bookings(wc_order_id);
CREATE INDEX IF NOT EXISTS idx_bookings_reference ON bookings(booking_reference);
CREATE INDEX IF NOT EXISTS idx_bookings_slot ON bookings(slot_id);
```

### Archivo a crear: `lib/db/schema.sql`
Guardar el SQL de arriba.

### Archivo a crear: `lib/db/init.ts`
Script para ejecutar las migraciones:

```typescript
import { sql } from '@vercel/postgres';
import { readFileSync } from 'fs';
import { join } from 'path';

export async function initDatabase() {
  const schemaSQL = readFileSync(join(process.cwd(), 'lib/db/schema.sql'), 'utf-8');
  
  try {
    await sql.query(schemaSQL);
    console.log('✅ Database initialized successfully');
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  }
}
```

### Script NPM a agregar en `package.json`:

```json
{
  "scripts": {
    "db:init": "tsx lib/db/init.ts"
  }
}
```

---

## 🔌 PARTE 2: INTEGRACIÓN WOOCOMMERCE

### Archivo a crear: `lib/woocommerce.ts`

```typescript
import WooCommerceRestApi from "@woocommerce/woocommerce-rest-api";

const WooCommerce = new WooCommerceRestApi({
  url: process.env.WC_STORE_URL!,
  consumerKey: process.env.WC_CONSUMER_KEY!,
  consumerSecret: process.env.WC_CONSUMER_SECRET!,
  version: "wc/v3"
});

export interface CreateBookingProductParams {
  experienceName: string;
  experienceSlug: string;
  date: string;
  time: string;
  guests: number;
  pricePerPerson: number;
  slotId: number;
}

export async function createBookingProduct(params: CreateBookingProductParams) {
  const { experienceName, experienceSlug, date, time, guests, pricePerPerson, slotId } = params;
  const totalPrice = pricePerPerson * guests;
  
  // Formato de fecha legible: "22 February 2026"
  const formattedDate = new Date(date).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
  
  const productName = `${experienceName} - ${formattedDate} at ${time} (${guests} ${guests === 1 ? 'guest' : 'guests'})`;
  
  try {
    const response = await WooCommerce.post("products", {
      name: productName,
      type: "simple",
      regular_price: totalPrice.toFixed(2),
      virtual: true,
      manage_stock: false,
      sold_individually: true,
      catalog_visibility: "hidden", // No mostrar en catálogo
      meta_data: [
        { key: "_booking_slot_id", value: slotId.toString() },
        { key: "_booking_experience_slug", value: experienceSlug },
        { key: "_booking_date", value: date },
        { key: "_booking_time", value: time },
        { key: "_booking_guests", value: guests.toString() },
        { key: "_booking_price_per_person", value: pricePerPerson.toString() }
      ],
      categories: [
        { id: await getBookingsCategoryId() } // Categoría "Bookings"
      ]
    });

    return response.data;
  } catch (error) {
    console.error('Error creating WooCommerce product:', error);
    throw new Error('Failed to create booking product');
  }
}

async function getBookingsCategoryId(): Promise<number> {
  try {
    // Buscar categoría "Bookings"
    const categories = await WooCommerce.get("products/categories", {
      search: "Bookings"
    });
    
    if (categories.data.length > 0) {
      return categories.data[0].id;
    }
    
    // Si no existe, crearla
    const newCategory = await WooCommerce.post("products/categories", {
      name: "Bookings",
      slug: "bookings",
      description: "Experience bookings - auto-generated"
    });
    
    return newCategory.data.id;
  } catch (error) {
    console.error('Error getting/creating Bookings category:', error);
    return 0; // Sin categoría
  }
}

export async function addToCart(productId: number): Promise<string> {
  // WooCommerce no tiene endpoint directo para "add to cart"
  // Retornamos la URL de checkout con el producto
  return `${process.env.WC_STORE_URL}/checkout/?add-to-cart=${productId}`;
}

export default WooCommerce;
```

---

## 🌐 PARTE 3: API ROUTES

### 3.1 - Obtener slots disponibles

**Archivo:** `app/api/slots/available/route.ts`

```typescript
import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const experienceSlug = searchParams.get('experience');
  const fromDate = searchParams.get('from') || new Date().toISOString().split('T')[0];
  const toDate = searchParams.get('to');

  if (!experienceSlug) {
    return NextResponse.json(
      { error: 'experience parameter is required' },
      { status: 400 }
    );
  }

  try {
    let query = `
      SELECT 
        id,
        experience_slug,
        date,
        time,
        capacity,
        booked,
        (capacity - booked) as available,
        price_per_person,
        is_active
      FROM slots
      WHERE experience_slug = $1
        AND is_active = true
        AND date >= $2
        AND (capacity - booked) > 0
    `;
    
    const params: any[] = [experienceSlug, fromDate];
    
    if (toDate) {
      query += ` AND date <= $3`;
      params.push(toDate);
    }
    
    query += ` ORDER BY date ASC, time ASC`;

    const { rows } = await sql.query(query, params);

    return NextResponse.json({
      success: true,
      slots: rows
    });
  } catch (error) {
    console.error('Error fetching available slots:', error);
    return NextResponse.json(
      { error: 'Failed to fetch available slots' },
      { status: 500 }
    );
  }
}
```

---

### 3.2 - Crear booking y redirigir a checkout

**Archivo:** `app/api/booking/create/route.ts`

```typescript
import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { createBookingProduct } from '@/lib/woocommerce';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { slotId, guests, experienceName } = body;

    if (!slotId || !guests || !experienceName) {
      return NextResponse.json(
        { error: 'Missing required fields: slotId, guests, experienceName' },
        { status: 400 }
      );
    }

    // 1. Verificar disponibilidad del slot
    const { rows: [slot] } = await sql.query(
      `SELECT * FROM slots WHERE id = $1 AND is_active = true`,
      [slotId]
    );

    if (!slot) {
      return NextResponse.json(
        { error: 'Slot not found or inactive' },
        { status: 404 }
      );
    }

    const available = slot.capacity - slot.booked;
    
    if (available < guests) {
      return NextResponse.json(
        { error: `Not enough availability. Only ${available} spots left.` },
        { status: 400 }
      );
    }

    // 2. Crear producto en WooCommerce
    const product = await createBookingProduct({
      experienceName,
      experienceSlug: slot.experience_slug,
      date: slot.date,
      time: slot.time,
      guests,
      pricePerPerson: parseFloat(slot.price_per_person),
      slotId: slot.id
    });

    // 3. Generar URL de checkout
    const checkoutUrl = `${process.env.WC_STORE_URL}/checkout/?add-to-cart=${product.id}`;

    // 4. Reservar temporalmente las plazas (hold por 15 minutos)
    // Esto se puede hacer con un campo "held_until" o simplemente confiar
    // en que el webhook confirme o libere
    await sql.query(
      `UPDATE slots SET booked = booked + $1 WHERE id = $2`,
      [guests, slotId]
    );

    return NextResponse.json({
      success: true,
      checkoutUrl,
      productId: product.id,
      slotId: slot.id
    });

  } catch (error) {
    console.error('Error creating booking:', error);
    return NextResponse.json(
      { error: 'Failed to create booking' },
      { status: 500 }
    );
  }
}
```

---

### 3.3 - Webhook de WooCommerce

**Archivo:** `app/api/webhooks/woocommerce/route.ts`

```typescript
import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import crypto from 'crypto';

function verifyWebhookSignature(body: string, signature: string): boolean {
  const secret = process.env.WC_WEBHOOK_SECRET!;
  const hash = crypto
    .createHmac('sha256', secret)
    .update(body)
    .digest('base64');
  
  return hash === signature;
}

function generateBookingReference(): string {
  const date = new Date();
  const year = date.getFullYear();
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `SP-${year}-${random}`;
}

export async function POST(request: Request) {
  try {
    const signature = request.headers.get('x-wc-webhook-signature');
    const body = await request.text();

    // Verificar firma del webhook
    if (!signature || !verifyWebhookSignature(body, signature)) {
      return NextResponse.json(
        { error: 'Invalid webhook signature' },
        { status: 401 }
      );
    }

    const payload = JSON.parse(body);
    
    // Solo procesar cuando la orden esté completada o en processing
    if (!['completed', 'processing'].includes(payload.status)) {
      return NextResponse.json({ message: 'Order status not actionable' });
    }

    // Extraer metadata de los line items
    for (const item of payload.line_items) {
      const slotId = item.meta_data.find((m: any) => m.key === '_booking_slot_id')?.value;
      const guests = item.meta_data.find((m: any) => m.key === '_booking_guests')?.value;
      const date = item.meta_data.find((m: any) => m.key === '_booking_date')?.value;
      const time = item.meta_data.find((m: any) => m.key === '_booking_time')?.value;

      if (!slotId || !guests) continue;

      // Verificar si ya existe un booking para esta orden
      const { rows: existingBookings } = await sql.query(
        `SELECT id FROM bookings WHERE wc_order_id = $1 AND slot_id = $2`,
        [payload.id, parseInt(slotId)]
      );

      if (existingBookings.length > 0) {
        console.log(`Booking already exists for order ${payload.id}`);
        continue;
      }

      // Crear booking confirmado
      const bookingReference = generateBookingReference();
      
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
          parseInt(slotId),
          payload.id,
          payload.billing.email,
          `${payload.billing.first_name} ${payload.billing.last_name}`.trim(),
          parseInt(guests),
          parseFloat(item.total),
          'confirmed',
          bookingReference,
          JSON.stringify({
            date,
            time,
            order_number: payload.number,
            payment_method: payload.payment_method_title
          })
        ]
      );

      console.log(`✅ Booking created: ${bookingReference} for order ${payload.id}`);
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
```

---

## 🎨 PARTE 4: COMPONENTES REACT

### 4.1 - Hook para slots disponibles

**Archivo:** `hooks/useSlots.ts`

```typescript
'use client';

import { useState, useEffect } from 'react';

interface Slot {
  id: number;
  experience_slug: string;
  date: string;
  time: string;
  capacity: number;
  booked: number;
  available: number;
  price_per_person: number;
}

export function useAvailableSlots(experienceSlug: string, fromDate?: string) {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!experienceSlug) return;

    async function fetchSlots() {
      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({
          experience: experienceSlug,
        });
        
        if (fromDate) {
          params.append('from', fromDate);
        }

        const response = await fetch(`/api/slots/available?${params}`);
        const data = await response.json();

        if (!data.success) {
          throw new Error(data.error || 'Failed to fetch slots');
        }

        setSlots(data.slots);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    fetchSlots();
  }, [experienceSlug, fromDate]);

  return { slots, loading, error };
}
```

---

### 4.2 - Componente SlotPicker

**Archivo:** `components/booking/SlotPicker.tsx`

```typescript
'use client';

import { useState, useMemo } from 'react';
import { useAvailableSlots } from '@/hooks/useSlots';
import { format, parseISO } from 'date-fns';

interface SlotPickerProps {
  experienceSlug: string;
  onSlotSelected: (slotId: number, date: string, time: string, pricePerPerson: number) => void;
}

export function SlotPicker({ experienceSlug, onSlotSelected }: SlotPickerProps) {
  const { slots, loading, error } = useAvailableSlots(experienceSlug);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  // Agrupar slots por fecha
  const slotsByDate = useMemo(() => {
    const grouped = new Map<string, typeof slots>();
    
    slots.forEach(slot => {
      if (!grouped.has(slot.date)) {
        grouped.set(slot.date, []);
      }
      grouped.get(slot.date)!.push(slot);
    });
    
    return grouped;
  }, [slots]);

  const availableDates = Array.from(slotsByDate.keys()).sort();
  const timesForSelectedDate = selectedDate ? slotsByDate.get(selectedDate) || [] : [];

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    setSelectedTime(null);
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    
    const selectedSlot = timesForSelectedDate.find(s => s.time === time);
    if (selectedSlot) {
      onSlotSelected(
        selectedSlot.id,
        selectedSlot.date,
        selectedSlot.time,
        selectedSlot.price_per_person
      );
    }
  };

  if (loading) {
    return (
      <div className="py-8 text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-brand border-r-transparent" />
        <p className="mt-4 text-sm uppercase tracking-widest text-dark/60">
          Loading available dates...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-dark/10 bg-cream p-6">
        <p className="text-sm text-dark/60">
          Unable to load available dates. Please try again later.
        </p>
      </div>
    );
  }

  if (slots.length === 0) {
    return (
      <div className="rounded-lg border border-dark/10 bg-cream p-6">
        <p className="text-sm text-dark/60">
          No dates currently available for booking.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Selector de Fecha */}
      <div>
        <h3 className="mb-3 font-serif text-xl text-dark">
          Select Date
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {availableDates.map(date => {
            const dateObj = parseISO(date);
            const isSelected = selectedDate === date;
            
            return (
              <button
                key={date}
                onClick={() => handleDateSelect(date)}
                className={`
                  p-4 rounded-lg border transition-all
                  ${isSelected 
                    ? 'border-brand bg-brand text-cream' 
                    : 'border-dark/10 bg-white hover:border-brand/30'
                  }
                `}
              >
                <div className="text-center">
                  <p className="text-sm uppercase tracking-widest opacity-70">
                    {format(dateObj, 'EEE')}
                  </p>
                  <p className="mt-1 text-2xl font-serif">
                    {format(dateObj, 'd')}
                  </p>
                  <p className="text-sm">
                    {format(dateObj, 'MMM yyyy')}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selector de Hora */}
      {selectedDate && timesForSelectedDate.length > 0 && (
        <div>
          <h3 className="mb-3 font-serif text-xl text-dark">
            Select Time
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {timesForSelectedDate.map(slot => {
              const isSelected = selectedTime === slot.time;
              const isLowStock = slot.available <= 3;
              
              return (
                <button
                  key={`${slot.date}-${slot.time}`}
                  onClick={() => handleTimeSelect(slot.time)}
                  disabled={slot.available === 0}
                  className={`
                    p-4 rounded-lg border transition-all text-left
                    ${isSelected 
                      ? 'border-brand bg-brand text-cream' 
                      : slot.available === 0
                        ? 'border-dark/10 bg-gray-100 opacity-50 cursor-not-allowed'
                        : 'border-dark/10 bg-white hover:border-brand/30'
                    }
                  `}
                >
                  <p className="text-lg font-medium">
                    {slot.time.slice(0, 5)}
                  </p>
                  <p className={`text-xs uppercase tracking-widest mt-1 ${
                    isSelected ? 'text-cream/70' : 'text-dark/60'
                  }`}>
                    {slot.available === 0 
                      ? 'Sold Out'
                      : isLowStock
                        ? `Only ${slot.available} left`
                        : `${slot.available} available`
                    }
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
```

---

### 4.3 - Componente GuestSelector

**Archivo:** `components/booking/GuestSelector.tsx`

```typescript
'use client';

import { Minus, Plus } from 'lucide-react';

interface GuestSelectorProps {
  guests: number;
  maxGuests: number;
  onGuestsChange: (guests: number) => void;
  pricePerPerson: number;
}

export function GuestSelector({ 
  guests, 
  maxGuests, 
  onGuestsChange,
  pricePerPerson 
}: GuestSelectorProps) {
  const totalPrice = guests * pricePerPerson;

  const handleDecrement = () => {
    if (guests > 1) {
      onGuestsChange(guests - 1);
    }
  };

  const handleIncrement = () => {
    if (guests < maxGuests) {
      onGuestsChange(guests + 1);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="font-serif text-xl text-dark">
        Number of Guests
      </h3>

      <div className="flex items-center gap-4">
        <button
          onClick={handleDecrement}
          disabled={guests <= 1}
          className="
            p-3 rounded-full border border-dark/10
            hover:border-brand hover:bg-brand/5
            disabled:opacity-30 disabled:cursor-not-allowed
            transition-all
          "
          aria-label="Decrease guests"
        >
          <Minus className="h-5 w-5" />
        </button>

        <div className="flex-1 text-center">
          <p className="text-4xl font-serif text-dark">
            {guests}
          </p>
          <p className="text-sm uppercase tracking-widest text-dark/60 mt-1">
            {guests === 1 ? 'Guest' : 'Guests'}
          </p>
        </div>

        <button
          onClick={handleIncrement}
          disabled={guests >= maxGuests}
          className="
            p-3 rounded-full border border-dark/10
            hover:border-brand hover:bg-brand/5
            disabled:opacity-30 disabled:cursor-not-allowed
            transition-all
          "
          aria-label="Increase guests"
        >
          <Plus className="h-5 w-5" />
        </button>
      </div>

      {maxGuests < 10 && (
        <p className="text-xs text-center text-dark/40 uppercase tracking-widest">
          Maximum {maxGuests} guests for this slot
        </p>
      )}

      {/* Total Price */}
      <div className="pt-4 border-t border-dark/10">
        <div className="flex items-baseline justify-between">
          <p className="text-sm uppercase tracking-widest text-dark/60">
            Total Price
          </p>
          <p className="font-serif text-3xl text-brand">
            £{totalPrice.toFixed(2)}
          </p>
        </div>
        <p className="text-xs text-dark/40 text-right mt-1">
          £{pricePerPerson.toFixed(2)} × {guests} {guests === 1 ? 'guest' : 'guests'}
        </p>
      </div>
    </div>
  );
}
```

---

### 4.4 - Componente principal BookingFlow (WooCommerce version)

**Archivo:** `components/booking/BookingFlowWC.tsx`

```typescript
'use client';

import { useState } from 'react';
import { SlotPicker } from './SlotPicker';
import { GuestSelector } from './GuestSelector';

interface BookingFlowWCProps {
  experienceSlug: string;
  experienceName: string;
}

export function BookingFlowWC({ experienceSlug, experienceName }: BookingFlowWCProps) {
  const [selectedSlot, setSelectedSlot] = useState<{
    id: number;
    date: string;
    time: string;
    pricePerPerson: number;
  } | null>(null);

  const [guests, setGuests] = useState(2);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSlotSelected = (
    id: number, 
    date: string, 
    time: string, 
    pricePerPerson: number
  ) => {
    setSelectedSlot({ id, date, time, pricePerPerson });
  };

  const handleReserveAndPay = async () => {
    if (!selectedSlot) return;

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/booking/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slotId: selectedSlot.id,
          guests,
          experienceName,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to create booking');
      }

      // Redirigir a WooCommerce checkout
      window.location.href = data.checkoutUrl;

    } catch (error) {
      console.error('Error creating booking:', error);
      alert(error instanceof Error ? error.message : 'Failed to proceed to checkout');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Selector de Fecha/Hora */}
      <SlotPicker
        experienceSlug={experienceSlug}
        onSlotSelected={handleSlotSelected}
      />

      {/* Selector de Invitados */}
      {selectedSlot && (
        <GuestSelector
          guests={guests}
          maxGuests={20} // TODO: obtener del slot.available
          onGuestsChange={setGuests}
          pricePerPerson={selectedSlot.pricePerPerson}
        />
      )}

      {/* CTA */}
      {selectedSlot && (
        <button
          onClick={handleReserveAndPay}
          disabled={isSubmitting}
          className="
            w-full py-4 px-6 
            bg-brand text-cream rounded-lg
            font-medium uppercase tracking-widest
            hover:bg-brand/90 
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-all
          "
        >
          {isSubmitting ? 'Processing...' : 'Reserve & Pay'}
        </button>
      )}
    </div>
  );
}
```

---

## 📝 PARTE 5: ACTUALIZAR PÁGINA DE EXPERIENCIA

### Modificar: `app/experiences/[slug]/page.tsx`

Reemplazar `<BookingFlow ticketTailorEventId={...} />` con:

```typescript
import { BookingFlowWC } from '@/components/booking/BookingFlowWC';

// ... dentro del componente
{experienceDetails?.ticketTailorEventId ? (
  <div className="p-6 bg-white rounded-lg border border-dark/10">
    <BookingFlowWC
      experienceSlug={slug}
      experienceName={title}
    />
  </div>
) : (
  // ... fallback
)}
```

---

## ✅ CHECKLIST DE IMPLEMENTACIÓN

### Setup Inicial:
- [ ] Instalar dependencias: `npm install @woocommerce/woocommerce-rest-api @vercel/postgres date-fns`
- [ ] Agregar variables de entorno a `.env.local`
- [ ] Crear archivo `lib/db/schema.sql` con el schema SQL
- [ ] Crear archivo `lib/db/init.ts` para migraciones
- [ ] Ejecutar `npm run db:init` para crear tablas

### Backend:
- [ ] Crear `lib/woocommerce.ts` (integración WC REST API)
- [ ] Crear `app/api/slots/available/route.ts` (GET slots disponibles)
- [ ] Crear `app/api/booking/create/route.ts` (POST crear booking)
- [ ] Crear `app/api/webhooks/woocommerce/route.ts` (POST webhook WC)

### Frontend:
- [ ] Crear `hooks/useSlots.ts` (hook para fetch slots)
- [ ] Crear `components/booking/SlotPicker.tsx`
- [ ] Crear `components/booking/GuestSelector.tsx`
- [ ] Crear `components/booking/BookingFlowWC.tsx`
- [ ] Actualizar `app/experiences/[slug]/page.tsx`

### Testing:
- [ ] Testear `/api/slots/available?experience=wine-tour-tasting`
- [ ] Testear flujo completo: seleccionar slot → crear booking → checkout WC
- [ ] Verificar webhook: completar orden → verificar booking en DB
- [ ] Testear con cuenta de usuario existente de WooCommerce
- [ ] Testear reducción de capacidad del slot

---

## 🚨 PUNTOS CRÍTICOS

1. **Validación de disponibilidad:** Siempre verificar `(capacity - booked) >= guests` antes de crear producto WC
2. **Seguridad del webhook:** Verificar firma `x-wc-webhook-signature`
3. **Idempotencia:** No crear bookings duplicados (verificar `wc_order_id` existente)
4. **Manejo de errores:** Mostrar mensajes claros al usuario si falla algo
5. **Timeout:** El "hold" de plazas al crear producto WC puede fallar si el usuario no paga; considerar un cleanup job

---

## 📞 SIGUIENTE PASO (WORDPRESS PLUGIN)

Una vez que esto funcione, crear el plugin WordPress para administrar slots desde el admin panel.

**Estructura del plugin:**
```
stanlake-slot-manager/
├── stanlake-slot-manager.php (main file)
├── includes/
│   ├── class-db-connector.php (conexión a Vercel Postgres)
│   └── class-slot-admin.php (admin UI)
└── admin/
    ├── views/
    │   ├── slots-list.php
    │   └── slot-edit.php
    └── css/
        └── admin.css
```

---

**FIN DE INSTRUCCIONES PARA CURSOR**
