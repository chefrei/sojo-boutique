# Sojo Boutique API — Backend 2 (Hono + Cloudflare Workers)

Backend completo para el marketplace de Sojo Boutique, construido con **Hono** (framework web ultraligero) y diseñado para desplegarse en **Cloudflare Workers** con **D1** (base de datos SQLite distribuida) y **R2** (almacenamiento de objetos para imágenes).

## Stack Tecnológico

| Componente | Tecnología |
|---|---|
| Framework Web | [Hono](https://hono.dev/) v4 |
| Lenguaje | TypeScript (ESNext) |
| ORM | [Drizzle ORM](https://orm.drizzle.team/) (D1/SQLite) |
| Validación | [Zod](https://zod.dev/) + @hono/zod-validator |
| Base de Datos | Cloudflare D1 (SQLite distribuido) |
| Almacenamiento | Cloudflare R2 (S3-compatible) |
| Auth | JWT (HS256) con Web Crypto API |
| Hashing | PBKDF2-SHA256 con Web Crypto API |
| Deploy | Cloudflare Workers via Wrangler |

## Requisitos Previos

- [Node.js](https://nodejs.org/) v18+
- [npm](https://www.npmjs.com/) v9+
- Cuenta de [Cloudflare](https://cloudflare.com) con acceso a Workers, D1 y R2
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/) (incluido como devDependency)

## Instalación

```bash
cd backend2
npm install
```

## Configuración de Cloudflare

### 1. Autenticarse en Cloudflare
```bash
npx wrangler login
```

### 2. Base de datos D1
La base de datos `sojo-boutique-db` ya está configurada en `wrangler.toml`.

**Crear las tablas (migración):**
```bash
# En producción (D1 remoto)
npm run db:migrate

# En local (D1 local)
npm run db:migrate:local
```

**Insertar datos iniciales (seed):**
```bash
# En producción
npm run db:seed

# En local
npm run db:seed:local
```

### 3. Bucket R2
Crear el bucket para imágenes:
```bash
npx wrangler r2 bucket create sojo-boutique-images
```

### 4. Variables de entorno (Secrets)
Configurar el secret JWT para producción:
```bash
npx wrangler secret put JWT_SECRET
# Ingresa una clave segura cuando se te solicite
```

## Desarrollo Local

```bash
npm run dev
```

Esto inicia un servidor local en `http://localhost:8787` con una base D1 local y emulación de R2.

> **Nota:** La primera vez debes ejecutar las migraciones locales:
> ```bash
> npm run db:migrate:local
> npm run db:seed:local
> ```

## Despliegue a Producción

```bash
npm run deploy
```

## Crear Usuarios

Como los hashes de contraseña se generan en runtime, los usuarios se crean vía la API:

**Crear Admin:**
```bash
curl -X POST http://localhost:8787/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@sojaboutique.com","full_name":"Admin Sojo","password":"admin123"}'
```

> **Importante:** Después de registrar el admin, debes cambiar su rol manualmente en D1:
> ```bash
> npx wrangler d1 execute sojo-boutique-db --local --command="UPDATE user SET role='admin' WHERE email='admin@sojaboutique.com'"
> ```

**Crear Cliente:**
```bash
curl -X POST http://localhost:8787/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"maria@ejemplo.com","full_name":"María González","password":"cliente123"}'
```

## Endpoints de la API

### Autenticación — `/api/v1/auth`
| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| POST | `/register` | — | Registrar usuario |
| POST | `/login` | — | Login (retorna JWT) |
| GET | `/me` | Bearer | Datos del usuario actual |

### Productos — `/api/v1/products`
| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| GET | `/` | — | Listar productos (filtros: category_id, min_price, max_price) |
| GET | `/:id` | — | Detalle de producto |
| POST | `/` | Admin | Crear producto |
| PATCH | `/:id` | Admin | Actualizar producto |
| DELETE | `/:id` | Admin | Eliminar producto |
| GET | `/categories` | — | Listar categorías |
| POST | `/categories` | Admin | Crear categoría |

### Pedidos — `/api/v1/orders`
| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| POST | `/` | Bearer | Crear pedido |
| GET | `/me` | Bearer | Mis pedidos |
| GET | `/:id` | Bearer | Detalle de pedido |
| PUT | `/:id/cancel` | Bearer | Cancelar pedido |

### Administración — `/api/v1/admin`
| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| GET | `/dashboard` | Admin | Estadísticas del dashboard |
| POST | `/payments` | Admin | Registrar pago |
| GET | `/debtors` | Admin | Clientes con deuda |
| GET | `/orders` | Admin | Todos los pedidos (formato tabla) |
| PATCH | `/orders/:id` | Admin | Actualizar estado de pedido |

### Upload — `/api/v1/upload`
| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| POST | `/` | — | Subir imagen a R2 |

### Clientes — `/api/v1/customers`
| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| GET | `/` | Admin | Listar clientes |
| GET | `/:id` | Admin | Detalle de cliente |
| POST | `/` | Admin | Crear cliente |
| PATCH | `/:id` | Admin | Actualizar cliente |
| DELETE | `/:id` | Admin | Eliminar cliente |

### Carrito — `/api/v1/cart`
| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| GET | `/` | Bearer | Ver carrito |
| POST | `/` | Bearer | Agregar al carrito |
| PUT | `/:product_id` | Bearer | Actualizar cantidad |
| DELETE | `/clear` | Bearer | Vaciar carrito |
| DELETE | `/:product_id` | Bearer | Eliminar item |

### Configuración — `/api/v1/settings`
| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| GET | `/` | — | Obtener configuración |
| PATCH | `/` | Admin | Actualizar configuración |

### Reportes — `/api/v1/reports`
| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| GET | `/customers/:id/kardex` | Admin | Historial financiero del cliente |
| GET | `/finance/summary` | Admin | Resumen financiero por fechas |

## Ejemplos de Uso (curl)

**Login:**
```bash
curl -X POST http://localhost:8787/api/v1/auth/login \
  -d "username=admin@sojaboutique.com&password=admin123" \
  -H "Content-Type: application/x-www-form-urlencoded"
```

**Listar productos:**
```bash
curl http://localhost:8787/api/v1/products/
```

**Crear pedido:**
```bash
curl -X POST http://localhost:8787/api/v1/orders/ \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"items":[{"product_id":1,"quantity":2}]}'
```

## Mapa de Migración FastAPI → Hono

| FastAPI (Python) | Hono (TypeScript) |
|---|---|
| `SQLModel` + SQLite | `Drizzle ORM` + D1 |
| `passlib` PBKDF2 | Web Crypto API PBKDF2 |
| `python-jose` JWT | Web Crypto API HMAC-SHA256 |
| `Depends(get_session)` | `createDb(c.env.DB)` |
| `Depends(get_current_user)` | `authMiddleware` + `c.get("currentUser")` |
| `Depends(get_current_admin_user)` | `requireAdmin` middleware |
| `@router.get/post/...` | `app.get/post/...` |
| `response_model=...` | Zod schema validation |
| Static file serving | Cloudflare R2 |
| Uvicorn | Cloudflare Workers |

## Integración con el Frontend

Para que el frontend Next.js apunte a este backend, cambia la variable de entorno:

```env
# En .env.local del frontend
NEXT_PUBLIC_API_URL=http://localhost:8787/api/v1
```

Para producción, usa la URL del Worker desplegado:
```env
NEXT_PUBLIC_API_URL=https://sojo-boutique-api.<tu-subdomain>.workers.dev/api/v1
```
