/**
 * Entry Point — Soho Boutique API
 *
 * Aplicación Hono que registra todos los middlewares y rutas,
 * diseñada para desplegarse en Cloudflare Workers.
 */

import { Hono } from "hono";
import { corsMiddleware } from "./middleware/cors";
import { authMiddleware } from "./middleware/auth";
import type { Env, AppVariables } from "./types";

// Importar rutas
import authRoutes from "./routes/auth";
import productsRoutes from "./routes/products";
import ordersRoutes from "./routes/orders";
import adminRoutes from "./routes/admin";
import uploadRoutes from "./routes/upload";
import customersRoutes from "./routes/customers";
import cartRoutes from "./routes/cart";
import settingsRoutes from "./routes/settings";
import reportsRoutes from "./routes/reports";

const app = new Hono<{ Bindings: Env; Variables: AppVariables }>();

// ─── Middlewares Globales ───────────────────────────────

app.use("*", corsMiddleware);
app.use("*", authMiddleware);

// ─── Endpoint Raíz ─────────────────────────────────────

app.get("/", (c) => {
  return c.json({
    message: "Bienvenido a la API de Sojo Boutique",
    status: "online",
    version: "2.0.0",
    engine: "Hono + Cloudflare Workers",
  });
});

// ─── Registro de Rutas ─────────────────────────────────

app.route("/api/v1/auth", authRoutes);
app.route("/api/v1/products", productsRoutes);
app.route("/api/v1/orders", ordersRoutes);
app.route("/api/v1/admin", adminRoutes);
app.route("/api/v1/upload", uploadRoutes);
app.route("/api/v1/customers", customersRoutes);
app.route("/api/v1/cart", cartRoutes);
app.route("/api/v1/settings", settingsRoutes);
app.route("/api/v1/reports", reportsRoutes);

// ─── Error Handler Global ──────────────────────────────

app.onError((err, c) => {
  console.error(`[Error] ${err.message}`, err.stack);

  if ("status" in err && typeof err.status === "number") {
    return c.json({ detail: err.message }, err.status as any);
  }

  return c.json({ detail: "Error interno del servidor" }, 500);
});

// ─── 404 Handler ────────────────────────────────────────

app.notFound((c) => {
  return c.json({ detail: "Ruta no encontrada" }, 404);
});

export default app;
