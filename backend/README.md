# Soho Boutique Backend (FastAPI + Cloudflare Workers)

Este es el backend de alto rendimiento y **costo cero** para el marketplace Soho Boutique, diseñado para correr en el "Edge" con Cloudflare Workers.

## 🚀 Tecnologías
- **Framework:** FastAPI
- **Base de Datos:** SQLite (Local) / Cloudflare D1 (Producción)
- **ORM:** SQLModel (SQLAlchemy 2.0 + Pydantic v2)
- **Seguridad:** JWT (python-jose) + Bcrypt (passlib)
- **Contabilidad:** Control de deudas, abonos parciales y cuentas por cobrar.

## 🛠️ Configuración Local

1. **Instalar dependencias:**
   ```bash
   pip install -r requirements.txt
   ```

2. **Inicializar Base de Datos (Seed):**
   Este paso crea las tablas y carga datos de prueba (incluyendo un usuario admin).
   ```bash
   python seed.py
   ```

3. **Ejecutar servidor de desarrollo:**
   ```bash
   uvicorn main:app --reload
   ```
   La API estará disponible en `http://127.0.0.1:8000`.
   Puedes ver la documentación interactiva en `http://127.0.0.1:8000/docs`.

## 🔒 Credenciales de Prueba (Default)
- **Admin:** `admin@sojaboutique.com` / `admin123`
- **Cliente con Deuda:** `maria@ejemplo.com` / `cliente123` (Debe $100 de un pedido de $150).

## 📊 Endpoints Administrativos Destacados
- `GET /api/v1/admin/dashboard`: Resumen de ventas totales vs cobros reales.
- `GET /api/v1/admin/debtors`: Lista de clientes que tienen saldos pendientes.
- `POST /api/v1/admin/payments`: Registrar un nuevo abono de un cliente.
- `GET /api/v1/admin/orders`: Listado global de todos los pedidos realizados.
- `PATCH /api/v1/admin/orders/{id}`: Gestionar estado de envío y pago de un pedido.

## 🛒 Endpoints del Marketplace (Cliente)
- `POST /api/v1/orders/`: Crear un pedido nuevo (descuenta stock automáticamente).
- `GET /api/v1/orders/me`: Ver historial de compras personales.

1. **Crear base de datos D1:**
   ```bash
   npx wrangler d1 create sojo-boutique-db
   ```
   *Copia el `database_id` resultante en tu `wrangler.toml`.*

2. **Ejecutar migraciones en D1:**
   ```bash
   npx wrangler d1 execute sojo-boutique-db --file=./backend_database.db
   ```
   *(O usa un script de SQL generado a partir de SQLModel)*

3. **Desplegar Worker:**
   ```bash
   npx wrangler deploy
   ```

## 📂 Estructura del Proyecto
- `app/api/`: Controladores de la API (v1).
- `app/core/`: Configuración global y seguridad.
- `app/models/`: Definición de tablas de la base de datos.
- `app/schemas/`: Validaciones de entrada y salida (Pydantic).
- `seed.py`: Script para poblar la base de datos local.
