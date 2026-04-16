/**
 * Middleware de autenticación y autorización para Soho Boutique API.
 *
 * - authMiddleware: extrae el token Bearer, decodifica el JWT
 *   y carga el usuario desde D1. Si no hay token, currentUser = null.
 * - requireAuth: retorna 401 si no hay usuario autenticado.
 * - requireAdmin: retorna 403 si el usuario no es admin.
 */

import { createMiddleware } from "hono/factory";
import { HTTPException } from "hono/http-exception";
import { eq } from "drizzle-orm";
import { createDb } from "../db/index";
import { users } from "../db/schema";
import { decodeToken } from "../lib/security";
import type { Env, AppVariables } from "../types";

/**
 * Extrae el token, decodifica y carga el usuario en c.var.currentUser.
 * No lanza error si no hay token (permite rutas públicas).
 */
export const authMiddleware = createMiddleware<{
  Bindings: Env;
  Variables: AppVariables;
}>(async (c, next) => {
  c.set("currentUser", null);

  const authHeader = c.req.header("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next();
  }

  const token = authHeader.slice(7);
  const payload = await decodeToken(token, c.env.JWT_SECRET);
  if (!payload || !payload.sub) {
    return next();
  }

  const db = createDb(c.env.DB);
  const user = await db.query.users.findFirst({
    where: eq(users.email, payload.sub),
  });

  if (user) {
    c.set("currentUser", {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      role: user.role,
      is_active: user.is_active,
    });
  }

  return next();
});

/**
 * Requiere que el usuario esté autenticado.
 * Lanza 401 si no hay currentUser.
 */
export const requireAuth = createMiddleware<{
  Bindings: Env;
  Variables: AppVariables;
}>(async (c, next) => {
  const user = c.get("currentUser");
  if (!user) {
    throw new HTTPException(401, {
      message: "No se pudo validar las credenciales",
    });
  }
  if (!user.is_active) {
    throw new HTTPException(400, { message: "Usuario inactivo" });
  }
  return next();
});

/**
 * Requiere que el usuario sea admin.
 * Lanza 403 si no tiene rol admin.
 */
export const requireAdmin = createMiddleware<{
  Bindings: Env;
  Variables: AppVariables;
}>(async (c, next) => {
  const user = c.get("currentUser");
  if (!user) {
    throw new HTTPException(401, {
      message: "No se pudo validar las credenciales",
    });
  }
  if (!user.is_active) {
    throw new HTTPException(400, { message: "Usuario inactivo" });
  }
  if (user.role !== "admin") {
    throw new HTTPException(403, {
      message: "El usuario no tiene privilegios de administrador",
    });
  }
  return next();
});
