/**
 * Esquema de base de datos para Cloudflare D1 con Drizzle ORM.
 * Replica exactamente las 9 tablas del backend FastAPI/SQLModel original.
 */

import {
  sqliteTable,
  text,
  integer,
  real,
  index,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";

// ──────────────────────────────────────────────
// USERS
// ──────────────────────────────────────────────

export const users = sqliteTable(
  "user",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    email: text("email").notNull(),
    full_name: text("full_name").notNull(),
    hashed_password: text("hashed_password").notNull(),
    role: text("role", { enum: ["admin", "client"] })
      .notNull()
      .default("client"),
    is_active: integer("is_active", { mode: "boolean" })
      .notNull()
      .default(true),
  },
  (table) => [
    uniqueIndex("ix_user_email").on(table.email),
    index("ix_user_full_name").on(table.full_name),
  ]
);

export const usersRelations = relations(users, ({ many, one }) => ({
  orders: many(orders),
  payments: many(payments),
  customerProfile: one(customerProfiles, {
    fields: [users.id],
    references: [customerProfiles.user_id],
  }),
  cartItems: many(cartItems),
}));

// ──────────────────────────────────────────────
// CATEGORIES
// ──────────────────────────────────────────────

export const categories = sqliteTable(
  "category",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    description: text("description"),
  },
  (table) => [
    uniqueIndex("ix_category_name").on(table.name),
    uniqueIndex("ix_category_slug").on(table.slug),
  ]
);

export const categoriesRelations = relations(categories, ({ many }) => ({
  products: many(products),
}));

// ──────────────────────────────────────────────
// PRODUCTS
// ──────────────────────────────────────────────

export const products = sqliteTable(
  "product",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    name: text("name").notNull(),
    description: text("description").notNull(),
    price: real("price").notNull().default(0),
    stock: integer("stock").notNull().default(0),
    image_url: text("image_url"),
    sku: text("sku"),
    category_id: integer("category_id")
      .notNull()
      .references(() => categories.id),
  },
  (table) => [index("ix_product_name").on(table.name)]
);

export const productsRelations = relations(products, ({ one, many }) => ({
  category: one(categories, {
    fields: [products.category_id],
    references: [categories.id],
  }),
  orderItems: many(orderItems),
}));

// ──────────────────────────────────────────────
// ORDERS
// ──────────────────────────────────────────────

export const orders = sqliteTable("order", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  user_id: integer("user_id")
    .notNull()
    .references(() => users.id),
  total_price: real("total_price").notNull().default(0),
  amount_paid: real("amount_paid").notNull().default(0),
  status: text("status", {
    enum: ["pending", "paid", "shipped", "delivered", "cancelled"],
  })
    .notNull()
    .default("pending"),
  payment_status: text("payment_status", {
    enum: ["pending", "partial", "paid", "refunded"],
  })
    .notNull()
    .default("pending"),
  created_at: text("created_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
  delivered_at: text("delivered_at"),
  reference: text("reference"),
});

export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(users, {
    fields: [orders.user_id],
    references: [users.id],
  }),
  items: many(orderItems),
  payments: many(payments),
}));

// ──────────────────────────────────────────────
// ORDER ITEMS
// ──────────────────────────────────────────────

export const orderItems = sqliteTable("orderitem", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  order_id: integer("order_id")
    .notNull()
    .references(() => orders.id),
  product_id: integer("product_id")
    .notNull()
    .references(() => products.id),
  quantity: integer("quantity").notNull().default(1),
  unit_price: real("unit_price").notNull(),
});

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.order_id],
    references: [orders.id],
  }),
  product: one(products, {
    fields: [orderItems.product_id],
    references: [products.id],
  }),
}));

// ──────────────────────────────────────────────
// PAYMENTS
// ──────────────────────────────────────────────

export const payments = sqliteTable(
  "payment",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    user_id: integer("user_id")
      .notNull()
      .references(() => users.id),
    order_id: integer("order_id").references(() => orders.id),
    amount: real("amount").notNull(),
    method: text("method").notNull(),
    notes: text("notes"),
    created_at: text("created_at")
      .notNull()
      .$defaultFn(() => new Date().toISOString()),
    reference: text("reference"),
  },
  (table) => [index("ix_payment_method").on(table.method)]
);

export const paymentsRelations = relations(payments, ({ one }) => ({
  user: one(users, {
    fields: [payments.user_id],
    references: [users.id],
  }),
  order: one(orders, {
    fields: [payments.order_id],
    references: [orders.id],
  }),
}));

// ──────────────────────────────────────────────
// CUSTOMER PROFILES
// ──────────────────────────────────────────────

export const customerProfiles = sqliteTable("customerprofile", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  user_id: integer("user_id")
    .notNull()
    .unique()
    .references(() => users.id),
  phone: text("phone"),
  birthdate: text("birthdate"),
  address: text("address"),
  city: text("city"),
  state: text("state"),
  postal_code: text("postal_code"),
  notes: text("notes"),
  identification_type: text("identification_type"),
  identification_number: text("identification_number"),
  customer_id: text("customer_id"),
});

export const customerProfilesRelations = relations(
  customerProfiles,
  ({ one }) => ({
    user: one(users, {
      fields: [customerProfiles.user_id],
      references: [users.id],
    }),
  })
);

// ──────────────────────────────────────────────
// CART ITEMS
// ──────────────────────────────────────────────

export const cartItems = sqliteTable("cartitem", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  user_id: integer("user_id")
    .notNull()
    .references(() => users.id),
  product_id: integer("product_id")
    .notNull()
    .references(() => products.id),
  quantity: integer("quantity").notNull().default(1),
});

export const cartItemsRelations = relations(cartItems, ({ one }) => ({
  user: one(users, {
    fields: [cartItems.user_id],
    references: [users.id],
  }),
  product: one(products, {
    fields: [cartItems.product_id],
    references: [products.id],
  }),
}));

// ──────────────────────────────────────────────
// SETTINGS
// ──────────────────────────────────────────────

export const settings = sqliteTable("settings", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  business_name: text("business_name").notNull().default("Soho Boutique"),
  slogan: text("slogan").default("Tu destino de moda exclusivo"),
  rif: text("rif").default("J-00000000-0"),
  phone: text("phone").default("+58 000-0000000"),
  address: text("address").default("Caracas, Venezuela"),
  email: text("email").default("contacto@sohoboutique.com"),
  primary_color: text("primary_color").notNull().default("350 65% 65%"),
  accent_color: text("accent_color").notNull().default("15 75% 75%"),
  heading_font: text("heading_font").notNull().default("Great Vibes"),
  body_font: text("body_font").notNull().default("Mona Sans"),
  logo_url: text("logo_url").default("/images/logo.png"),
});

// ──────────────────────────────────────────────
// WISHLIST ITEMS
// ──────────────────────────────────────────────

export const wishlistItems = sqliteTable("wishlistitem", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  user_id: integer("user_id")
    .notNull()
    .references(() => users.id),
  product_id: integer("product_id")
    .notNull()
    .references(() => products.id),
  created_at: text("created_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
}, (table) => [
  uniqueIndex("ix_wishlist_user_product").on(table.user_id, table.product_id)
]);

export const wishlistItemsRelations = relations(wishlistItems, ({ one }) => ({
  user: one(users, {
    fields: [wishlistItems.user_id],
    references: [users.id],
  }),
  product: one(products, {
    fields: [wishlistItems.product_id],
    references: [products.id],
  }),
}));
