# TICKET TAILOR INTEGRATION - INSTALACIÓN

## 📦 Archivos generados

Esta carpeta contiene todos los archivos necesarios para integrar Ticket Tailor con Next.js.

## 📂 Estructura

```
stanlake-nextjs-integration/
├── .env.local                          ← Variables de entorno
├── app/
│   └── api/
│       └── tt/
│           ├── events/
│           │   └── route.ts            ← Lista todos los eventos
│           └── event/
│               └── [id]/
│                   └── route.ts        ← Detalles + disponibilidad
├── lib/
│   └── ticket-tailor.ts                ← Helpers y tipos TypeScript
└── hooks/
    └── useTicketTailor.ts              ← React hooks para fetch
```

## 🚀 INSTALACIÓN (COPIAR/PEGAR)

### Paso 1: Copiar TODA esta carpeta

Copiá el contenido de `stanlake-nextjs-integration/` a la raíz de tu proyecto Next.js.

**IMPORTANTE:** Hacelo manteniendo la estructura de carpetas.

### Paso 2: Actualizar .env.local

Si ya tenés un archivo `.env.local`, **NO lo reemplaces**. 
En su lugar, **agregá** estas líneas al final:

```bash
# Ticket Tailor API
TICKET_TAILOR_API_KEY=sk_11877_291473_3d1797c789e225acf1c78cf8c665872d
NEXT_PUBLIC_TT_ACCOUNT_NAME=stanlakepark
```

### Paso 3: Verificar imports

Si tu proyecto Next.js usa alias de imports (ej: `@/lib`, `@/hooks`), 
verificá que coincidan con tu `tsconfig.json`.

**Nuestros imports usan:**
- `@/lib/ticket-tailor` 
- `@/hooks/useTicketTailor`

Si tu proyecto usa otro alias, ajustá los imports en los archivos.

### Paso 4: Reiniciar dev server

```bash
npm run dev
# o
yarn dev
```

## ✅ TESTEAR QUE FUNCIONA

### Test 1: API Events

Abrí en tu navegador o curl:
```bash
curl http://localhost:3000/api/tt/events
```

Deberías ver JSON con tus eventos de Ticket Tailor.

### Test 2: API Event Detail

Reemplazá `EVENT_ID` con el ID de tu evento de prueba:
```bash
curl http://localhost:3000/api/tt/event/EVENT_ID
```

Deberías ver detalles del evento + disponibilidad + ticket types.

## 🔧 TROUBLESHOOTING

### Error: "Module not found: Can't resolve '@/lib/ticket-tailor'"

**Solución:** Verificá que `tsconfig.json` tenga:
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

### Error: "TICKET_TAILOR_API_KEY is not defined"

**Solución:** 
1. Verificá que `.env.local` existe en la raíz del proyecto
2. Reiniciá el dev server (`npm run dev`)

### Error 401 en las API routes

**Solución:** Verificá que la API key en `.env.local` es correcta.

## 📞 SIGUIENTE PASO

Una vez que las API routes funcionen, seguimos con los componentes React:
- BookingCalendar
- AvailabilityIndicator  
- CheckoutModal

---

**¿Funciona todo? Avisame para seguir con el UI.**
