# WordPress: experiencias y CPTs (alineado al theme headless)

La app consume la **REST API** de WordPress. La estructura de CPTs y CORS viene de **`stanlake-headless-theme-functions.php`**; el código en `lib/wordpress.ts` está adaptado a ese setup.

## CPTs definidos en el theme

| CPT (registro)   | rest_base      | Uso en Next                    |
|------------------|----------------|---------------------------------|
| `experience_info` | `experience_info` | Hub Experiencias, `/experiences` |
| `wine`           | `wines`        | (futuro)                        |
| `venue`          | `venues`       | (futuro)                        |
| `accommodation`  | `accommodation`| (futuro)                        |

En código se usan las constantes `WP_REST_CPTS` en `lib/wordpress.ts` para no hardcodear slugs.

## URL en `.env.local`

Base del REST API (wp/v2):

```env
WORDPRESS_API_URL=http://stanlake-park.local/wp-json/wp/v2
```

Para producción, la misma variable con la URL del WP en vivo.

## Experiences: ACF actual (experience_info)

Según **CPT-experiences.json** / field group "Experience Info Details", los campos ACF para `experience_info` son:

- **badge** (text)
- **price** (text, ej. "£22.00")
- **duration** (text)
- **availability** (text)

En el theme hay que tener **"Show in REST API"** activado en ese field group para que aparezcan en `acf` en la respuesta.

### Campos opcionales para el futuro

Si añadís en ACF (y los exponés en REST):

- **experience_type** – valor entre: `wine_tour_tasting`, `wine_cheese_tour`, `wine_cream_tea`, `wine_cheese_tasting`, `work_vineyard`, `special_tastings`, `special_events`, `wset_courses`. Sirve para las pestañas del hub (Tours / Seasonal / Lifestyle). Si no existe, todo se muestra en Tours.
- **short_description** – descripción corta (si no, se usa el excerpt del post).
- **whats_included** – repeater con `item` o string, para "What's included".

## CORS

El theme aplica CORS en `rest_api_init` para:

- `http://localhost:3000`, `http://localhost:3001`
- `https://stanlake-park.vercel.app`
- `https://stanlakepark.com`

Si usás otro origen (ej. otro dominio en producción), hay que añadirlo en `stanlake_cors_headers()` en el PHP.

## Probar

Listado de experiencias:

```
GET http://stanlake-park.local/wp-json/wp/v2/experience_info?_embed
```

Una por slug:

```
GET http://stanlake-park.local/wp-json/wp/v2/experience_info?slug=mi-experiencia&_embed
```

Reiniciar `npm run dev` después de cambiar `.env.local`.
