/**
 * Rutas de Favoritos (Wishlist) — /api/v1/wishlist
 *
 * Endpoints:
 *   GET    /                — Obtener IDs de productos en la wishlist del usuario
 *   POST   /toggle/:id      — Agregar/Quitar un producto de la wishlist
 */

import { Hono } from "hono";
import { eq, and } from "drizzle-orm";
import { createDb } from "../db/index";
import { wishlistItems, products } from "../db/schema";
import { requireAuth } from "../middleware/auth";
import type { Env, AppVariables } from "../types";

const wishlistRouter = new Hono<{
  Bindings: Env;
  Variables: AppVariables;
}>();

// Todas las rutas requieren autenticación
wishlistRouter.use("/*", requireAuth);

// ─── GET / ──────────────────────────────────────────────

/**
 * Obtener todos los product_id en la wishlist del usuario autenticado.
 * Retorna un arreglo de IDs: [1, 2, 5]
 */
wishlistRouter.get("/", async (c) => {
  const currentUser = c.get("currentUser")!;
  const db = createDb(c.env.DB);

  const items = await db.query.wishlistItems.findMany({
    where: eq(wishlistItems.user_id, currentUser.id),
    columns: {
      product_id: true,
    },
  });

  const ids = items.map((item) => item.product_id);
  return c.json(ids);
});

// ─── POST /toggle/:id ───────────────────────────────────

/**
 * Agrega o elimina un producto de la wishlist del usuario.
 * Si ya existe, lo quita. Si no existe, lo agrega.
 */
wishlistRouter.post("/toggle/:id", async (c) => {
  const productId = Number(c.req.param("id"));
  const currentUser = c.get("currentUser")!;
  const db = createDb(c.env.DB);

  // Verificar que el producto exista
  const product = await db.query.products.findFirst({
    where: eq(products.id, productId),
  });

  if (!product) {
    return c.json({ detail: "Producto no encontrado" }, 404);
  }

  // Verificar si ya está en la wishlist
  const existing = await db.query.wishlistItems.findFirst({
    where: and(
      eq(wishlistItems.user_id, currentUser.id),
      eq(wishlistItems.product_id, productId)
    ),
  });

  if (existing) {
    // Eliminarlo
    await db.delete(wishlistItems).where(eq(wishlistItems.id, existing.id));
    return c.json({ status: "removed", product_id: productId });
  } else {
    // Agregarlo
    await db.insert(wishlistItems).values({
      user_id: currentUser.id,
      product_id: productId,
    });
    return c.json({ status: "added", product_id: productId }, 201);
  }
});

export default wishlistRouter;
