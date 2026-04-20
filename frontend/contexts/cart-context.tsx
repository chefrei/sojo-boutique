"use client"

import React, { createContext, useContext, useState, useEffect, useCallback } from "react"
import { apiFetch } from "@/lib/api"
import { useAuth } from "./auth-context"

export interface CartItem {
  id: number // En el backend, esto es el product_id para interactuar
  name: string
  price: number
  quantity: number
  image_url?: string
}

interface CartContextType {
  items: CartItem[]
  addItem: (item: CartItem) => Promise<boolean>
  removeItem: (id: number) => Promise<boolean>
  clearCart: () => Promise<boolean>
  updateQuantity: (id: number, quantity: number) => Promise<boolean>
  totalItems: number
  totalPrice: number
  checkout: () => Promise<{ success: boolean; error?: string }>
  isLoading: boolean
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { isAuthenticated, user, isLoading: authLoading } = useAuth()

  // Mapeamos los datos de la API a nuestro tipo local del frontend
  const loadCart = useCallback(async () => {
    if (!isAuthenticated) {
      setItems([])
      setIsLoading(false)
      return
    }
    
    try {
      setIsLoading(true)
      const data = await apiFetch<any[]>("/cart/")
      // `data` contiene id, product_id, quantity, name, price, image_url.
      // Adaptamos al frontend actual que usa `id` como `product_id`.
      const formattedItems = data.map(item => ({
        id: item.product_id, // NOTA: frontend usa `id` para referirse al product_id!
        name: item.name,
        price: Number(item.price),
        quantity: item.quantity,
        image_url: item.image_url
      }))
      setItems(formattedItems)
    } catch (e) {
      console.error("Error al cargar carrito desde el servidor:", e)
    } finally {
      setIsLoading(false)
    }
  }, [isAuthenticated])

  useEffect(() => {
    // Si la autenticacion esta cargando, esperamos
    if (authLoading) return;
    loadCart()
  }, [isAuthenticated, authLoading, loadCart])

  const addItem = async (item: CartItem) => {
    if (!isAuthenticated) return false

    // Optimistic UI update
    setItems((prev) => {
      const existing = prev.find((i) => i.id === item.id)
      if (existing) {
        return prev.map((i) => i.id === item.id ? { ...i, quantity: i.quantity + item.quantity } : i)
      }
      return [...prev, item]
    })

    try {
      await apiFetch("/cart/", {
        method: "POST",
        body: JSON.stringify({
          product_id: item.id,
          quantity: item.quantity
        })
      })
      await loadCart() // Recargar para sincronizar IDs y precios reales
      return true
    } catch (error) {
      console.error("Error al añadir item al carrito:", error)
      await loadCart() // Revert state
      return false
    }
  }

  const updateQuantity = async (id: number, quantity: number) => {
    if (!isAuthenticated) return false

    if (quantity <= 0) {
      return removeItem(id)
    }

    setItems((prev) => prev.map((i) => i.id === id ? { ...i, quantity } : i))

    try {
      await apiFetch(`/cart/${id}`, {
        method: "PUT",
        body: JSON.stringify({ quantity })
      })
      return true
    } catch (error) {
      console.error("Error al actualizar cantidad:", error)
      await loadCart()
      return false
    }
  }

  const removeItem = async (id: number) => {
    if (!isAuthenticated) return false

    setItems((prev) => prev.filter((i) => i.id !== id))

    try {
      await apiFetch(`/cart/${id}`, {
        method: "DELETE"
      })
      return true
    } catch (error) {
      console.error("Error al remover item:", error)
      await loadCart()
      return false
    }
  }

  const clearCart = async () => {
    if (!isAuthenticated) return false

    setItems([])

    try {
      await apiFetch("/cart/clear", {
        method: "DELETE"
      })
      return true
    } catch (error) {
      console.error("Error al limpiar el carrito:", error)
      await loadCart()
      return false
    }
  }

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)
  const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

  const checkout = async () => {
    if (items.length === 0 || !isAuthenticated) return { success: false, error: "Carrito vacío o no has iniciado sesión" }
    
    try {
      const orderData = {
        items: items.map((i) => ({
          product_id: i.id,
          quantity: i.quantity
        }))
      }
      
      console.log("[checkout] Sending orderData:", orderData);
      const res = await apiFetch("/orders/", {
        method: "POST",
        body: JSON.stringify(orderData)
      })
      console.log("[checkout] Order created successfully:", res);
      
      const clearRes = await clearCart()
      console.log("[checkout] clearCart result:", clearRes);
      return { success: true }
    } catch (error: any) {
      console.error("[checkout] Error al finalizar compra:", error)
      return { success: false, error: error.message || "Error desconocido al procesar el pedido" }
    }
  }

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, clearCart, updateQuantity, totalItems, totalPrice, checkout, isLoading }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
