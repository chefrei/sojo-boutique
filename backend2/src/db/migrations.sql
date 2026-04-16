-- ============================================================
-- Migraciones para Cloudflare D1 — Soho Boutique
-- Ejecutar con: wrangler d1 execute soho-boutique-db --file=src/db/migrations.sql
-- Para local:  wrangler d1 execute soho-boutique-db --local --file=src/db/migrations.sql
-- ============================================================

-- Tabla de usuarios
CREATE TABLE IF NOT EXISTS "user" (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  hashed_password TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'client' CHECK(role IN ('admin', 'client')),
  is_active INTEGER NOT NULL DEFAULT 1
);
CREATE UNIQUE INDEX IF NOT EXISTS ix_user_email ON "user" (email);
CREATE INDEX IF NOT EXISTS ix_user_full_name ON "user" (full_name);

-- Tabla de categorías
CREATE TABLE IF NOT EXISTS category (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT
);
CREATE UNIQUE INDEX IF NOT EXISTS ix_category_name ON category (name);
CREATE UNIQUE INDEX IF NOT EXISTS ix_category_slug ON category (slug);

-- Tabla de productos
CREATE TABLE IF NOT EXISTS product (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  price REAL NOT NULL DEFAULT 0,
  stock INTEGER NOT NULL DEFAULT 0,
  image_url TEXT,
  sku TEXT,
  category_id INTEGER NOT NULL REFERENCES category(id)
);
CREATE INDEX IF NOT EXISTS ix_product_name ON product (name);

-- Tabla de pedidos
CREATE TABLE IF NOT EXISTS "order" (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES "user"(id),
  total_price REAL NOT NULL DEFAULT 0,
  amount_paid REAL NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'paid', 'shipped', 'delivered', 'cancelled')),
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK(payment_status IN ('pending', 'partial', 'paid', 'refunded')),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  reference TEXT
);

-- Tabla de items de pedido
CREATE TABLE IF NOT EXISTS orderitem (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id INTEGER NOT NULL REFERENCES "order"(id),
  product_id INTEGER NOT NULL REFERENCES product(id),
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price REAL NOT NULL
);

-- Tabla de pagos
CREATE TABLE IF NOT EXISTS payment (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES "user"(id),
  order_id INTEGER REFERENCES "order"(id),
  amount REAL NOT NULL,
  method TEXT NOT NULL,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  reference TEXT
);
CREATE INDEX IF NOT EXISTS ix_payment_method ON payment (method);

-- Tabla de perfiles de cliente
CREATE TABLE IF NOT EXISTS customerprofile (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL UNIQUE REFERENCES "user"(id),
  phone TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  postal_code TEXT,
  notes TEXT,
  identification_type TEXT,
  identification_number TEXT,
  customer_id TEXT
);

-- Tabla de carrito
CREATE TABLE IF NOT EXISTS cartitem (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES "user"(id),
  product_id INTEGER NOT NULL REFERENCES product(id),
  quantity INTEGER NOT NULL DEFAULT 1
);

-- Tabla de configuración
CREATE TABLE IF NOT EXISTS settings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  business_name TEXT NOT NULL DEFAULT 'Sojo Boutique',
  slogan TEXT DEFAULT 'Tu destino de moda exclusivo',
  rif TEXT DEFAULT 'J-00000000-0',
  phone TEXT DEFAULT '+58 000-0000000',
  address TEXT DEFAULT 'Caracas, Venezuela',
  email TEXT DEFAULT 'contacto@sojaboutique.com',
  primary_color TEXT NOT NULL DEFAULT '350 65% 65%',
  accent_color TEXT NOT NULL DEFAULT '15 75% 75%',
  heading_font TEXT NOT NULL DEFAULT 'Great Vibes',
  body_font TEXT NOT NULL DEFAULT 'Mona Sans',
  logo_url TEXT DEFAULT '/images/logo.png'
);
