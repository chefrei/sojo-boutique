/**
 * Rutas de Autenticación — /api/v1/auth
 *
 * Endpoints:
 *   POST /register — Registrar nuevo usuario (rol CLIENT por defecto)
 *   POST /login    — Iniciar sesión con email/password, retorna JWT
 *   GET  /me       — Obtener datos del usuario autenticado
 */

import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { createDb } from "../db/index";
import { users, customerProfiles } from "../db/schema";
import {
  hashPassword,
  verifyPassword,
  createAccessToken,
} from "../lib/security";
import { requireAuth } from "../middleware/auth";
import type { Env, AppVariables } from "../types";

const auth = new Hono<{ Bindings: Env; Variables: AppVariables }>();

// ─── POST /register ─────────────────────────────────────

const registerSchema = z.object({
  email: z.string().email("Email inválido"),
  full_name: z.string().min(1, "El nombre es obligatorio"),
  password: z.string().min(1, "La contraseña es obligatoria"),
});

auth.post("/register", zValidator("json", registerSchema), async (c) => {
  const { email, full_name, password } = c.req.valid("json");
  const db = createDb(c.env.DB);

  // Verificar si el usuario ya existe
  const existing = await db.query.users.findFirst({
    where: eq(users.email, email),
  });
  if (existing) {
    return c.json({ detail: "El correo ya está registrado" }, 400);
  }

  // Crear nuevo usuario
  const hashed = await hashPassword(password);
  const result = await db
    .insert(users)
    .values({
      email,
      full_name,
      hashed_password: hashed,
      role: "client",
      is_active: true,
    })
    .returning();

  const newUser = result[0];

  return c.json(
    {
      id: newUser.id,
      email: newUser.email,
      full_name: newUser.full_name,
      role: newUser.role,
      is_active: newUser.is_active,
    },
    201
  );
});

// ─── POST /login ────────────────────────────────────────
// FastAPI usa OAuth2PasswordRequestForm (form-urlencoded: username + password).
// Replicamos ese comportamiento para compatibilidad con el frontend.

auth.post("/login", async (c) => {
  const contentType = c.req.header("Content-Type") || "";
  let username: string;
  let password: string;

  if (contentType.includes("application/x-www-form-urlencoded")) {
    const body = await c.req.parseBody();
    username = String(body.username || "");
    password = String(body.password || "");
  } else {
    // También aceptar JSON por conveniencia
    const body = await c.req.json();
    username = body.username || body.email || "";
    password = body.password || "";
  }

  if (!username || !password) {
    return c.json({ detail: "Se requiere username y password" }, 400);
  }

  const db = createDb(c.env.DB);
  const user = await db.query.users.findFirst({
    where: eq(users.email, username),
  });

  if (!user) {
    return c.json({ detail: "Correo o contraseña incorrectos" }, 401);
  }

  const validPassword = await verifyPassword(password, user.hashed_password);
  if (!validPassword) {
    return c.json({ detail: "Correo o contraseña incorrectos" }, 401);
  }

  const accessToken = await createAccessToken(user.email, c.env.JWT_SECRET);

  return c.json({
    access_token: accessToken,
    token_type: "bearer",
  });
});

// ─── GET /me ────────────────────────────────────────────

auth.get("/me", requireAuth, async (c) => {
  const user = c.get("currentUser")!;
  const db = createDb(c.env.DB);
  const profile = await db.query.customerProfiles.findFirst({
    where: eq(customerProfiles.user_id, user.id)
  });

  return c.json({
    id: user.id,
    email: user.email,
    name: user.full_name,
    role: user.role,
    is_active: user.is_active,
    phone: profile?.phone || "",
    birthdate: profile?.birthdate || "",
    address: profile?.address || "",
    city: profile?.city || "",
    state: profile?.state || "",
    postal_code: profile?.postal_code || "",
  });
});

// ─── PATCH /me ──────────────────────────────────────────

const profileUpdateSchema = z.object({
  name: z.string().optional(),
  phone: z.string().optional(),
  birthdate: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  postal_code: z.string().optional(),
});

auth.patch("/me", requireAuth, zValidator("json", profileUpdateSchema), async (c) => {
  const data = c.req.valid("json");
  const user = c.get("currentUser")!;
  const db = createDb(c.env.DB);
  
  if (data.name) {
    await db.update(users).set({ full_name: data.name }).where(eq(users.id, user.id));
  }
  
  if (
    data.phone !== undefined ||
    data.birthdate !== undefined ||
    data.address !== undefined ||
    data.city !== undefined ||
    data.state !== undefined ||
    data.postal_code !== undefined
  ) {
    // Check if profile exists
    const profile = await db.query.customerProfiles.findFirst({
      where: eq(customerProfiles.user_id, user.id),
    });

    const updateData: any = {};
    if (data.phone !== undefined) updateData.phone = data.phone;
    if (data.birthdate !== undefined) updateData.birthdate = data.birthdate;
    if (data.address !== undefined) updateData.address = data.address;
    if (data.city !== undefined) updateData.city = data.city;
    if (data.state !== undefined) updateData.state = data.state;
    if (data.postal_code !== undefined) updateData.postal_code = data.postal_code;

    if (profile) {
      await db
        .update(customerProfiles)
        .set(updateData)
        .where(eq(customerProfiles.user_id, user.id));
    } else {
      updateData.user_id = user.id;
      await db.insert(customerProfiles).values(updateData);
    }
  }
  
  return c.json({ status: "success" });
});

export default auth;
