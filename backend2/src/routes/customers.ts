/**
 * Rutas de Clientes — /api/v1/customers
 *
 * Endpoints:
 *   GET    /       — Listar clientes (con stats: compras, última compra, deuda)
 *   GET    /:id    — Detalle de un cliente
 *   POST   /       — Crear nuevo cliente
 *   PATCH  /:id    — Actualizar cliente (user + profile)
 *   DELETE /:id    — Eliminar cliente (solo si no tiene pedidos)
 */

import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { eq, and, sql } from "drizzle-orm";
import { createDb } from "../db/index";
import {
  users,
  customerProfiles,
  orders,
  payments,
} from "../db/schema";
import { requireAdmin } from "../middleware/auth";
import { hashPassword } from "../lib/security";
import type { Env, AppVariables } from "../types";

const customersRouter = new Hono<{
  Bindings: Env;
  Variables: AppVariables;
}>();

// Todas las rutas de customers requieren admin
customersRouter.use("/*", requireAdmin);

// ─── Helper: construir respuesta de cliente ─────────────

async function buildCustomerResponse(
  db: ReturnType<typeof createDb>,
  userId: number
) {
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });
  if (!user || user.role !== "client") return null;

  const profile = await db.query.customerProfiles.findFirst({
    where: eq(customerProfiles.user_id, userId),
  });

  // Estadísticas
  const comprasResult = await db
    .select({ count: sql<number>`COUNT(${orders.id})` })
    .from(orders)
    .where(
      and(eq(orders.user_id, userId), eq(orders.status, "delivered"))
    );
  const compras = comprasResult[0]?.count ?? 0;

  const ultimaCompraResult = await db
    .select({ max_date: sql<string>`MAX(${orders.created_at})` })
    .from(orders)
    .where(
      and(eq(orders.user_id, userId), eq(orders.status, "delivered"))
    );
  const ultimaCompra = ultimaCompraResult[0]?.max_date ?? null;

  const totalOrdersResult = await db
    .select({
      total: sql<number>`COALESCE(SUM(${orders.total_price}), 0)`,
    })
    .from(orders)
    .where(
      and(eq(orders.user_id, userId), eq(orders.status, "delivered"))
    );
  const totalOrders = totalOrdersResult[0]?.total ?? 0;

  const totalPaidResult = await db
    .select({
      total: sql<number>`COALESCE(SUM(${payments.amount}), 0)`,
    })
    .from(payments)
    .where(eq(payments.user_id, userId));
  const totalPaid = totalPaidResult[0]?.total ?? 0;

  const deuda = totalOrders - totalPaid;

  return {
    id: user.id,
    name: user.full_name,
    email: user.email.includes("no-email") ? "" : user.email,
    phone: profile?.phone ?? "",
    address: profile?.address ?? "",
    city: profile?.city ?? "",
    state: profile?.state ?? "",
    postalCode: profile?.postal_code ?? "",
    status: user.is_active ? "active" : "inactive",
    notes: profile?.notes ?? "",
    identificationType: profile?.identification_type ?? "",
    identificationNumber: profile?.identification_number ?? "",
    compras,
    ultimaCompra: ultimaCompra
      ? new Date(ultimaCompra).toISOString()
      : null,
    deuda,
  };
}

// ─── GET / ──────────────────────────────────────────────

customersRouter.get("/", async (c) => {
  const offset = Number(c.req.query("offset") || 0);
  const limit = Number(c.req.query("limit") || 100);
  const db = createDb(c.env.DB);

  const clientUsers = await db
    .select()
    .from(users)
    .where(eq(users.role, "client"))
    .offset(offset)
    .limit(limit);

  const result = [];
  for (const user of clientUsers) {
    const customerData = await buildCustomerResponse(db, user.id);
    if (customerData) result.push(customerData);
  }

  return c.json(result);
});

// ─── GET /:id ───────────────────────────────────────────

customersRouter.get("/:id", async (c) => {
  const id = Number(c.req.param("id"));
  const db = createDb(c.env.DB);

  const customerData = await buildCustomerResponse(db, id);
  if (!customerData) {
    return c.json({ detail: "Cliente no encontrado" }, 404);
  }

  return c.json(customerData);
});

// ─── POST / ─────────────────────────────────────────────

const customerCreateSchema = z.object({
  name: z.string().min(1),
  email: z.string().nullable().optional(),
  phone: z.string(),
  address: z.string().nullable().optional(),
  city: z.string().nullable().optional(),
  state: z.string().nullable().optional(),
  postalCode: z.string().nullable().optional(),
  status: z.string().default("active"),
  notes: z.string().nullable().optional(),
  identificationType: z.string().nullable().optional(),
  identificationNumber: z.string().nullable().optional(),
});

