PRAGMA foreign_keys = OFF;
DROP TABLE IF EXISTS "user";
CREATE TABLE user (
	id INTEGER NOT NULL, 
	email VARCHAR NOT NULL, 
	full_name VARCHAR NOT NULL, 
	hashed_password VARCHAR NOT NULL, 
	role VARCHAR(6) NOT NULL, 
	is_active BOOLEAN NOT NULL, 
	PRIMARY KEY (id)
);
DROP TABLE IF EXISTS "category";
CREATE TABLE category (
	id INTEGER NOT NULL, 
	name VARCHAR NOT NULL, 
	slug VARCHAR NOT NULL, 
	description VARCHAR, 
	PRIMARY KEY (id)
);
DROP TABLE IF EXISTS "product";
CREATE TABLE product (
	id INTEGER NOT NULL, 
	name VARCHAR NOT NULL, 
	description VARCHAR NOT NULL, 
	price NUMERIC NOT NULL, 
	stock INTEGER NOT NULL, 
	image_url VARCHAR, 
	category_id INTEGER NOT NULL, 
	PRIMARY KEY (id), 
	FOREIGN KEY(category_id) REFERENCES category (id)
);
DROP TABLE IF EXISTS "order";
CREATE TABLE "order" (
	id INTEGER NOT NULL, 
	user_id INTEGER NOT NULL, 
	total_price NUMERIC NOT NULL, 
	amount_paid NUMERIC NOT NULL, 
	status VARCHAR(9) NOT NULL, 
	payment_status VARCHAR(8) NOT NULL, 
	created_at DATETIME NOT NULL, 
	PRIMARY KEY (id), 
	FOREIGN KEY(user_id) REFERENCES user (id)
);
DROP TABLE IF EXISTS "orderitem";
CREATE TABLE orderitem (
	id INTEGER NOT NULL, 
	order_id INTEGER NOT NULL, 
	product_id INTEGER NOT NULL, 
	quantity INTEGER NOT NULL, 
	unit_price NUMERIC NOT NULL, 
	PRIMARY KEY (id), 
	FOREIGN KEY(order_id) REFERENCES "order" (id), 
	FOREIGN KEY(product_id) REFERENCES product (id)
);
DROP TABLE IF EXISTS "payment";
CREATE TABLE payment (
	id INTEGER NOT NULL, 
	user_id INTEGER NOT NULL, 
	order_id INTEGER, 
	amount NUMERIC NOT NULL, 
	method VARCHAR NOT NULL, 
	notes VARCHAR, 
	created_at DATETIME NOT NULL, 
	PRIMARY KEY (id), 
	FOREIGN KEY(user_id) REFERENCES user (id), 
	FOREIGN KEY(order_id) REFERENCES "order" (id)
);
INSERT INTO "user" ("id", "email", "full_name", "hashed_password", "role", "is_active") VALUES (1, 'admin@sojaboutique.com', 'Admin Soho', '$pbkdf2-sha256$29000$IoSQ0roXYizFeE8phfDemw$.QHSDRYr2NmgpqnrWdVbQcEl3R5KGydveWbUdYfzhrY', 'ADMIN', 1);
INSERT INTO "user" ("id", "email", "full_name", "hashed_password", "role", "is_active") VALUES (2, 'maria@ejemplo.com', 'María González', '$pbkdf2-sha256$29000$/997j1FKybkXghAixPgfYw$uUxYWw8tVwcFZ2lQTEWVPadiqq2XcjFq5v5E26ZbrNk', 'CLIENT', 1);
INSERT INTO "category" ("id", "name", "slug", "description") VALUES (1, 'Prendas', 'prendas', NULL);
INSERT INTO "category" ("id", "name", "slug", "description") VALUES (2, 'Accesorios', 'accesorios', NULL);
INSERT INTO "category" ("id", "name", "slug", "description") VALUES (3, 'Perfumes', 'perfumes', NULL);
INSERT INTO "product" ("id", "name", "description", "price", "stock", "image_url", "category_id") VALUES (1, 'Vestido Floral Primavera', 'Vestido ligero con estampado floral, ideal para la temporada.', 89.99, 10, '/placeholder.svg?height=400&width=300', 1);
INSERT INTO "product" ("id", "name", "description", "price", "stock", "image_url", "category_id") VALUES (2, 'Collar Perlas Elegance', 'Collar de perlas cultivadas con broche de plata.', 45.5, 5, '/placeholder.svg?height=400&width=300', 2);
INSERT INTO "product" ("id", "name", "description", "price", "stock", "image_url", "category_id") VALUES (3, 'Perfume Rosa Silvestre', 'Fragancia floral con notas de rosa y jazmín.', 75, 15, '/placeholder.svg?height=400&width=300', 3);
INSERT INTO "order" ("id", "user_id", "total_price", "amount_paid", "status", "payment_status", "created_at") VALUES (1, 2, 150, 50, 'PENDING', 'PARTIAL', '2026-04-06 14:43:47.436395');
INSERT INTO "payment" ("id", "user_id", "order_id", "amount", "method", "notes", "created_at") VALUES (1, 2, 1, 50, 'Zelle', 'Abono inicial', '2026-04-06 14:43:47.451721');
CREATE INDEX ix_user_full_name ON user (full_name);
CREATE UNIQUE INDEX ix_user_email ON user (email);
CREATE UNIQUE INDEX ix_category_slug ON category (slug);
CREATE UNIQUE INDEX ix_category_name ON category (name);
CREATE INDEX ix_product_name ON product (name);
CREATE INDEX ix_payment_method ON payment (method);
PRAGMA foreign_keys = ON;
