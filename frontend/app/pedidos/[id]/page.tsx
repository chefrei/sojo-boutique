"use client"
export const runtime = 'edge'

import { useEffect, useState, use } from "react"
import { useAuth } from "@/contexts/auth-context"
import { SiteHeader } from "@/components/site-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { ShoppingBag, ArrowLeft, Loader2, Package, Calendar, Tag, CreditCard } from "lucide-react"
import Link from "next/link"
import { apiFetch } from "@/lib/api"

export default function PedidoDetallePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const orderId = resolvedParams.id
  
  const { user } = useAuth()
  const [pedido, setPedido] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  async function loadPedido() {
    try {
      const data = await apiFetch<any>(`/orders/${orderId}`)
      setPedido(data)
    } catch (err) {
      console.error("Error al cargar detalle del pedido:", err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (user) loadPedido()
  }, [user, orderId])

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col">
        <SiteHeader />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    )
  }

  if (!pedido) {
    return (
      <div className="flex min-h-screen flex-col">
        <SiteHeader />
        <div className="flex-1 flex flex-col items-center justify-center p-4 text-center">
          <Package className="h-12 w-12 text-muted-foreground mb-4 opacity-20" />
          <h2 className="text-2xl font-heading mb-2">Pedido no encontrado</h2>
          <p className="text-muted-foreground mb-6">No pudimos encontrar los detalles de este pedido.</p>
          <Button asChild><Link href="/pedidos">Volver a mis pedidos</Link></Button>
        </div>
      </div>
    )
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
      <main className="flex-1 container py-8 max-w-4xl">
        <div className="mb-6 flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild className="rounded-full">
            <Link href="/pedidos">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-heading">Detalle del Pedido</h1>
            <p className="text-muted-foreground">{pedido.reference || `#${pedido.id}`}</p>
          </div>
        </div>

        <div className="grid gap-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  Información General
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between py-1 border-b border-dashed">
                  <span className="text-sm text-muted-foreground">Fecha:</span>
                  <span className="text-sm font-medium">{new Date(pedido.created_at).toLocaleDateString("es-ES")}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-dashed">
                  <span className="text-sm text-muted-foreground">Estado:</span>
                  <Badge variant={pedido.status === "pending" ? "secondary" : "default"}>
                    {getStatusLabel(pedido.status)}
                  </Badge>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-sm text-muted-foreground">Referencia:</span>
                  <span className="text-sm font-mono">{pedido.reference || "N/A"}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-primary" />
                  Resumen de Pago
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between py-1 border-b border-dashed">
                  <span className="text-sm text-muted-foreground">Estado de Pago:</span>
                  <span className="text-sm font-medium">{pedido.payment_status === "paid" ? "Completado" : "Pendiente"}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-dashed">
                  <span className="text-sm text-muted-foreground">Pagado:</span>
                  <span className="text-sm font-medium">${Number(pedido.amount_paid).toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-sm font-bold text-slate-800">Total:</span>
                  <span className="text-lg font-bold">${Number(pedido.total_price).toFixed(2)}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <ShoppingBag className="h-5 w-5 text-primary" />
                Productos
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 sm:p-6 sm:pt-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Producto</TableHead>
                    <TableHead className="text-center">Cantidad</TableHead>
                    <TableHead className="text-right">Precio Unitario</TableHead>
                    <TableHead className="text-right">Subtotal</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pedido.items.map((item: any) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">
                        <div>
                          <div className="font-medium">{item.product_name || "Producto sin nombre"}</div>
                          <div className="text-[10px] text-muted-foreground font-mono">ID: #{item.product_id}</div>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">{item.quantity}</TableCell>
                      <TableCell className="text-right">${Number(item.unit_price).toFixed(2)}</TableCell>
                      <TableCell className="text-right font-semibold">
                        ${(Number(item.unit_price) * item.quantity).toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter className="bg-muted/30 flex justify-between items-center py-4">
               <span className="text-sm text-muted-foreground">Total del pedido</span>
               <span className="text-xl font-bold text-primary">${Number(pedido.total_price).toFixed(2)}</span>
            </CardFooter>
          </Card>
        </div>
      </main>
    </div>
  )
}
