import { jwtVerify, SignJWT } from "jose"

export type UserRole = "admin" | "client"

export interface User {
  id: number
  full_name: string
  email: string
  role: UserRole
}

// Esta clave secreta debería estar en variables de entorno en producción
const JWT_SECRET = new TextEncoder().encode("soja-boutique-secret-key-change-in-production")

export async function signToken(user: Omit<User, "password">): Promise<string> {
  return new SignJWT({ ...user })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d") // El token expira en 7 días
    .sign(JWT_SECRET)
}

// Mejorar la función verifyToken para manejar mejor los errores
export async function verifyToken(token: string): Promise<User | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return payload as User
  } catch (error) {
    console.error("Error al verificar el token:", error)
    return null
  }
}

// Función para verificar si un usuario tiene acceso a una ruta protegida
export function hasAccess(user: User | null, requiredRole?: UserRole): boolean {
  if (!user) return false
  if (!requiredRole) return true
  if (requiredRole === "admin") return user.role === "admin"
  return true // Los clientes y administradores pueden acceder a rutas de cliente
}

// Datos de ejemplo para usuarios (en producción, esto vendría de una base de datos)
export const MOCK_USERS = [
  {
    id: 1,
    full_name: "Admin Usuario",
    email: "admin@sojaboutique.com",
    password: "admin123", // En producción, esto estaría hasheado
    role: "admin" as UserRole,
  },
  {
    id: 2,
    full_name: "María González",
    email: "maria@ejemplo.com",
    password: "cliente123", // En producción, esto estaría hasheado
    role: "client" as UserRole,
  },
  {
    id: 3,
    full_name: "Laura Martínez",
    email: "laura@ejemplo.com",
    password: "cliente123", // En producción, esto estaría hasheado
    role: "client" as UserRole,
  },
]

// Mejorar la función authenticateUser para ser más robusta
export async function authenticateUser(email: string, password: string): Promise<User | null> {
  try {
    const user = MOCK_USERS.find((u) => u.email === email && u.password === password)
    if (!user) return null

    const { password: _, ...userWithoutPassword } = user
    return userWithoutPassword
  } catch (error) {
    console.error("Error en la autenticación:", error)
    return null
  }
}
