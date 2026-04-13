"use client"

import type React from "react"

import { createContext, useContext, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { apiFetch } from "@/lib/api"
import type { User, UserRole } from "@/lib/auth"

interface AuthContextType {
  user: User | null
  isLoading: boolean       // true solo durante la verificación inicial del token
  login: (email: string, password: string) => Promise<User | null>
  logout: () => void
  isAuthenticated: boolean
  hasRole: (role: UserRole) => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)  // para la carga inicial
  const router = useRouter()

  // Verificar token guardado al cargar la app
  useEffect(() => {
    let cancelled = false
    async function loadUser() {
      const token = typeof window !== "undefined" ? localStorage.getItem("sojo_token") : null
      if (!token) {
        setIsLoading(false)
        return
      }
      try {
        const userData = await apiFetch<User>("/auth/me")
        if (!cancelled) setUser(userData)
      } catch (error) {
        console.error("No se pudo cargar el usuario:", error)
        localStorage.removeItem("sojo_token")
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }
    loadUser()
    return () => { cancelled = true }
  }, [])

  const login = async (email: string, password: string): Promise<User | null> => {
    try {
      const formData = new URLSearchParams()
      formData.append("username", email)
      formData.append("password", password)

      // 1. Obtener token
      const data = await apiFetch<{ access_token: string }>("/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: formData,
        auth: false,
      })

      localStorage.setItem("sojo_token", data.access_token)

      // 2. Obtener datos del usuario con el nuevo token
      const userData = await apiFetch<User>("/auth/me")
      setUser(userData)
      return userData
    } catch (error) {
      console.error("Error during login:", error)
      localStorage.removeItem("sojo_token")
      return null
    }
  }

  const logout = () => {
    localStorage.removeItem("sojo_token")
    setUser(null)
    router.push("/")
  }

  const hasRole = (role: UserRole) => {
    if (!user) return false
    return user.role === role
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
