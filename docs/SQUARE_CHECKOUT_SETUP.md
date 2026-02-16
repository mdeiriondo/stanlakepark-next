# Configuración de Checkout Custom con Square

## ✅ Lo que ya está implementado

1. **Checkout custom en Next.js** - Todo el flujo de checkout está en tu dominio (`stanlakepark.vercel.app`), no redirige a WordPress
2. **Integración Square Web Payments SDK** - Formulario de pago con tarjeta integrado
3. **API route `/api/booking/checkout`** - Procesa el pago con Square y crea la orden en WooCommerce

## 🔑 Variables de Entorno Necesarias

Agregar estas variables en **Vercel → Project → Settings → Environment Variables**:

### Square (Públicas - Frontend)
```
NEXT_PUBLIC_SQUARE_APPLICATION_ID=sandbox-sq0idb-... (o producción)
NEXT_PUBLIC_SQUARE_LOCATION_ID=... (Location ID de Square)
```

### Square (Privadas - Backend)
```
SQUARE_ACCESS_TOKEN=sandbox-sq0atb-... (o producción)
SQUARE_LOCATION_ID=... (mismo que el público)
```

## 📋 Cómo obtener las credenciales de Square

1. **Application ID** (Público):
   - Square Developer Dashboard → Applications → Tu aplicación
   - Copiar "Application ID" (empieza con `sandbox-sq0idb-` en sandbox o `sq0idb-` en producción)

2. **Location ID** (Público):
   - Square Developer Dashboard → Locations
   - Copiar el "Location ID" de tu ubicación

3. **Access Token** (Privado - NUNCA exponer al cliente):
   - Square Developer Dashboard → Applications → Tu aplicación → Credentials
   - Copiar "Sandbox Access Token" (para pruebas) o "Production Access Token" (para producción)
   - **IMPORTANTE:** Este token solo va en variables de servidor (sin `NEXT_PUBLIC_`)

## 🧪 Modo Sandbox vs Producción

- **Sandbox**: Para pruebas, usa credenciales que empiezan con `sandbox-`
- **Producción**: Para pagos reales, usa credenciales sin el prefijo `sandbox-`

## 🔄 Flujo Completo

1. Usuario selecciona fecha/hora/invitados en Next.js
2. Click "Reserve & Pay"
3. Se muestra `CheckoutForm` con formulario de billing + Square payment form
4. Usuario completa datos y tarjeta
5. Click "Complete Payment"
6. Se tokeniza la tarjeta con Square (frontend)
7. Se envía el token al backend (`/api/booking/checkout`)
8. Backend procesa el pago con Square API
9. Si el pago es exitoso, se crea la orden en WooCommerce (marcada como pagada)
10. El webhook de WooCommerce procesa la orden y crea el booking en la DB

## ⚠️ Notas Importantes

- **Seguridad**: El `SQUARE_ACCESS_TOKEN` NUNCA debe estar en el frontend (no usar `NEXT_PUBLIC_`)
- **Testing**: Usa tarjetas de prueba de Square en modo sandbox: https://developer.squareup.com/docs/testing/test-values
- **Webhook**: El webhook de WooCommerce seguirá funcionando para crear bookings cuando la orden se marque como pagada

## 🐛 Troubleshooting

- **"Square payment is not configured"**: Verifica que `NEXT_PUBLIC_SQUARE_APPLICATION_ID` y `NEXT_PUBLIC_SQUARE_LOCATION_ID` estén en Vercel
- **"Square credentials not configured"**: Verifica que `SQUARE_ACCESS_TOKEN` y `SQUARE_LOCATION_ID` estén en Vercel (sin `NEXT_PUBLIC_`)
- **Payment fails**: Revisa los logs de Vercel para ver el error específico de Square API
