/**
 * Rutas de Productos y Categorías — /api/v1/products
 *
 * Endpoints:
 *   GET    /categories        — Listar categorías
 *   POST   /categories        — Crear categoría (admin)
 *   GET    /                  — Listar productos con filtros opcionales
 *   GET    /:id               — Obtener producto por ID
 *   POST   /                  — Crear producto (admin)
 *   PATCH  /:id               — Actualizar producto parcial (admin)
 *   DELETE /:id               — Eliminar producto (admin)
 */

import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { eq, and, gte, lte } from "drizzle-orm";
import { createDb } from "../db/index";
import { products, categories } from "../db/schema";
import { requireAdmin } from "../middleware/auth";
import type { Env, AppVariables } from "../types";

const productsRouter = new Hono<{
  Bindings: Env;
  Variables: AppVariables;
}>();

// ─── CATEGORÍAS ─────────────────────────────────────────

/**
 * GET /categories
 * Obtiene la lista de categorías disponibles.
 * Respuestas: 200 — Array de categorías.
 */
productsRouter.get("/categories", async (c) => {
  const offset = Number(c.req.query("offset") || 0);
  const limit = Math.min(Number(c.req.query("limit") || 100), 100);

  const db = createDb(c.env.DB);
  const result = await db
    .select()
    .from(categories)
    .offset(offset)
    .limit(limit);

  return c.json(result);
});

/**
 * POST /categories
 * Crea una nueva categoría. Requiere rol admin.
 * Body: { name, slug, description? }
 * Respuestas: 201 — Categoría creada. 400 — Slug duplicado.
 */
const categoryCreateSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().nullable().optional(),
});

productsRouter.post(
  "/categories",
  requireAdmin,
  zValidator("json", categoryCreateSchema),
  async (c) => {
    const data = c.req.valid("json");
    const db = createDb(c.env.DB);

    // Verificar si el slug ya existe
    const existing = await db.query.categories.findFirst({
      where: eq(categories.slug, data.slug),
    });
    if (existing) {
      return c.json({ detail: "El slug de la categoría ya existe." }, 400);
    }

    const result = await db
      .insert(categories)
      .values({
        name: data.name,
        slug: data.slug,
        description: data.description ?? null,
      })
      .returning();

    return c.json(result[0], 201);
  }
);

// ─── PRODUCTOS ──────────────────────────────────────────

/**
 * GET /
 * Lista todos los productos disponibles con filtros opcionales.
 * Query params: offset, limit, category_id, min_price, max_price
 * Respuestas: 200 — Array de productos con su categoría.
 */
productsRouter.get("/", async (c) => {
  const offset = Number(c.req.query("offset") || 0);
  const limit = Math.min(Number(c.req.query("limit") || 100), 100);
  const categoryId = c.req.query("category_id");
  const minPrice = c.req.query("min_price");
  const maxPrice = c.req.query("max_price");

  const db = createDb(c.env.DB);

  // Construir condiciones de filtro
  const conditions = [];
  if (categoryId) {
    conditions.push(eq(products.category_id, Number(categoryId)));
  }
  if (minPrice) {
    conditions.push(gte(products.price, Number(minPrice)));
  }
  if (maxPrice) {
    conditions.push(lte(products.price, Number(maxPrice)));
  }

  const result = await db.query.products.findMany({
    where: conditions.length > 0 ? and(...conditions) : undefined,
    with: { category: true },
    offset,
    limit,
  });

  return c.json(result);
});

/**
 * GET /:id
 * Obtiene un producto por su ID.
 * Respuestas: 200 — Producto. 404 — No encontrado.
 */
productsRouter.get("/:id", async (c) => {
  const id = Number(c.req.param("id"));
  const db = createDb(c.env.DB);

  const product = await db.query.products.findFirst({
    where: eq(products.id, id),
    with: { category: true },
  });

  if (!product) {
    return c.json({ detail: "Producto no encontrado" }, 404);
  }

  return c.json(product);
});

/**
 * POST /
 * Crea un nuevo producto. Requiere rol admin.
 * Body: { name, description, price, stock, image_url?, category_id }
 * Respuestas: 201 — Producto creado.
 */
const productCreateSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  price: z.number().min(0),
  stock: z.number().int().min(0),
  image_url: z.string().nullable().optional(),
  category_id: z.number().int(),
});

productsRouter.post(
  "/",
  requireAdmin,
  zValidator("json", productCreateSchema),
  async (c) => {
    const data = c.req.valid("json");
    const db = createDb(c.env.DB);

    const result = await db
      .insert(products)
      .values({
        name: data.name,
        description: data.description,
        price: data.price,
        stock: data.stock,
        image_url: data.image_url ?? null,
        category_id: data.category_id,
      })
      .returning();

    return c.json(result[0], 201);
  }
);

/**
 * PATCH /:id
 * Actualiza un producto parcialmente. Requiere rol admin.
 * Body: campos opcionales del producto.
 * Respuestas: 200 — Producto actualizado. 404 — No encontrado.
 */
const productUpdateSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  price: z.number().optional(),
  stock: z.number().int().optional(),
  image_url: z.string().nullable().optional(),
  category_id: z.number().int().optional(),
});

productsRouter.patch(
  "/:id",
  requireAdmin,
  zValidator("json", productUpdateSchema),
  async (c) => {
    const id = Number(c.req.param("id"));
    const data = c.req.valid("json");
    const db = createDb(c.env.DB);

    const existing = await db.query.products.findFirst({
      where: eq(products.id, id),
    });
    if (!existing) {
      return c.json({ detail: "Producto no encontrado" }, 404);
    }

    const updateData: Record<string, unknown> = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.price !== undefined) updateData.price = data.price;
    if (data.stock !== undefined) updateData.stock = data.stock;
    if (data.image_url !== undefined) updateData.image_url = data.image_url;
    if (data.category_id !== undefined) updateData.category_id = data.category_id;

    if (Object.keys(updateData).length > 0) {
      await db.update(products).set(updateData).where(eq(products.id, id));
    }

    const updated = await db.query.products.findFirst({
      where: eq(products.id, id),
      with: { category: true },
    });

    return c.json(updated);
  }
);

/**
 * DELETE /:id
 * Elimina un producto. Requiere rol admin.
 * Respuestas: 204 — Eliminado. 404 — No encontrado.
 */
productsRouter.delete("/:id", requireAdmin, async (c) => {
  const id = Number(c.req.param("id"));
  const db = createDb(c.env.DB);

  const existing = await db.query.products.findFirst({
    where: eq(products.id, id),
  });
  if (!existing) {
    return c.json({ detail: "Producto no encontrado" }, 404);
  }

  await db.delete(products).where(eq(products.id, id));
  return c.body(null, 204);
});

export default productsRouter;
