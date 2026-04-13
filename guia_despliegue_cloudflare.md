# Guía de Despliegue: Soho Boutique en Cloudflare

Esta guía detalla los pasos para desplegar la plataforma completa (Frontend y Backend) utilizando los servicios de Cloudflare.

## 1. Subir el Código a GitHub
Antes de desplegar en Cloudflare, el código debe estar en un repositorio de GitHub para habilitar el despliegue continuo.

1. Crea un repositorio en GitHub (ej. `sojo-boutique`).
2. Agrega el origen remoto (si no lo tienes): `git remote add origin https://github.com/TU_USUARIO/sojo-boutique.git`
3. Sube los cambios:
   ```bash
   git add .
   git commit -m "feat: modulo de marca blanca y reportes financieros avanzados"
   git push origin main
   ```

## 2. Despliegue del Frontend (Cloudflare Pages)
Cloudflare Pages servirá tu aplicación Next.js de manera global.

1. Ve al panel de [Cloudflare Dashboard](https://dash.cloudflare.com/) > **Workers & Pages**.
2. Haz clic en **Create application** > **Pages** > **Connect to Git**.
3. Selecciona tu repositorio y la rama `main`.
4. **Configuración de compilación**:
   - **Framework preset**: `Next.js`
   - **Build command**: `pnpm run build` o `npm run build`
   - **Build output directory**: `.next`
5. **Variables de Entorno**: Agrega `NEXT_PUBLIC_API_URL` apuntando a la URL de tu Worker (ej: `https://sojo-boutique-backend.TU_SUBDOMINIO.workers.dev`).

## 3. Despliegue del Backend (Cloudflare Workers + D1)
El backend FastAPI se ejecutará en Workers y usará D1 como base de datos SQL.

### Paso A: Crear la Base de Datos D1
En tu terminal (dentro de la carpeta `backend`):
```bash
npx wrangler d1 create sojo-boutique-db
```
Copia el `database_id` resultante en tu archivo `wrangler.toml` bajo `[[d1_databases]]`.

### Paso B: Migrar Datos Locales a D1
Para no perder tus productos y configuraciones actuales:
1. Genera un volcado de tu base de datos local: `python dump_sqlite.py` (esto generará un archivo `.sql`).
2. Ejecuta el SQL en la base de datos de producción:
   ```bash
   npx wrangler d1 execute sojo-boutique-db --file=./seed.sql
   ```

### Paso C: Desplegar el Worker
```bash
npx wrangler deploy
```

## 4. Almacenamiento de Imágenes (Cloudflare R2)
Cuando consigas acceso a R2:

1. Crea un bucket: `npx wrangler r2 bucket create sojo-boutique-images`.
2. Agrega la vinculación en tu `wrangler.toml`:
   ```toml
   [[r2_buckets]]
   binding = 'R2_BUCKET'
   bucket_name = 'sojo-boutique-images'
   ```
3. El código que he preparado detectará automáticamente esta vinculación y empezará a subir imágenes al bucket en lugar del disco local.

---

> [!IMPORTANT]
> **CORS**: Asegúrate de que la URL de tu página de Cloudflare Pages esté permitida en la configuración de CORS de FastAPI (en `main.py`) para que la web pueda hablar con la API.

> [!WARNING]
> **Secretos**: No subas archivos `.env` a GitHub. Configura las variables sensibles (como `JWT_SECRET`) directamente en el panel de Cloudflare (Workers > Settings > Variables).
