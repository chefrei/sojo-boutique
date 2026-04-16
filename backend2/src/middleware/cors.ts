/**
 * Middleware CORS para Soho Boutique API.
 * Replica la configuración de CORSMiddleware de FastAPI:
 *   allow_origins=["*"], allow_methods=["*"], allow_headers=["*"]
 */

import { cors } from "hono/cors";

export const corsMiddleware = cors({
  origin: "*",
  allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowHeaders: ["Content-Type", "Authorization"],
  credentials: true,
});
