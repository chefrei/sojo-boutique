/**
 * Rutas de Administración — /api/v1/admin
 *
 * Endpoints:
 *   GET   /dashboard      — Estadísticas del dashboard
 *   POST  /payments       — Registrar un pago
 *   GET   /debtors        — Lista de clientes con deuda
 *   GET   /orders         — Todos los pedidos (formato tabla)
 *   PATCH /orders/:id     — Actualizar estado de un pedido
 */

import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { eq, sql, and } from "drizzle-orm";
import { createDb } from "../db/index";
import {
  users,
  orders,
  orderItems,
  payments,
  products,
} from "../db/schema";
import { requireAdmin } from "../middleware/auth";
import type { Env, AppVariables } from "../types";

const adminRouter = new Hono<{
  Bindings: Env;
  Variables: AppVariables;
}>();

// Todas las rutas admin requieren rol admin
adminRouter.use("/*", requireAdmin);

// ─── GET /dashboard ─────────────────────────────────────

/**
 * Obtiene las estadísticas del dashboard.
 * Respuestas:
 *   200: { total_sales, total_collected, total_receivable, order_count, customer_count }
 */
adminRouter.get("/dashboard", async (c) => {
  const db = createDb(c.env.DB);

  // Total ventas (pedidos entregados)
  const salesResult = await db
    .select({ total: sql<number>`COALESCE(SUM(${orders.total_price}), 0)` })
    .from(orders)
    .where(eq(orders.status, "delivered"));
  const totalSales = salesResult[0]?.total ?? 0;

  // Total cobrado (todos los pagos)
  const collectedResult = await db
    .select({ total: sql<number>`COALESCE(SUM(${payments.amount}), 0)` })
    .from(payments);
  const totalCollected = collectedResult[0]?.total ?? 0;

  // Total por cobrar
  const totalReceivable = totalSales - totalCollected;

  // Cantidad de pedidos entregados
  const orderCountResult = await db
    .select({ count: sql<number>`COUNT(${orders.id})` })
    .from(orders)
    .where(eq(orders.status, "delivered"));
  const orderCount = orderCountResult[0]?.count ?? 0;

  // Cantidad de clientes
  const customerCountResult = await db
    .select({ count: sql<number>`COUNT(${users.id})` })
    .from(users)
    .where(eq(users.role, "client"));
  const customerCount = customerCountResult[0]?.count ?? 0;

  return c.json({
    total_sales: totalSales,
    total_collected: totalCollected,
    total_receivable: totalReceivable,
    order_count: orderCount,
    customer_count: customerCount,
  });
});

// ─── POST /payments ─────────────────────────────────────

/**
 * Registra un pago y actualiza el estado de pago del pedido asociado.
 * Body: { user_id, order_id?, amount, method, notes? }
 * Respuestas: 201 — Pago registrado. 404 — Pedido no encontrado.
 */
const paymentCreateSchema = z.object({
  user_id: z.number().int(),
  order_id: z.number().int().nullable().optional(),
  amount: z.number().min(0),
  method: z.string().min(1),
  notes: z.string().nullable().optional(),
});

adminRouter.post(
  "/payments",
  zValidator("json", paymentCreateSchema),
  async (c) => {
    const data = c.req.valid("json");
    const db = createDb(c.env.DB);

    // 1. Crear el registro del pago
    const [newPayment] = await db
      .insert(payments)
      .values({
        user_id: data.user_id,
        order_id: data.order_id ?? null,
        amount: data.amount,
        method: data.method,
        notes: data.notes ?? null,
      })
      .returning();

    // 2. Si el pago es para un pedido específico, actualizar el estado del pedido
    if (data.order_id) {
      const order = await db.query.orders.findFirst({
        where: eq(orders.id, data.order_id),
      });
      if (!order) {
        return c.json({ detail: "Pedido no encontrado" }, 404);
      }

      const newAmountPaid = order.amount_paid + data.amount;
      let paymentStatus: string;

      if (newAmountPaid >= order.total_price) {
        paymentStatus = "paid";
      } else if (newAmountPaid > 0) {
        paymentStatus = "partial";
      } else {
        paymentStatus = "pending";
      }

      await db
        .update(orders)
        .set({
          amount_paid: newAmountPaid,
          payment_status: paymentStatus as "pending" | "partial" | "paid" | "refunded",
        })
        .where(eq(orders.id, data.order_id));
    }

    return c.json(newPayment, 201);
  }
);

