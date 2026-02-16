# Verificación del Sistema de Bookings

## Cómo verificar que un booking se procesó correctamente

### 1. Verificar en WooCommerce

1. Ve a tu WordPress admin: `https://stanlakepark.com/wp-admin`
2. Ve a **WooCommerce** → **Orders**
3. Busca la orden más reciente
4. Verifica:
   - ✅ Estado: **Completed** o **Processing**
   - ✅ Método de pago: **Square**
   - ✅ Estado de pago: **Paid** (debería tener un checkmark verde)
   - ✅ Transaction ID: Debería tener un ID de Square
   - ✅ Meta datos: Debería tener `_booking_slot_id` y `_square_payment_id`

### 2. Verificar en la Base de Datos

Puedes verificar que el booking se creó en la tabla `bookings`:

```sql
SELECT * FROM bookings ORDER BY created_at DESC LIMIT 5;
```

Deberías ver:
- `slot_id`: El ID del slot reservado
- `woocommerce_order_id`: El ID de la orden en WooCommerce
- `square_payment_id`: El ID del pago en Square
- `guest_count`: Número de huéspedes
- `total_amount`: Monto total pagado
- `status`: Estado del booking (probablemente 'confirmed')

### 3. Verificar en Square Dashboard

1. Ve a: https://squareup.com/dashboard
2. Ve a **Payments** → **Transactions**
3. Busca el pago más reciente
4. Verifica:
   - ✅ Estado: **Completed**
   - ✅ Monto: Coincide con el booking
   - ✅ Location: "Online Sales" (LGS307BB6CKGN)

### 4. Verificar el Webhook

El webhook de WooCommerce debería haber creado automáticamente el registro en la tabla `bookings` cuando la orden cambió a "completed" o "processing".

Para verificar que el webhook está funcionando:
1. Ve a WooCommerce → Settings → Advanced → Webhooks
2. Verifica que el webhook esté activo
3. Revisa los logs del webhook (si están disponibles)
4. O revisa los logs de Vercel en `/api/webhooks/woocommerce`

## Flujo Completo del Sistema

1. **Usuario selecciona slot y huéspedes** → Se muestra el precio total
2. **Usuario hace click en "Reserve & Pay"** → Se crea un producto temporal en WooCommerce
3. **Usuario completa el checkout** → Se procesa el pago con Square
4. **Pago exitoso** → Se crea una orden en WooCommerce marcada como pagada
5. **WooCommerce webhook** → Detecta la orden completada y crea el registro en `bookings`
6. **Usuario ve confirmación** → Página de confirmación con todos los detalles

## Troubleshooting

### Si el booking no aparece en la base de datos:

1. Verifica que el webhook esté configurado correctamente
2. Verifica que `WC_WEBHOOK_SECRET` coincida en WooCommerce y Vercel
3. Revisa los logs de Vercel para errores del webhook
4. Verifica que la orden en WooCommerce tenga el estado correcto

### Si el pago falla:

1. Verifica que `SQUARE_ACCESS_TOKEN` esté configurado en Vercel
2. Verifica que `SQUARE_LOCATION_ID` esté configurado en Vercel
3. Verifica que estés usando la URL correcta (sandbox vs producción)
4. Revisa los logs de Vercel para el error específico de Square

### Si la orden no se crea en WooCommerce:

1. Verifica que `WC_STORE_URL`, `WC_CONSUMER_KEY`, y `WC_CONSUMER_SECRET` estén configurados
2. Verifica que las credenciales tengan permisos de escritura
3. Revisa los logs de Vercel para errores de la API de WooCommerce
