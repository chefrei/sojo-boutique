/**
 * Tipos globales y bindings de Cloudflare para Soho Boutique API.
 *
 * - Env: bindings de Cloudflare Workers (D1, R2, variables).
 * - AppVariables: variables de contexto Hono (usuario actual, etc.).
 * - Enums: roles, estados de pedido y de pago.
 */

// --- Cloudflare Bindings ---

export interface Env {
  DB: D1Database;
  R2_BUCKET?: R2Bucket; // Opcional hasta que habilites R2 en Cloudflare Dashboard
  ENVIRONMENT: string;
  JWT_SECRET: string;
}

// --- Variables de contexto de Hono ---

export interface AppVariables {
  currentUser: {
    id: number;
    email: string;
    full_name: string;
    role: string;
    is_active: boolean;
  } | null;
}

// --- Enums ---

export const UserRole = {
  ADMIN: "admin",
  CLIENT: "client",
} as const;
export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export const OrderStatus = {
  PENDING: "pending",
  PAID: "paid",
  SHIPPED: "shipped",
  DELIVERED: "delivered",
  CANCELLED: "cancelled",
} as const;
export type OrderStatus = (typeof OrderStatus)[keyof typeof OrderStatus];

export const PaymentStatus = {
  PENDING: "pending",
  PARTIAL: "partial",
  PAID: "paid",
  REFUNDED: "refunded",
} as const;
export type PaymentStatus = (typeof PaymentStatus)[keyof typeof PaymentStatus];
