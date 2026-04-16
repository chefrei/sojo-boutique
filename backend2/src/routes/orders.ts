/**
 * Rutas de Pedidos — /api/v1/orders
 *
 * Endpoints:
 *   POST  /           — Crear un nuevo pedido (descuenta stock)
 *   GET   /me         — Pedidos del usuario autenticado
 *   GET   /:id        — Detalle de un pedido (verifica propiedad)
 *   PUT   /:id/cancel — Cancelar pedido (con reglas de negocio)
 */

import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { eq, desc } from "drizzle-orm";
import { createDb } from "../db/index";
import { orders, orderItems, products, users } from "../db/schema";
import { requireAuth } from "../middleware/auth";
import type { Env, AppVariables } from "../types";

const ordersRouter = new Hono<{
  Bindings: Env;
  Variables: AppVariables;
}>();

// Todas las rutas de orders requieren autenticación
ordersRouter.use("/*", requireAuth);

// ─── POST / ─────────────────────────────────────────────

/**
 * Crear un nuevo pedido.
 * - Descuenta stock de cada producto.
 * - Si el usuario es admin y provide user_id, asigna el pedido a ese cliente.
 * Body: { items: [{ product_id, quantity }], user_id? }
 * Respuestas: 201 — Pedido creado. 404 — Producto/Cliente no encontrado.
 */
const orderCreateSchema = z.object({
  items: z
    .array(
      z.object({
        product_id: z.number().int(),
        quantity: z.number().int().min(1),
      })
    )
    .min(1),
  user_id: z.number().int().nullable().optional(),
});

ordersRouter.post("/", zValidator("json", orderCreateSchema), async (c) => {
  const { items, user_id } = c.req.valid("json");
  const currentUser = c.get("currentUser")!;
  const db = createDb(c.env.DB);

  // Determinar el usuario destino del pedido
  let targetUserId = currentUser.id;
  if (currentUser.role === "admin" && user_id) {
    const targetUser = await db.query.users.findFirst({
      where: eq(users.id, user_id),
    });
    if (!targetUser) {
      return c.json({ detail: "Cliente no encontrado" }, 404);
    }
    targetUserId = user_id;
  }

  // 1. Crear la orden base
  const [newOrder] = await db
    .insert(orders)
    .values({
      user_id: targetUserId,
      total_price: 0,
      amount_paid: 0,
      status: "pending",
      payment_status: "pending",
    })
    .returning();

  let totalPrice = 0;

  // 2. Procesar los items
  for (const item of items) {
    const product = await db.query.products.findFirst({
      where: eq(products.id, item.product_id),
    });
    if (!product) {
      return c.json(
        { detail: `Producto ${item.product_id} no encontrado` },
        404
      );
    }

    const itemTotal = product.price * item.quantity;
    totalPrice += itemTotal;

    // Descontar stock (permite stock negativo para tracking de proveedores)
    await db
      .update(products)
      .set({ stock: product.stock - item.quantity })
      .where(eq(products.id, product.id));

    // Crear OrderItem
    await db.insert(orderItems).values({
      order_id: newOrder.id,
      product_id: product.id,
      quantity: item.quantity,
      unit_price: product.price,
    });
  }

  // 3. Actualizar precio total
  await db
    .update(orders)
    .set({ total_price: totalPrice })
    .where(eq(orders.id, newOrder.id));

  // 4. Retornar el pedido completo
  const fullOrder = await db.query.orders.findFirst({
    where: eq(orders.id, newOrder.id),
    with: { items: true },
  });

  return c.json(fullOrder, 201);
});

// ─── GET /me ────────────────────────────────────────────

/**
 * Obtener los pedidos del usuario autenticado.
 * Respuestas: 200 — Array de pedidos ordenados por fecha desc.
 */
ordersRouter.get("/me", async (c) => {
  const currentUser = c.get("currentUser")!;
  const db = createDb(c.env.DB);

  const result = await db.query.orders.findMany({
    where: eq(orders.user_id, currentUser.id),
    with: { items: true },
    orderBy: [desc(orders.created_at)],
  });

  return c.json(result);
});

// ─── GET /:id ───────────────────────────────────────────

/**
 * Obtener detalle de un pedido.
 * Verifica que el pedido pertenezca al usuario o que sea admin.
 * Respuestas: 200 — Pedido. 404 — No encontrado. 403 — Sin permiso.
 */
ordersRouter.get("/:id", async (c) => {
  const id = Number(c.req.param("id"));
  const currentUser = c.get("currentUser")!;
  const db = createDb(c.env.DB);

  const order = await db.query.orders.findFirst({
    where: eq(orders.id, id),
    with: { items: true },
  });

  if (!order) {
    return c.json({ detail: "Pedido no encontrado" }, 404);
  }

  if (order.user_id !== currentUser.id && currentUser.role !== "admin") {
    return c.json(
      { detail: "No tienes permiso para ver este pedido" },
      403
    );
  }

  return c.json(order);
});

// ─── PUT /:id/cancel ────────────────────────────────────

/**
 * Cancelar un pedido. Reglas de negocio:
 * - Clientes: solo pueden cancelar pedidos propios, en estado PENDING,
 *   y dentro de 1 hora desde su creación.
 * - Admin: puede cancelar cualquier pedido excepto los ya entregados.
 * - Restaura el stock de los productos.
 * Respuestas: 200 — Pedido cancelado. 400/403/404 — Error.
 */
ordersRouter.put("/:id/cancel", async (c) => {
  const id = Number(c.req.param("id"));
  const currentUser = c.get("currentUser")!;
  const db = createDb(c.env.DB);

  const order = await db.query.orders.findFirst({
    where: eq(orders.id, id),
    with: { items: true },
  });

  if (!order) {
    return c.json({ detail: "Pedido no encontrado" }, 404);
  }

  // Si es cliente, verificar que el pedido sea suyo
  if (currentUser.role !== "admin") {
    if (order.user_id !== currentUser.id) {
      return c.json(
        { detail: "No tienes permiso para cancelar este pedido" },
        403
      );
    }

    if (order.status !== "pending") {
      return c.json(
        {
          detail:
            "El pedido ya no puede ser cancelado porque no está pendiente",
        },
        400
      );
    }

    // Debe haber pasado menos de 1 hora
    const createdAt = new Date(order.created_at).getTime();
    const now = Date.now();
    const oneHourMs = 60 * 60 * 1000;
    if (now - createdAt > oneHourMs) {
      return c.json(
        {
          detail:
            "El tiempo de gracia para cancelar el pedido (1 hora) ha expirado",
        },
        400
      );
    }
  }

  // Reglas para el admin
  if (currentUser.role === "admin") {
    if (order.status === "delivered") {
      return c.json(
        { detail: "No se puede cancelar un pedido que ya fue entregado" },
        400
      );
    }
  }

  // Si ya está cancelado, simplemente lo retornamos
  if (order.status === "cancelled") {
    return c.json(order);
  }

  // Restaurar el stock
  for (const item of order.items) {
    const product = await db.query.products.findFirst({
      where: eq(products.id, item.product_id),
    });
    if (product) {
      await db
        .update(products)
        .set({ stock: product.stock + item.quantity })
        .where(eq(products.id, product.id));
    }
  }

  // Cambiar estado
  await db
    .update(orders)
    .set({ status: "cancelled" })
    .where(eq(orders.id, id));

  const updatedOrder = await db.query.orders.findFirst({
    where: eq(orders.id, id),
    with: { items: true },
  });

  return c.json(updatedOrder);
});

export default ordersRouter;