// ─── GET /debtors ───────────────────────────────────────

/**
 * Obtiene la lista de clientes con saldo pendiente (deuda > 0).
 * Respuestas: 200 — Array de clientes con total_orders, total_paid, balance.
 */
adminRouter.get("/debtors", async (c) => {
  const db = createDb(c.env.DB);

  const clientUsers = await db
    .select()
    .from(users)
    .where(eq(users.role, "client"));

  const debtors = [];

  for (const user of clientUsers) {
    // Total de pedidos entregados
    const ordersResult = await db
      .select({
        total: sql<number>`COALESCE(SUM(${orders.total_price}), 0)`,
      })
      .from(orders)
      .where(
        and(eq(orders.user_id, user.id), eq(orders.status, "delivered"))
      );
    const totalOrders = ordersResult[0]?.total ?? 0;

    // Total pagado
    const paymentsResult = await db
      .select({
        total: sql<number>`COALESCE(SUM(${payments.amount}), 0)`,
      })
      .from(payments)
      .where(eq(payments.user_id, user.id));
    const totalPaid = paymentsResult[0]?.total ?? 0;

    const balance = totalOrders - totalPaid;
    if (balance > 0) {
      debtors.push({
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        is_active: user.is_active,
        total_orders: totalOrders,
        total_paid: totalPaid,
        balance: balance,
      });
    }
  }

  return c.json(debtors);
});

// ─── GET /orders ────────────────────────────────────────

/**
 * Obtiene todos los pedidos en formato tabla para el panel admin.
 * Respuestas: 200 — Array de { id: "PED-001", fecha, cliente, total, estado, productos }
 */
adminRouter.get("/orders", async (c) => {
  const offset = Number(c.req.query("offset") || 0);
  const limit = Number(c.req.query("limit") || 100);

  const db = createDb(c.env.DB);

  const allOrders = await db.query.orders.findMany({
    with: {
      user: true,
      items: true,
    },
    orderBy: (orders, { desc }) => [desc(orders.created_at)],
    offset,
    limit,
  });

  const statusMapping: Record<string, string> = {
    pending: "Pendiente",
    paid: "Pendiente",
    shipped: "En Proceso",
    delivered: "Completado",
    cancelled: "Cancelado",
  };

  const result = [];
  for (const order of allOrders) {
    // Obtener nombres de productos
    const productNames: string[] = [];
    for (const item of order.items) {
      const product = await db.query.products.findFirst({
        where: eq(products.id, item.product_id),
      });
      if (product) {
        productNames.push(product.name);
      }
    }

    const fecha = order.created_at
      ? new Date(order.created_at).toISOString().split("T")[0]
      : "";

    result.push({
      id: `PED-${String(order.id).padStart(3, "0")}`,
      db_id: order.id,
      fecha,
      cliente: order.user?.full_name || "Cliente Desconocido",
      total: order.total_price,
      estado: statusMapping[order.status] || order.status,
      productos: productNames,
    });
  }

  return c.json(result);
});

// ─── PATCH /orders/:id ──────────────────────────────────

/**
 * Actualiza el estado de un pedido.
 * Body: { status?, payment_status? }
 * Respuestas: 200 — Pedido actualizado. 404 — No encontrado.
 */
const orderUpdateSchema = z.object({
  status: z
    .enum(["pending", "paid", "shipped", "delivered", "cancelled"])
    .optional(),
  payment_status: z
    .enum(["pending", "partial", "paid", "refunded"])
    .optional(),
});

adminRouter.patch(
  "/orders/:id",
  zValidator("json", orderUpdateSchema),
  async (c) => {
    const id = Number(c.req.param("id"));
    const data = c.req.valid("json");
    const db = createDb(c.env.DB);

    const order = await db.query.orders.findFirst({
      where: eq(orders.id, id),
    });
    if (!order) {
      return c.json({ detail: "Pedido no encontrado" }, 404);
    }

    const updateData: Record<string, unknown> = {};
    if (data.status !== undefined) updateData.status = data.status;
    if (data.payment_status !== undefined)
      updateData.payment_status = data.payment_status;

    if (Object.keys(updateData).length > 0) {
      await db.update(orders).set(updateData).where(eq(orders.id, id));
    }

    const updatedOrder = await db.query.orders.findFirst({
      where: eq(orders.id, id),
      with: { items: true },
    });

    return c.json(updatedOrder);
  }
);

export default adminRouter;
