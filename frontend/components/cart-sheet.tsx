"use client"

import { useState } from "react"
import { ShoppingBag, Trash2, Minus, Plus, ArrowRight, Loader2, ShoppingCart } from "lucide-react"
import { useRouter } from "next/navigation"

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetFooter } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { useCart } from "@/contexts/cart-context"
import { useAuth } from "@/contexts/auth-context"
import { LoginDialog } from "./login-dialog"
import Image from "next/image"

interface CartSheetProps {
  children?: React.ReactNode
}

export function CartSheet({ children }: CartSheetProps) {
  const { items, removeItem, addItem, updateQuantity: contextUpdateQuantity, totalItems, totalPrice, clearCart, checkout } = useCart()
  const { isAuthenticated } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [showLoginDialog, setShowLoginDialog] = useState(false)
  const [isCheckingOut, setIsCheckingOut] = useState(false)
  const router = useRouter()

  const updateQuantity = (id: number, delta: number) => {
    const item = items.find((i) => i.id === id)
    if (!item) return
    const newQty = item.quantity + delta
    contextUpdateQuantity(id, newQty)
  }

  const handleOpenClick = (e: React.MouseEvent) => {
    if (!isAuthenticated) {
      e.preventDefault()
      setShowLoginDialog(true)
    }
  }

  const handleCheckout = async () => {
    setIsCheckingOut(true)
    try {
      const result = await checkout()
      if (result.success) {
        setIsOpen(false)
        toast({
          title: "✅ Pedido enviado",
          description: "Tu pedido fue registrado exitosamente. Te notificaremos cuando esté listo.",
        })
        router.push("/pedidos")
      } else {
        toast({
          title: "No se pudo realizar el pedido",
          description: result.error || "Asegúrate de tener stock suficiente e intenta de nuevo.",
          variant: "destructive",
        })
      }
    } catch {
      toast({
        title: "Error inesperado",
        description: "No se pudo completar el pedido. Intenta más tarde.",
        variant: "destructive",
      })
    } finally {
      setIsCheckingOut(false)
    }
  }

  return (
    <>
      <Sheet open={isOpen && isAuthenticated} onOpenChange={setIsOpen}>
        <SheetTrigger asChild onClick={handleOpenClick}>
          {children ?? (
            <Button variant="ghost" size="icon" className="relative group">
              <ShoppingBag className="h-5 w-5 group-hover:text-primary transition-colors" />
              {totalItems > 0 && isAuthenticated && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                  {totalItems}
                </span>
              )}
              <span className="sr-only">Carrito ({totalItems})</span>
            </Button>
          )}
        </SheetTrigger>

        <SheetContent className="flex flex-col w-full sm:max-w-[420px] p-0">
          {/* Header */}
          <SheetHeader className="px-6 pt-6 pb-4 border-b">
            <SheetTitle className="flex items-center gap-2 text-lg font-semibold">
              <ShoppingCart className="h-5 w-5" />
              Carrito de Compras
              {totalItems > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {totalItems} {totalItems === 1 ? "item" : "items"}
                </Badge>
              )}
            </SheetTitle>
          </SheetHeader>

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-6 py-4">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full gap-4 text-center py-16">
                <div className="rounded-full bg-muted p-6">
                  <ShoppingBag className="h-10 w-10 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium">Tu carrito está vacío</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Agrega productos desde el catálogo para comenzar.
                  </p>
                </div>
                <Button variant="outline" onClick={() => setIsOpen(false)} asChild>
                  <a href="/catalogo">Ver catálogo</a>
                </Button>
              </div>
            ) : (
              <ul className="space-y-4">
                {items.map((item) => (
                  <li key={item.id} className="flex gap-3">
                    {/* Imagen del producto */}
                    <div className="relative w-16 h-16 rounded-md overflow-hidden border flex-shrink-0 bg-muted">
                      {item.image_url ? (
                        <Image
                          src={item.image_url}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ShoppingBag className="h-6 w-6 text-muted-foreground" />
                        </div>
                      )}
                    </div>

                    {/* Detalle */}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm line-clamp-2">{item.name}</p>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        ${Number(item.price).toFixed(2)} c/u
                      </p>
                      {/* Controles de cantidad */}
                      <div className="flex items-center gap-1 mt-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-6 w-6 rounded"
                          onClick={() => updateQuantity(item.id, -1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-6 w-6 rounded"
                          onClick={() => updateQuantity(item.id, 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>

                    {/* Precio y eliminar */}
                    <div className="flex flex-col items-end justify-between flex-shrink-0">
                      <p className="font-semibold text-sm">
                        ${(Number(item.price) * item.quantity).toFixed(2)}
                      </p>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-destructive"
                        onClick={() => removeItem(item.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <SheetFooter className="flex-col px-6 pt-4 pb-6 border-t gap-3 sm:flex-col">
              <div className="w-full space-y-1.5 mb-2">
                <div className="flex justify-between text-base font-semibold">
                  <span>Total</span>
                  <span className="text-primary">${totalPrice.toFixed(2)}</span>
                </div>
                <p className="text-[10px] text-muted-foreground text-center">
                  Envío gratis en todos tus pedidos de Soho Boutique
                </p>
              </div>

              <div className="flex flex-col gap-2 w-full">
                <Button
                  size="lg"
                  className="w-full h-12 text-base font-bold"
                  onClick={handleCheckout}
                  disabled={isCheckingOut}
                >
                  {isCheckingOut ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Procesando...
                    </>
                  ) : (
                    <>
                      Realizar Pedido
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </>
                  )}
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full text-muted-foreground hover:text-destructive transition-colors text-xs"
                  onClick={clearCart}
                >
                  <Trash2 className="h-3 w-3 mr-2" />
                  Vaciar mi carrito
                </Button>
              </div>
            </SheetFooter>
          )}
        </SheetContent>
      </Sheet>
      
      <LoginDialog 
        open={showLoginDialog} 
        onOpenChange={setShowLoginDialog} 
        message="Inicia sesión para acceder a tu carrito de compras y guardar tus productos."
      />
      <Toaster />
    </>
  )
}
