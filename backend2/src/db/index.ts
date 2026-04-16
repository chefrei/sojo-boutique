/**
 * Helper para crear una instancia de Drizzle ORM desde el binding D1
 * de Cloudflare Workers.
 */

import { drizzle } from "drizzle-orm/d1";
import * as schema from "./schema";

export function createDb(d1: D1Database) {
  return drizzle(d1, { schema });
}

export type Database = ReturnType<typeof createDb>;
