/**
 * Rutas de Reportes / Business Intelligence — /api/v1/reports
 *
 * Endpoints:
 *   GET /customers/:customer_id/kardex — Historial financiero del cliente
 *   GET /finance/summary               — Resumen financiero por rango de fechas
 */

import { Hono } from "hono";
import { eq, and, gte, lte, sql } from "drizzle-orm";
import { createDb } from "../db/index";
import { users, orders, payments } from "../db/schema";
import { requireAdmin } from "../middleware/auth";
import type { Env, AppVariables } from "../types";

const reportsRouter = new Hono<{
  Bindings: Env;
  Variables: AppVariables;
}>();

// Todas las rutas de reportes requieren admin
reportsRouter.use("/*", requireAdmin);

// ─── GET /customers/:customer_id/kardex ─────────────────

/**
 * Obtiene el historial financiero (kardex) de un cliente.
 * Combina pedidos y pagos, ordenados cronológicamente, con saldo acumulado.
 *
 * Respuestas:
 *   200: { customer_name, current_balance, transactions[] }
 *   404: Cliente no encontrado.
 */
reportsRouter.get("/customers/:customer_id/kardex", async (c) => {
  const customerId = Number(c.req.param("customer_id"));
  const db = createDb(c.env.DB);

  const user = await db.query.users.findFirst({
    where: eq(users.id, customerId),
  });
  if (!user || user.role !== "client") {
    return c.json({ detail: "Cliente no encontrado" }, 404);
  }

  // Obtener todos los pedidos y pagos del cliente
  const customerOrders = await db
    .select()
    .from(orders)
    .where(eq(orders.user_id, customerId));

  const customerPayments = await db
    .select()
    .from(payments)
    .where(eq(payments.user_id, customerId));

  // Combinar en un historial
  interface HistoryEvent {
    date: string;
    type: string;
    reference: string;
    amount: number;
    is_credit: boolean;
  }

  const history: HistoryEvent[] = [];

  for (const order of customerOrders) {
    history.push({
      date: order.created_at,
      type: "Cargos (Pedido)",
      reference: `PED-${String(order.id).padStart(3, "0")}`,
      amount: order.total_price,
      is_credit: false,
    });
  }

  for (const payment of customerPayments) {
    history.push({
      date: payment.created_at,
      type: "Abono",
      reference: `Pago ID: ${payment.id} (${payment.method})`,
      amount: payment.amount,
      is_credit: true,
    });
  }

  // Ordenar por fecha
  history.sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // Calcular saldo acumulado
  let balance = 0;
  const kardex = history.map((event) => {
    if (event.is_credit) {
      balance -= event.amount;
    } else {
      balance += event.amount;
    }

    const dateObj = new Date(event.date);
    const dateFormatted = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, "0")}-${String(dateObj.getDate()).padStart(2, "0")} ${String(dateObj.getHours()).padStart(2, "0")}:${String(dateObj.getMinutes()).padStart(2, "0")}`;

    return {
      ...event,
      dateFormatted,
      running_balance: Math.round(balance * 100) / 100,
    };
  });

  return c.json({
    customer_name: user.full_name,
    current_balance: Math.round(balance * 100) / 100,
    transactions: kardex,
  });
});

// ─── GET /finance/summary ───────────────────────────────

/**
 * Obtiene un resumen financiero por rango de fechas.
 * Query params: start_date (ISO), end_date (ISO) — ambos opcionales.
 * Si no se proporcionan, usa los últimos 30 días.
 *
 * Respuestas:
 *   200: { period, total_sales, total_collected, total_receivable, order_count, payment_count }
 *   400: Formato de fecha inválido.
 */
reportsRouter.get("/finance/summary", async (c) => {
  const startDateParam = c.req.query("start_date");
  const endDateParam = c.req.query("end_date");
  const db = createDb(c.env.DB);

  let start: Date;
  let end: Date;

  try {
    const now = new Date();
    start = startDateParam
      ? new Date(startDateParam)
      : new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    end = endDateParam
      ? new Date(endDateParam)
      : new Date(now.getTime() + 24 * 60 * 60 * 1000);

    // Validar que sean fechas válidas
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new Error("Invalid date");
    }
  } catch {
    return c.json(
      { detail: "Formato de fecha inválido. Usar ISO format." },
      400
    );
  }

  const startIso = start.toISOString();
  const endIso = end.toISOString();

  // Ventas totales en el rango
  const ordersInRange = await db
    .select()
    .from(orders)
    .where(
      and(
        gte(orders.created_at, startIso),
        lte(orders.created_at, endIso)
      )
    );

  const totalSales = ordersInRange.reduce((sum, o) => sum + o.total_price, 0);

  // Pagos totales en el rango
  const paymentsInRange = await db
    .select()
    .from(payments)
    .where(
      and(
        gte(payments.created_at, startIso),
        lte(payments.created_at, endIso)
      )
    );

  const totalCollected = paymentsInRange.reduce(
    (sum, p) => sum + p.amount,
    0
  );

  // Deuda pendiente total (global, no solo del rango)
  const unpaidOrders = await db
    .select()
    .from(orders)
    .where(sql`${orders.amount_paid} < ${orders.total_price}`);

  const totalReceivable = unpaidOrders.reduce(
    (sum, o) => sum + (o.total_price - o.amount_paid),
    0
  );

  const startFormatted = start.toISOString().split("T")[0];
  const endFormatted = end.toISOString().split("T")[0];

  return c.json({
    period: `${startFormatted} a ${endFormatted}`,
    total_sales: totalSales,
    total_collected: totalCollected,
    total_receivable: totalReceivable,
    order_count: ordersInRange.length,
    payment_count: paymentsInRange.length,
  });
});

export default reportsRouter;
