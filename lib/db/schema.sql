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
