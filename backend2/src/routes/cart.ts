/**
 * Rutas del Carrito — /api/v1/cart
 *
 * Endpoints:
 *   GET    /              — Obtener carrito del usuario
 *   POST   /              — Agregar producto al carrito
 *   PUT    /:product_id   — Actualizar cantidad de un item
 *   DELETE /clear          — Vaciar carrito
 *   DELETE /:product_id   — Eliminar un item del carrito
 */

import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { eq, and } from "drizzle-orm";
import { createDb } from "../db/index";
import { cartItems, products } from "../db/schema";
import { requireAuth } from "../middleware/auth";
import type { Env, AppVariables } from "../types";

const cartRouter = new Hono<{
  Bindings: Env;
  Variables: AppVariables;
}>();

// Todas las rutas del carrito requieren autenticación
cartRouter.use("/*", requireAuth);

// ─── Helper: formatear item del carrito con datos del producto ───

async function formatCartItem(
  db: ReturnType<typeof createDb>,
  item: { id: number; user_id: number; product_id: number; quantity: number }
) {
  const product = await db.query.products.findFirst({
    where: eq(products.id, item.product_id),
  });
  if (!product) return null;

  return {
    id: item.id,
    user_id: item.user_id,
    product_id: item.product_id,
    quantity: item.quantity,
    name: product.name,
    price: product.price,
    image_url: product.image_url,
  };
}

// ─── GET / ──────────────────────────────────────────────

/**
 * Obtiene todos los items del carrito del usuario autenticado.
 * Incluye datos del producto (name, price, image_url).
 * Respuestas: 200 — Array de CartItemRead.
 */
cartRouter.get("/", async (c) => {
  const currentUser = c.get("currentUser")!;
  const db = createDb(c.env.DB);

  const items = await db
    .select()
    .from(cartItems)
    .where(eq(cartItems.user_id, currentUser.id));

  const result = [];
  for (const item of items) {
    const formatted = await formatCartItem(db, item);
    if (formatted) result.push(formatted);
  }

  return c.json(result);
});

// ─── POST / ─────────────────────────────────────────────

/**
 * Agregar un producto al carrito.
 * Si el producto ya existe en el carrito, incrementa la cantidad.
 * Body: { product_id, quantity }
 * Respuestas: 200 — CartItemRead.
 */
const cartItemCreateSchema = z.object({
  product_id: z.number().int(),
  quantity: z.number().int().min(1).default(1),
});

cartRouter.post("/", zValidator("json", cartItemCreateSchema), async (c) => {
  const { product_id, quantity } = c.req.valid("json");
  const currentUser = c.get("currentUser")!;
  const db = createDb(c.env.DB);

  // Verificar que el producto exista
  const product = await db.query.products.findFirst({
    where: eq(products.id, product_id),
  });
  if (!product) {
    return c.json({ detail: "Producto no encontrado" }, 404);
  }

  // Verificar si ya existe en el carrito
  const existingItem = await db.query.cartItems.findFirst({
    where: and(
      eq(cartItems.user_id, currentUser.id),
      eq(cartItems.product_id, product_id)
    ),
  });

  if (existingItem) {
    // Incrementar cantidad
    const newQuantity = existingItem.quantity + quantity;
    await db
      .update(cartItems)
      .set({ quantity: newQuantity })
      .where(eq(cartItems.id, existingItem.id));

    const updated = await db.query.cartItems.findFirst({
      where: eq(cartItems.id, existingItem.id),
    });
    const formatted = await formatCartItem(db, updated!);
    return c.json(formatted);
  }

  // Crear nuevo item
  const [newItem] = await db
    .insert(cartItems)
    .values({
      user_id: currentUser.id,
      product_id,
      quantity,
    })
    .returning();

  const formatted = await formatCartItem(db, newItem);
  return c.json(formatted);
});

// ─── PUT /:product_id ───────────────────────────────────

/**
 * Actualiza la cantidad de un item en el carrito.
 * Body: { quantity }
 * Respuestas: 200 — CartItemRead. 400/404 — Error.
 */
const cartItemUpdateSchema = z.object({
  quantity: z.number().int(),
});

cartRouter.put(
  "/:product_id",
  zValidator("json", cartItemUpdateSchema),
  async (c) => {
    const productId = Number(c.req.param("product_id"));
    const { quantity } = c.req.valid("json");
    const currentUser = c.get("currentUser")!;
    const db = createDb(c.env.DB);

    const item = await db.query.cartItems.findFirst({
      where: and(
        eq(cartItems.user_id, currentUser.id),
        eq(cartItems.product_id, productId)
      ),
    });

    if (!item) {
      return c.json(
        { detail: "Producto no encontrado en el carrito" },
        404
      );
    }

    if (quantity <= 0) {
      await db.delete(cartItems).where(eq(cartItems.id, item.id));
      return c.json(
        { detail: "Use DELETE para remover items" },
        400
      );
    }

    await db
      .update(cartItems)
      .set({ quantity })
      .where(eq(cartItems.id, item.id));

    const updated = await db.query.cartItems.findFirst({
      where: eq(cartItems.id, item.id),
    });
    const formatted = await formatCartItem(db, updated!);
    return c.json(formatted);
  }
);

// ─── DELETE /clear ──────────────────────────────────────

/**
 * Vacía completamente el carrito del usuario.
 * Respuestas: 204 — Sin contenido.
 */
cartRouter.delete("/clear", async (c) => {
  const currentUser = c.get("currentUser")!;
  const db = createDb(c.env.DB);

  await db
    .delete(cartItems)
    .where(eq(cartItems.user_id, currentUser.id));

  return c.body(null, 204);
});

// ─── DELETE /:product_id ────────────────────────────────

/**
 * Elimina un item específico del carrito.
 * Respuestas: 204 — Eliminado. 404 — No encontrado.
 */
cartRouter.delete("/:product_id", async (c) => {
  const productId = Number(c.req.param("product_id"));
  const currentUser = c.get("currentUser")!;
  const db = createDb(c.env.DB);

  const item = await db.query.cartItems.findFirst({
    where: and(
      eq(cartItems.user_id, currentUser.id),
      eq(cartItems.product_id, productId)
    ),
  });

  if (!item) {
    return c.json(
      { detail: "Producto no encontrado en el carrito" },
      404
    );
  }

  await db.delete(cartItems).where(eq(cartItems.id, item.id));
  return c.body(null, 204);
});

export default cartRouter;
