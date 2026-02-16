# Configuración de Variables de Entorno en Vercel

Para que el sistema de bookings funcione en producción, necesitás agregar las siguientes variables de entorno en Vercel.

## Pasos para agregar variables en Vercel:

1. Ve a tu proyecto en Vercel: https://vercel.com/dashboard
2. Selecciona el proyecto `stanlakepark-next`
3. Ve a **Settings** → **Environment Variables**
4. Agrega cada una de las siguientes variables:

## Variables Requeridas:

### WooCommerce (CRÍTICO para bookings)
```
WC_STORE_URL=https://stanlakepark.com
WC_CONSUMER_KEY=ck_42c0e62a24fe1bd05e894c5e2bee23deedbf0969
WC_CONSUMER_SECRET=cs_e351ecdf633aa30fedb793331056ec7d82857174
WC_WEBHOOK_SECRET=wc_webhook_secret_tra321
```

### Base de Datos (Postgres)
```
POSTGRES_URL=postgresql://neondb_owner:npg_kgfP6QXdRA9o@ep-crimson-frost-aby4diay-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require
```

### Square Payment Gateway
```
NEXT_PUBLIC_SQUARE_APPLICATION_ID=sandbox-sq0idb-4fUQKvSCEd3oIZMukpDfuA
NEXT_PUBLIC_SQUARE_LOCATION_ID=LGS307BB6CKGN
SQUARE_ACCESS_TOKEN=EAAAl_SDcY4hiqOBfizkdrwQ2yIlrfIw5HLAWfT-M5S70HPdpsnbOe0xGypk_TEt
```

### WordPress GraphQL
```
WORDPRESS_GRAPHQL_ENDPOINT=https://stanlakepark.com/graphql
```

## Importante:

- **Environment**: Seleccioná **Production**, **Preview**, y **Development** para todas las variables (o al menos Production y Preview)
- Después de agregar las variables, necesitás hacer un **redeploy** del proyecto
- Podés verificar que todo esté configurado correctamente visitando: `https://stanlakepark.vercel.app/debug/config`

## Verificación:

Una vez que agregues las variables y hagas redeploy, visitá:
- `/debug/config` - Para verificar que todas las variables estén configuradas
- `/debug/experiences` - Para verificar que WordPress GraphQL funcione
