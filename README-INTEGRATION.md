# STANLAKE PARK - WORDPRESS + TICKET TAILOR INTEGRATION

## 🎯 Overview

Integración completa que conecta:
- **WordPress GraphQL** (contenido de experiencias)
- **Ticket Tailor API** (disponibilidad y checkout)
- **Next.js 16** (frontend)

## 📦 Archivos Incluidos

```
stanlake-tt-components/
├── .env.example                        ← Variables de entorno
├── app/
│   └── experiences/
│       └── [slug]/
│           └── page.tsx                ← Página dinámica de experiencia
└── components/
    └── booking/
        ├── AvailabilityBadge.tsx       ← Badge de disponibilidad
        ├── AddOnsSelector.tsx          ← Selector de add-ons
        ├── CheckoutModal.tsx           ← Modal de checkout TT
        └── BookingFlow.tsx             ← Componente principal
```

## 🚀 Instalación

### 1. Copiar archivos

Copiá todos los archivos a tu proyecto Next.js manteniendo la estructura.

### 2. Configurar variables de entorno

Editá tu `.env.local`:

```bash
# WordPress
WORDPRESS_GRAPHQL_ENDPOINT=https://stanlakepark.com/graphql

# Ticket Tailor
TICKET_TAILOR_API_KEY=sk_11877_291473_3d1797c789e225acf1c78cf8c665872d
NEXT_PUBLIC_TT_ACCOUNT_NAME=stanlakepark

# Site
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
```

### 3. Instalar dependencias

Si aún no las tenés:

```bash
npm install framer-motion lucide-react
# o
yarn add framer-motion lucide-react
```

### 4. Verificar que tengas el componente Button

El `BookingFlow` usa `<Button>` de tu design system. 

Si no lo tenés, creá uno básico en `components/ui/Button.tsx`:

```tsx
interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
  onClick?: () => void;
  disabled?: boolean;
}

export function Button({ 
  children, 
  variant = 'primary', 
  onClick, 
  disabled 
}: ButtonProps) {
  const baseStyles = "px-6 py-3 rounded font-medium transition-all uppercase tracking-widest";
  const variantStyles = variant === 'primary' 
    ? "bg-brand text-cream hover:bg-brand/90" 
    : "bg-dark text-cream hover:bg-dark/90";
  const disabledStyles = disabled ? "opacity-50 cursor-not-allowed" : "";
  
  return (
    <button 
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variantStyles} ${disabledStyles}`}
    >
      {children}
    </button>
  );
}
```

## 🧪 Testing

### 1. Testear página de experiencia

```bash
npm run dev

# Navegá a:
http://localhost:3000/experiences/wine-tour-tasting
```

**Deberías ver:**
- ✅ Contenido de WordPress (título, descripción, highlights)
- ✅ Featured image
- ✅ Información de Ticket Tailor (disponibilidad)
- ✅ Selector de add-ons (si hay)
- ✅ Botón "Book Now"

### 2. Testear flujo de booking

1. Click en "Book Now"
2. Debería abrir modal con checkout de Ticket Tailor
3. Completar datos de prueba
4. Verificar que el checkout funciona

## 🎨 Personalización

### Colores (Tailwind)

El diseño usa estas clases de Tailwind:
- `bg-brand` - Color principal
- `bg-cream` - Background claro
- `bg-dark` - Texto oscuro
- `bg-gold` - Acentos

Asegurate de tenerlos definidos en `tailwind.config.js`:

```js
module.exports = {
  theme: {
    extend: {
      colors: {
        brand: '#your-primary-color',
        cream: '#FBF9F6',
        dark: '#1A1A1A',
        gold: '#D4AF37',
      },
    },
  },
}
```

## 🔗 Flujo Completo

```
1. Usuario entra a /experiences/wine-tour-tasting
   ↓
2. Next.js fetch WordPress GraphQL
   → Obtiene: título, descripción, highlights, imagen
   ↓
3. BookingFlow fetch Ticket Tailor API
   → Obtiene: disponibilidad, precio, add-ons
   ↓
4. Usuario selecciona add-ons (opcional)
   ↓
5. Click "Book Now"
   ↓
6. Modal se abre con Ticket Tailor checkout
   ↓
7. Usuario completa pago en TT
   ↓
8. TT procesa pago y envía tickets
   ↓
9. Modal se cierra → Confirmación
```

## 📝 Conectar Ticket Tailor Event ID

Para que una experiencia de WordPress se conecte con Ticket Tailor:

1. Andá a WordPress → Experiences → Editar experiencia
2. En "Experience Details" → "Ticket Tailor Event ID"
3. Pegá el ID del evento de Ticket Tailor (ej: `evt_abc123`)
4. Update

El campo `isBookable` se calcula automáticamente en GraphQL.

## 🚨 Troubleshooting

### Error: "Cannot find module '@/components/ui/Button'"

**Solución:** Creá el componente Button (ver paso 4 de instalación).

### Modal no abre

**Solución:** Verificá que Framer Motion esté instalado:
```bash
npm install framer-motion
```

### No se muestra disponibilidad

**Solución:** 
1. Verificá que `TICKET_TAILOR_API_KEY` esté en `.env.local`
2. Verificá que el Event ID en WordPress sea correcto
3. Testear directamente: `curl http://localhost:3000/api/tt/event/EVENT_ID`

### Estilos rotos

**Solución:** Verificá que Tailwind esté configurado con los colores custom (brand, cream, dark, gold).

## ✅ Checklist Final

Antes de deploy:

- [ ] Variables de entorno configuradas (`.env.local`)
- [ ] Todos los archivos copiados
- [ ] Dependencias instaladas (framer-motion, lucide-react)
- [ ] Componente Button creado
- [ ] Colores Tailwind configurados
- [ ] Testeado en localhost
- [ ] Al menos 1 experiencia tiene Ticket Tailor Event ID
- [ ] Modal de checkout funciona

---

**¿Todo listo? Deploy y a celebrar 🍷**
