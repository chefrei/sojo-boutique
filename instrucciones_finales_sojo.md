# Guía de Mantenimiento y Mejoras: Sojo Boutique

Esta guía detalla la arquitectura actual del proyecto y los pasos para automatizar el despliegue del backend y migrar las imágenes a la nube de Cloudflare (R2).

## 1. Arquitectura del Proyecto

| Componente | Plataforma | Método de Despliegue |
| :--- | :--- | :--- |
| **Frontend (Next.js)** | Cloudflare Pages | Automático (GitHub) |
| **Backend (Hono API)** | Cloudflare Workers | Manual (`npm run deploy`) |
| **Base de Datos** | Cloudflare D1 | Persistente en Cloudflare |
| **Almacenamiento** | Cloudflare R2 | Pendiente de configuración |

---

## 2. Despliegue Automático del Backend desde GitHub

Para que la carpeta `backend2` se despliegue sola cuando hagas un `git push`, sigue estos pasos:

### Paso A: Generar API Token en Cloudflare
1. Entra a tu panel de Cloudflare.
2. Ve a **My Profile** > **API Tokens**.
3. Haz clic en **Create Token** y usa la plantilla **Edit Cloudflare Workers**.
4. Copia el Token resultante (guárdalo en un lugar seguro).

### Paso B: Configurar Secreto en GitHub
1. Ve a tu repositorio en GitHub.
2. Navega a **Settings** > **Secrets and variables** > **Actions**.
3. Haz clic en **New repository secret**.
4. Nombre: `CLOUDFLARE_API_TOKEN`.
5. Valor: El token que copiaste en el Paso A.

### Paso C: Crear el archivo de Workflow
Crea un archivo en la ruta `.github/workflows/deploy-backend.yml` con el siguiente contenido:

```yaml
name: Deploy Backend (Hono)

on:
  push:
    branches:
      - main
    paths:
      - 'backend2/**' # Solo se activa si hay cambios en la carpeta backend2

jobs:
  deploy:
    runs-on: ubuntu-latest
    name: Deploy
    steps:
      - uses: actions/checkout@v4
      - name: Deploy
        uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          workingDirectory: 'backend2'
```

---

## 3. Migración de Imágenes a Cloudflare R2

Cuando tengas habilitado R2, estos son los pasos técnicos para dejar de usar `localhost`:

### Paso 1: Crear el Bucket
Desde tu terminal en la carpeta `backend2`:
```bash
npx wrangler r2 bucket create sojo-assets
```

### Paso 2: Vincular el Bucket en `wrangler.toml`
Añade estas líneas al archivo `backend2/wrangler.toml`:
```toml
[[r2_buckets]]
binding = "BUCKET" # Nombre que usaremos en el código (env.BUCKET)
bucket_name = "sojo-assets"
```

### Paso 3: Actualizar el código de Carga (Upload)
En `backend2/src/routes/upload.ts`, cambia el guardado en disco por:
```typescript
// Ejemplo simplificado:
const file = c.req.parseBody().file;
await c.env.BUCKET.put(`productos/${fileName}`, file);
const imageUrl = `https://tu-dominio-r2.com/productos/${fileName}`;
```

### Paso 4: Limpieza de Base de Datos (SQL)
Para actualizar las imágenes de los productos que ya están en la base de datos:
1. Entra a **Cloudflare** > **D1** > **sojo-boutique-db**.
2. Ejecuta la siguiente consulta en la consola SQL:
```sql
UPDATE product SET image_url = REPLACE(image_url, 'http://127.0.0.1:8000', 'https://tu-dominio-r2.com');
UPDATE settings SET logo_url = REPLACE(logo_url, 'http://127.0.0.1:8000', 'https://tu-dominio-r2.com') WHERE id = 1;
```

> [!TIP]
> **Dato Importante:** He dejado una utilidad en el frontend (`getCleanImageUrl`) que detecta automáticamente si una imagen apunta a `127.0.0.1` y la intentará cargar como una ruta relativa o mostrará un cuadro vacío elegante en lugar de un error de "imagen rota".

---
*Fin del documento de instrucciones.*
