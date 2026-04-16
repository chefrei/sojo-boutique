/**
 * Rutas de Configuración del Sistema — /api/v1/settings
 *
 * Endpoints:
 *   GET   / — Obtener configuración (crea defaults si no existe)
 *   PATCH / — Actualizar configuración (admin)
 */

import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { createDb } from "../db/index";
import { settings } from "../db/schema";
import { requireAdmin } from "../middleware/auth";
import type { Env, AppVariables } from "../types";

const settingsRouter = new Hono<{
  Bindings: Env;
  Variables: AppVariables;
}>();

/**
 * GET /
 * Obtiene la configuración del sistema.
 * Si no existe, crea una con valores por defecto.
 * Respuestas: 200 — SettingsRead.
 */
settingsRouter.get("/", async (c) => {
  const db = createDb(c.env.DB);

  let config = await db.query.settings.findFirst();

  if (!config) {
    // Crear configuración por defecto
    const [newConfig] = await db
      .insert(settings)
      .values({})
      .returning();
    config = newConfig;
  }

  return c.json(config);
});

/**
 * PATCH /
 * Actualiza la configuración del sistema. Requiere rol admin.
 * Body: campos opcionales de configuración.
 * Respuestas: 200 — SettingsRead actualizado.
 */
const settingsUpdateSchema = z.object({
  business_name: z.string().optional(),
  slogan: z.string().nullable().optional(),
  rif: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  email: z.string().nullable().optional(),
  primary_color: z.string().optional(),
  accent_color: z.string().optional(),
  heading_font: z.string().optional(),
  body_font: z.string().optional(),
  logo_url: z.string().nullable().optional(),
});

settingsRouter.patch(
  "/",
  requireAdmin,
  zValidator("json", settingsUpdateSchema),
  async (c) => {
    const data = c.req.valid("json");
    const db = createDb(c.env.DB);

    let config = await db.query.settings.findFirst();

    if (!config) {
      // Crear si no existe
      const [newConfig] = await db
        .insert(settings)
        .values({})
        .returning();
      config = newConfig;
    }

    const updateData: Record<string, unknown> = {};
    if (data.business_name !== undefined)
      updateData.business_name = data.business_name;
    if (data.slogan !== undefined) updateData.slogan = data.slogan;
    if (data.rif !== undefined) updateData.rif = data.rif;
    if (data.phone !== undefined) updateData.phone = data.phone;
    if (data.address !== undefined) updateData.address = data.address;
    if (data.email !== undefined) updateData.email = data.email;
    if (data.primary_color !== undefined)
      updateData.primary_color = data.primary_color;
    if (data.accent_color !== undefined)
      updateData.accent_color = data.accent_color;
    if (data.heading_font !== undefined)
      updateData.heading_font = data.heading_font;
    if (data.body_font !== undefined) updateData.body_font = data.body_font;
    if (data.logo_url !== undefined) updateData.logo_url = data.logo_url;

    if (Object.keys(updateData).length > 0) {
      await db
        .update(settings)
        .set(updateData)
        .where(eq(settings.id, config.id));
    }

    const updated = await db.query.settings.findFirst();
    return c.json(updated);
  }
);

export default settingsRouter;