customersRouter.post(
  "/",
  zValidator("json", customerCreateSchema),
  async (c) => {
    const data = c.req.valid("json");
    const db = createDb(c.env.DB);

    // Determinar email
    let emailToUse = data.email;
    if (!emailToUse) {
      emailToUse = `no-email-${crypto.randomUUID().replace(/-/g, "").slice(0, 8)}@sojoboutique.com`;
    } else {
      const existing = await db.query.users.findFirst({
        where: eq(users.email, emailToUse),
      });
      if (existing) {
        return c.json({ detail: "El correo ya está registrado." }, 400);
      }
    }

    // Crear usuario
    const randomPassword = crypto.randomUUID();
    const hashedPw = await hashPassword(randomPassword);

    const [newUser] = await db
      .insert(users)
      .values({
        email: emailToUse,
        full_name: data.name,
        hashed_password: hashedPw,
        role: "client",
        is_active: data.status === "active",
      })
      .returning();

    // Crear perfil
    await db.insert(customerProfiles).values({
      user_id: newUser.id,
      phone: data.phone,
      address: data.address ?? null,
      city: data.city ?? null,
      state: data.state ?? null,
      postal_code: data.postalCode ?? null,
      notes: data.notes ?? null,
      identification_type: data.identificationType ?? null,
      identification_number: data.identificationNumber ?? null,
    });

    const customerData = await buildCustomerResponse(db, newUser.id);
    return c.json(customerData, 201);
  }
);

// ─── PATCH /:id ─────────────────────────────────────────

const customerUpdateSchema = z.object({
  name: z.string().optional(),
  email: z.string().nullable().optional(),
  phone: z.string().optional(),
  address: z.string().nullable().optional(),
  city: z.string().nullable().optional(),
  state: z.string().nullable().optional(),
  postalCode: z.string().nullable().optional(),
  status: z.string().optional(),
  notes: z.string().nullable().optional(),
  identificationType: z.string().nullable().optional(),
  identificationNumber: z.string().nullable().optional(),
});

customersRouter.patch(
  "/:id",
  zValidator("json", customerUpdateSchema),
  async (c) => {
    const id = Number(c.req.param("id"));
    const data = c.req.valid("json");
    const db = createDb(c.env.DB);

    const user = await db.query.users.findFirst({
      where: eq(users.id, id),
    });
    if (!user || user.role !== "client") {
      return c.json({ detail: "Cliente no encontrado" }, 404);
    }

    // Actualizar usuario
    const userUpdate: Record<string, unknown> = {};
    if (data.name !== undefined) userUpdate.full_name = data.name;
    if (data.status !== undefined)
      userUpdate.is_active = data.status === "active";

    if (data.email !== undefined) {
      if (data.email === "" || data.email === null) {
        if (!user.email.includes("no-email")) {
          userUpdate.email = `no-email-${crypto.randomUUID().replace(/-/g, "").slice(0, 8)}@sojoboutique.com`;
        }
      } else {
        const existing = await db.query.users.findFirst({
          where: and(eq(users.email, data.email), sql`${users.id} != ${id}`),
        });
        if (existing) {
          return c.json(
            { detail: "El correo ya está registrado por otro usuario." },
            400
          );
        }
        userUpdate.email = data.email;
      }
    }

    if (Object.keys(userUpdate).length > 0) {
      await db.update(users).set(userUpdate).where(eq(users.id, id));
    }

    // Actualizar perfil
    let profile = await db.query.customerProfiles.findFirst({
      where: eq(customerProfiles.user_id, id),
    });

    const profileUpdate: Record<string, unknown> = {};
    if (data.phone !== undefined) profileUpdate.phone = data.phone;
    if (data.address !== undefined) profileUpdate.address = data.address;
    if (data.city !== undefined) profileUpdate.city = data.city;
    if (data.state !== undefined) profileUpdate.state = data.state;
    if (data.postalCode !== undefined)
      profileUpdate.postal_code = data.postalCode;
    if (data.notes !== undefined) profileUpdate.notes = data.notes;
    if (data.identificationType !== undefined)
      profileUpdate.identification_type = data.identificationType;
    if (data.identificationNumber !== undefined)
      profileUpdate.identification_number = data.identificationNumber;

    if (profile) {
      if (Object.keys(profileUpdate).length > 0) {
        await db
          .update(customerProfiles)
          .set(profileUpdate)
          .where(eq(customerProfiles.user_id, id));
      }
    } else {
      profileUpdate.user_id = id;
      await db.insert(customerProfiles).values(profileUpdate as any);
    }

    const customerData = await buildCustomerResponse(db, id);
    return c.json(customerData);
  }
);

// ─── DELETE /:id ────────────────────────────────────────

customersRouter.delete("/:id", async (c) => {
  const id = Number(c.req.param("id"));
  const db = createDb(c.env.DB);

  const user = await db.query.users.findFirst({
    where: eq(users.id, id),
  });
  if (!user || user.role !== "client") {
    return c.json({ detail: "Cliente no encontrado" }, 404);
  }

  // Verificar que no tenga pedidos
  const orderCountResult = await db
    .select({ count: sql<number>`COUNT(${orders.id})` })
    .from(orders)
    .where(eq(orders.user_id, id));
  const orderCount = orderCountResult[0]?.count ?? 0;

  if (orderCount > 0) {
    return c.json(
      {
        detail:
          "No se puede eliminar un cliente con pedidos (historial asociado).",
      },
      400
    );
  }

  // Eliminar perfil primero, luego usuario
  await db
    .delete(customerProfiles)
    .where(eq(customerProfiles.user_id, id));
  await db.delete(users).where(eq(users.id, id));

  return c.body(null, 204);
});

export default customersRouter;
