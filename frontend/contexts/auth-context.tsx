"use client"

import type React from "react"

import { createContext, useContext, useState } from "react"
import { useRouter } from "next/navigation"
import type { User, UserRole } from "@/lib/auth"
import { MOCK_USERS } from "@/lib/auth"

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  isAuthenticated: boolean
  hasRole: (role: UserRole) => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Función simplificada para desarrollo sin backend
const authenticateUser = (email: string, password: string): User | null => {
  const user = MOCK_USERS.find((u) => u.email === email && u.password === password)
  if (!user) return null

  const { password: _, ...userWithoutPassword } = user
  return userWithoutPassword
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Para desarrollo, podemos establecer un usuario predeterminado (opcional)
  // Comenta esta línea si quieres que el usuario comience sin autenticación
  const [user, setUser] = useState<User | null>(
    MOCK_USERS[0]
      ? { id: MOCK_USERS[0].id, name: MOCK_USERS[0].name, email: MOCK_USERS[0].email, role: MOCK_USERS[0].role }
      : null,
  )

  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const login = async (email: string, password: string) => {
    try {
      const userData = authenticateUser(email, password)
      if (userData) {
        setUser(userData)
        return true
      }
      return false
    } catch (error) {
      console.error("Error during login:", error)
      return false
    }
  }

  const logout = () => {
    setUser(null)
    router.push("/")
  }

  const hasRole = (role: UserRole) => {
    if (!user) return false
    if (role === "admin") return user.role === "admin"
    return true // Los clientes y administradores pueden acceder a rutas de cliente
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        logout,
        isAuthenticated: !!user,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
