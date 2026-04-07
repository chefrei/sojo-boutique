"use client"

import React, { createContext, useContext, useState, useEffect } from "react"
import { apiFetch } from "@/lib/api"

export interface CartItem {
  id: number
  name: string
  price: number
  quantity: number
  image_url?: string
}

interface CartContextType {
  items: CartItem[]
  addItem: (item: CartItem) => void
  removeItem: (id: number) => void
  clearCart: () => void
  totalItems: number
  totalPrice: number
  checkout: () => Promise<boolean>
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])

  // Cargar carrito desde localStorage
  useEffect(() => {
    const savedCart = localStorage.getItem("sojo_cart")
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart))
      } catch (e) {
        console.error("Error al cargar carrito:", e)
      }
    }
  }, [])

  // Guardar carrito al cambiar
  useEffect(() => {
    localStorage.setItem("sojo_cart", JSON.stringify(items))
  }, [items])

  const addItem = (item: CartItem) => {
    setItems((prevItems) => {
      const existing = prevItems.find((i) => i.id === item.id)
      if (existing) {
        return prevItems.map((i) => 
          i.id === item.id ? { ...i, quantity: i.quantity + item.quantity } : i
        )
      }
      return [...prevItems, item]
    })
  }

  const removeItem = (id: number) => {
    setItems((prevItems) => prevItems.filter((i) => i.id !== id))
  }

  const clearCart = () => {
    setItems([])
    localStorage.removeItem("sojo_cart")
  }

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)
  const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

  const checkout = async () => {
    if (items.length === 0) return false
    
    try {
      const orderData = {
        items: items.map((i) => ({
          product_id: i.id,
          quantity: i.quantity
        }))
      }
      
      await apiFetch("/orders/", {
        method: "POST",
        body: JSON.stringify(orderData)
      })
      
      clearCart()
      return true
    } catch (error) {
      console.error("Error al finalizar compra:", error)
      return false
    }
  }

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, clearCart, totalItems, totalPrice, checkout }}>
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
