-- ============================================================
-- Seed Data para Sojo Boutique — Cloudflare D1
-- Ejecutar con: wrangler d1 execute soho-boutique-db --file=src/db/seed.sql
-- Para local:  wrangler d1 execute soho-boutique-db --local --file=src/db/seed.sql
-- ============================================================

-- NOTA: Las contraseñas de este seed usan el formato PBKDF2-SHA256 del nuevo backend (Hono).
-- Admin:  admin@sojaboutique.com / admin123
-- Client: maria@ejemplo.com / cliente123
-- Los hashes se generarán al hacer el primer registro. Por ahora insertamos placeholders
-- que NO funcionarán para login. Usar POST /api/v1/auth/register para crear usuarios reales.

-- Usuario Admin (será creado vía API con POST /register, pero insertamos para referencia)
-- INSERT INTO "user" (email, full_name, hashed_password, role, is_active) 
-- VALUES ('admin@sojaboutique.com', 'Admin Soho', 'PLACEHOLDER_GENERATE_VIA_REGISTER', 'admin', 1);

-- Categorías
INSERT OR IGNORE INTO category (id, name, slug, description) VALUES (1, 'Prendas', 'prendas', NULL);
INSERT OR IGNORE INTO category (id, name, slug, description) VALUES (2, 'Accesorios', 'accesorios', NULL);
INSERT OR IGNORE INTO category (id, name, slug, description) VALUES (3, 'Perfumes', 'perfumes', NULL);

-- Productos de ejemplo
INSERT OR IGNORE INTO product (id, name, description, price, stock, image_url, category_id) 
VALUES (1, 'Vestido Floral Primavera', 'Vestido ligero con estampado floral, ideal para la temporada.', 89.99, 10, '/placeholder.svg?height=400&width=300', 1);

INSERT OR IGNORE INTO product (id, name, description, price, stock, image_url, category_id) 
VALUES (2, 'Collar Perlas Elegance', 'Collar de perlas cultivadas con broche de plata.', 45.50, 5, '/placeholder.svg?height=400&width=300', 2);

INSERT OR IGNORE INTO product (id, name, description, price, stock, image_url, category_id) 
VALUES (3, 'Perfume Rosa Silvestre', 'Fragancia floral con notas de rosa y jazmín.', 75.00, 15, '/placeholder.svg?height=400&width=300', 3);

-- Configuración por defecto
INSERT OR IGNORE INTO settings (id, business_name, slogan, rif, phone, address, email, primary_color, accent_color, heading_font, body_font, logo_url)
VALUES (1, 'Sojo Boutique', 'Tu destino de moda exclusivo', 'J-00000000-0', '+58 000-0000000', 'Caracas, Venezuela', 'contacto@sojaboutique.com', '350 65% 65%', '15 75% 75%', 'Great Vibes', 'Mona Sans', '/images/logo.png');
