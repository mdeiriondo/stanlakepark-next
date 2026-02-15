# Cómo guardar tus cambios y volver al estado “oficial”

## Opción recomendada: rama de resguardo (sin fork)

Tu remoto `origin` ya es tu repo (mdeiriondo/stanlakepark-next). No necesitas fork; solo usar otra rama.

### 1. Guardar todos los cambios en la rama actual y subirlos

```bash
# Añadir todo (incluye SNAPSHOT, wine-bar, api, lib, etc.)
git add -A

# Commit con mensaje claro
git commit -m "WIP: wine-bar, ecommerce/sanity stack, Ticket Tailor, SNAPSHOT 2025-02-07"

# Subir esta rama a GitHub (crea origin/feature/ecommerce-sanity-stack)
git push -u origin feature/ecommerce-sanity-stack
```

Con esto tus últimos cambios quedan guardados en GitHub en la rama `feature/ecommerce-sanity-stack`. No se pierde nada.

---

### 2. Volver a trabajar desde el estado “oficial” (main)

Si por “git oficial” te refieres a lo que está en `main` de tu repo:

```bash
# Cambiar a main
git checkout main

# Traer lo último del remoto (por si alguien más subió cambios)
git pull origin main
```

A partir de aquí estás en `main` limpia, igual que en GitHub. Puedes crear nuevas ramas para “otras pruebas”, por ejemplo:

```bash
git checkout -b experimentos/xxx
```

---

### 3. Cuando quieras retomar los cambios guardados

```bash
git checkout feature/ecommerce-sanity-stack
# o crear una rama nueva desde esa rama:
# git checkout -b mi-rama feature/ecommerce-sanity-stack
```

---

## Si “oficial” es otro repo (ej. un upstream)

Si el código “oficial” está en otro repo (ej. `https://github.com/otro-owner/stanlakepark-next`):

```bash
# Una sola vez: añadir el remoto “oficial”
git remote add upstream https://github.com/otro-owner/stanlakepark-next.git

# Guardar tus cambios (paso 1 de arriba: add, commit, push)
git add -A
git commit -m "WIP: resguardo antes de volver a upstream"
git push -u origin feature/ecommerce-sanity-stack

# Volver a main y dejarla igual que el repo oficial
git checkout main
git fetch upstream
git reset --hard upstream/main
git push origin main --force   # solo si quieres que tu GitHub también refleje exactamente upstream
```

---

## Resumen

| Objetivo | Comando |
|----------|--------|
| Guardar todo en una rama y subirla | `git add -A` → `git commit -m "..."` → `git push -u origin feature/ecommerce-sanity-stack` |
| Quedar en el estado “oficial” (main) | `git checkout main` → `git pull origin main` |
| Recuperar tus cambios luego | `git checkout feature/ecommerce-sanity-stack` |

No hace falta fork: tu repo ya es el remoto; solo usas una rama de resguardo y `main` para retomar el estado oficial.
