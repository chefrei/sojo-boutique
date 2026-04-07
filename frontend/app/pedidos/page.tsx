"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { SiteHeader } from "@/components/site-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { ShoppingBag, Heart, Settings, User, Eye, Loader2 } from "lucide-react"
import Link from "next/link"
import { apiFetch } from "@/lib/api"

export default function PedidosPage() {
  const { user } = useAuth()
  const [pedidos, setPedidos] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
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
    if (user) loadPedidos()
  }, [user])

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
                              <Button variant="ghost" size="sm" asChild>
                                <Link href={`/pedidos/${pedido.id}`}>
                                  <Eye className="h-4 w-4 mr-2" />
                                  Ver
                                </Link>
                              </Button>
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
