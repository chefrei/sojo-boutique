"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { SiteHeader } from "@/components/site-header"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { ShoppingBag, Heart, Settings, User, Eye, Ban } from "lucide-react"
import Link from "next/link"
import { apiFetch } from "@/lib/api"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"

export default function PedidosPage() {
  const { user } = useAuth()
  const [pedidos, setPedidos] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [orderToCancel, setOrderToCancel] = useState<number | null>(null)

  async function loadPedidos() {
    try {
      const data = await apiFetch<any[]>("/orders/me")
      setPedidos(data)
    } catch (err) {
      console.error("Error al cargar pedidos:", err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (user) loadPedidos()
  }, [user])

  const handleCancelOrder = async () => {
    if (orderToCancel === null) return
    
    try {
      await apiFetch(`/orders/${orderToCancel}/cancel`, { method: "PUT" })
      toast({ title: "Pedido cancelado", description: "Tu pedido fue cancelado exitosamente y tu carrito está limpio." })
      await loadPedidos()
    } catch (error: any) {
      toast({ title: "No se pudo cancelar", description: error.message, variant: "destructive" })
    } finally {
      setOrderToCancel(null)
    }
  }

  if (!user) {
    return null
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      "pending": "Pendiente",
      "paid": "Pagado",
      "shipped": "Enviado",
      "delivered": "Entregado",
      "cancelled": "Cancelado"
    }
    return labels[status] || status
  }

  // Verifica si el pedido está pendiente y tiene menos de 1 hora
  const canBeCancelled = (pedido: any) => {
    if (pedido.status !== "pending") return false
    const orderDate = new Date(pedido.created_at)
    const now = new Date()
    const diffHours = (now.getTime() - orderDate.getTime()) / (1000 * 60 * 60)
    return diffHours < 1
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1 container py-8">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="md:w-1/4">
            <Card>
              <CardHeader>
                <CardTitle>Mi Cuenta</CardTitle>
                <CardDescription>Gestiona tu información personal y pedidos</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <nav className="flex flex-col">
                  <Link href="/cuenta" className="flex items-center gap-2 p-3 hover:bg-muted">
                    <User className="h-4 w-4" />
                    Perfil
                  </Link>
                  <Link href="/pedidos" className="flex items-center gap-2 p-3 hover:bg-muted text-primary">
                    <ShoppingBag className="h-4 w-4" />
                    Mis Pedidos
                  </Link>
                  <Link href="/favoritos" className="flex items-center gap-2 p-3 hover:bg-muted">
                    <Heart className="h-4 w-4" />
                    Favoritos
                  </Link>
                  <Link href="/cuenta/configuracion" className="flex items-center gap-2 p-3 hover:bg-muted">
                    <Settings className="h-4 w-4" />
                    Configuración
                  </Link>
                </nav>
              </CardContent>
            </Card>
          </div>
          <div className="flex-1">
            <Card>
              <CardHeader>
                <CardTitle>Mis Pedidos</CardTitle>
                <CardDescription>Historial de tus compras</CardDescription>
              </CardHeader>
              <CardContent>
                {pedidos.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Pedido</TableHead>
                          <TableHead>Fecha</TableHead>
                          <TableHead className="text-center">Productos</TableHead>
                          <TableHead className="text-right">Total</TableHead>
                          <TableHead className="text-center">Estado</TableHead>
                          <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {pedidos.map((pedido) => (
                          <TableRow key={pedido.id}>
                            <TableCell className="font-medium">#{pedido.id}</TableCell>
                            <TableCell>{formatDate(pedido.created_at)}</TableCell>
                            <TableCell className="text-center">{pedido.items?.length || 0}</TableCell>
                            <TableCell className="text-right">${Number(pedido.total_price).toFixed(2)}</TableCell>
                            <TableCell className="text-center">
                              <Badge
                                variant={
                                  pedido.status === "delivered"
                                    ? "outline"
                                    : pedido.status === "pending"
                                      ? "secondary"
                                      : "default"
                                }
                              >
                                {getStatusLabel(pedido.status)}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                {canBeCancelled(pedido) && (
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                    onClick={() => setOrderToCancel(pedido.id)}
                                  >
                                    <Ban className="h-4 w-4 mr-1" />
                                    Cancelar
                                  </Button>
                                )}
                                <Button variant="ghost" size="sm" asChild>
                                  <Link href={`/pedidos/${pedido.id}`}>
                                    <Eye className="h-4 w-4 mr-1" />
                                    Ver
                                  </Link>
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-4">No tienes pedidos realizados</p>
                    <Button asChild>
                      <Link href="/catalogo">Explorar Catálogo</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <AlertDialog open={orderToCancel !== null} onOpenChange={(open) => !open && setOrderToCancel(null)}>
        <AlertDialogContent className="sm:max-w-md text-center border-none shadow-2xl bg-gradient-to-b from-white to-red-50/30 rounded-2xl">
          <AlertDialogHeader>
            <div className="mx-auto bg-red-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
              <Ban className="h-6 w-6 text-red-600" />
            </div>
            <AlertDialogTitle className="text-2xl font-serif text-slate-800">Cancelar Pedido</AlertDialogTitle>
            <AlertDialogDescription className="text-base text-slate-600 mt-2">
              ¿Estás seguro de que deseas cancelar este pedido? El stock volverá a estar disponible para el público.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:justify-between flex-col sm:flex-row gap-3 mt-6">
            <AlertDialogCancel className="w-full rounded-full mt-0">Mantener Pedido</AlertDialogCancel>
            <AlertDialogAction onClick={handleCancelOrder} className="w-full rounded-full shadow-md bg-red-600 hover:bg-red-700">
              Sí, Cancelar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <Toaster />
    </div>
  )
}

// Función para formatear fechas
function formatDate(dateString: string) {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date)
}
