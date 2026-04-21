"use client"

import Link from "next/link"
import { MoreHorizontal, Plus, Search, Loader2, CheckCircle, PackageSearch, Ban, Download, FileText, FileSpreadsheet } from "lucide-react"
import { useState, useEffect, useMemo } from "react"
import { apiFetch } from "@/lib/api"
import { exportToCSV, exportToPDF } from "@/lib/exportUtils"
import { useSettings } from "@/contexts/settings-context"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type OrderType = {
  id: string
  db_id: number
  fecha: string
  cliente: string
  total: number
  estado: string
  productos: string[]
}

export default function PedidosPage() {
  const { settings } = useSettings()
  const [pedidos, setPedidos] = useState<OrderType[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("pendientes")
  const [isUpdating, setIsUpdating] = useState<number | null>(null)
  const [orderToCancel, setOrderToCancel] = useState<number | null>(null)

  async function loadOrders() {
    try {
      const data = await apiFetch<OrderType[]>("/admin/orders")
      setPedidos(data)
    } catch (error) {
      console.error("Error al cargar pedidos", error)
      toast({ title: "Error", description: "No se pudieron cargar los pedidos.", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadOrders()
  }, [])

  async function updateOrderStatus(id: number, status: string) {
    try {
      setIsUpdating(id)
      await apiFetch(`/admin/orders/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ status })
      })
      toast({ title: "Estado actualizado", description: "El pedido ha sido actualizado correctamente." })
      await loadOrders()
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "No se pudo actualizar el estado.", variant: "destructive" })
    } finally {
      setIsUpdating(null)
    }
  }

  async function confirmCancelOrder(id: number) {
    try {
      setIsUpdating(id)
      await apiFetch(`/orders/${id}/cancel`, {
        method: "PUT"
      })
      toast({ title: "Pedido cancelado", description: "El pedido fue cancelado y el stock restaurado." })
      await loadOrders()
    } catch (error: any) {
      toast({ title: "Error al cancelar", description: error.message || "No se pudo cancelar el pedido.", variant: "destructive" })
    } finally {
      setIsUpdating(null)
      setOrderToCancel(null)
    }
  }

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      Pendiente: "bg-yellow-100 text-yellow-800",
      "En Proceso": "bg-blue-100 text-blue-800",
      Entregado: "bg-green-100 text-green-800",
      Cancelado: "bg-red-100 text-red-800",
    }

    return <Badge className={styles[status] || "bg-gray-100 text-gray-800"}>{status}</Badge>
  }

  const filteredPedidos = useMemo(() => {
    return pedidos.filter((p) => {
      const matchesSearch =
        search === "" ||
        p.cliente.toLowerCase().includes(search.toLowerCase()) ||
        p.id.toLowerCase().includes(search.toLowerCase())

      // Vista predeterminada: Solo lo que hay que gestionar (Pendiente y En Proceso)
      if (statusFilter === "pendientes") {
        return matchesSearch && (p.estado === "Pendiente" || p.estado === "En Proceso")
      } else if (statusFilter === "completados") {
        return matchesSearch && p.estado === "Entregado"
      }
      return matchesSearch
    })
  }, [pedidos, search, statusFilter])

  const handleExportCSV = () => {
    const headers = ["Pedido ID", "Cliente", "Fecha", "Productos", "Total ($)", "Estado"]
    const rows = filteredPedidos.map(p => [
      p.id,
      p.cliente,
      p.fecha,
      p.productos.join(" | "),
      p.total,
      p.estado
    ])
    exportToCSV("pedidos_sojo", headers, rows)
  }

  const handleExportPDF = () => {
    const headers = ["Pedido ID", "Cliente", "Fecha", "Productos", "Total", "Estado"]
    const rows = filteredPedidos.map(p => [
      `<b>${p.id}</b>`,
      p.cliente,
      p.fecha,
      p.productos.join(", "),
      `$${Number(p.total).toFixed(2)}`,
      p.estado
    ])
    
    let subtitle = "Todos los pedidos"
    if (statusFilter === "pendientes") subtitle = "Pedidos Pendientes y En Proceso"
    if (statusFilter === "completados") subtitle = "Pedidos Entregados"
    if (search) subtitle += ` | Búsqueda: "${search}"`

    exportToPDF("Reporte de Pedidos", subtitle, headers, rows, toast, settings)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-heading">Pedidos Entrantes</h2>
          <p className="text-muted-foreground">Gestiona y procesa los pedidos de tus clientes para entregarlos.</p>
        </div>
        <div className="flex flex-row gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="outline" className="hidden sm:flex">
                <Download className="mr-2 h-4 w-4" />
                Exportar Reporte
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Selecciona formato</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleExportPDF} className="cursor-pointer">
                <FileText className="mr-2 h-4 w-4 text-red-600" />
                Descargar PDF (Listo para imprimir)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportCSV} className="cursor-pointer">
                <FileSpreadsheet className="mr-2 h-4 w-4 text-green-600" />
                Descargar CSV (Para Excel)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button size="sm" className="sm:size-default" asChild>
            <Link href="/admin/ventas/nueva">
              <Plus className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Nuevo Pedido</span>
            </Link>
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-[300px]">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Buscar por código o cliente..." 
            className="pl-8" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Vista" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pendientes">Pendientes y Proceso</SelectItem>
              <SelectItem value="completados">Solo Entregados</SelectItem>
              <SelectItem value="todos">Todos los pedidos</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="border rounded-lg overflow-hidden min-h-[300px]">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
             <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {/* Vista de Escritorio (Tabla) */}
            <div className="hidden md:block overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead className="w-[200px]">Productos</TableHead>
                    <TableHead className="text-right">Total ($)</TableHead>
                    <TableHead className="text-center">Estado</TableHead>
                    <TableHead className="w-[100px] text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPedidos.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                          No se encontraron pedidos.
                        </TableCell>
                      </TableRow>
                  ) : (
                  filteredPedidos.map((pedido) => (
                    <TableRow key={pedido.db_id}>
                      <TableCell className="font-medium">{pedido.id}</TableCell>
                      <TableCell>{pedido.fecha}</TableCell>
                      <TableCell>{pedido.cliente}</TableCell>
                      <TableCell>
                        <div className="text-sm truncate max-w-[200px]" title={pedido.productos.join(", ")}>
                          {pedido.productos.join(", ")}
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-medium text-amber-600">${pedido.total.toFixed(2)}</TableCell>
                      <TableCell className="text-center">
                        <PedidoStatusBadge status={pedido.estado} />
                      </TableCell>
                      <TableCell className="text-right">
                        <PedidoActions 
                          pedido={pedido} 
                          onUpdate={updateOrderStatus} 
                          onCancel={() => setOrderToCancel(pedido.db_id)}
                          isUpdating={isUpdating === pedido.db_id}
                        />
                      </TableCell>
                    </TableRow>
                  )))}
                </TableBody>
              </Table>
            </div>

            {/* Vista Móvil (Cards) */}
            <div className="md:hidden divide-y">
              {filteredPedidos.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground">
                  No hay pedidos.
                </div>
              ) : (
                filteredPedidos.map((pedido) => (
                  <div key={pedido.db_id} className="p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-xs font-bold text-muted-foreground"># {pedido.id}</span>
                        <h3 className="font-bold text-sm truncate max-w-[180px]">{pedido.cliente}</h3>
                        <p className="text-[10px] text-muted-foreground">{pedido.fecha}</p>
                      </div>
                      <PedidoActions 
                        pedido={pedido} 
                        onUpdate={updateOrderStatus} 
                        onCancel={() => setOrderToCancel(pedido.db_id)}
                        isUpdating={isUpdating === pedido.db_id}
                      />
                    </div>
                    
                    <div className="bg-muted/30 p-2 rounded-lg space-y-1">
                      <div className="text-[10px] text-muted-foreground">Productos:</div>
                      <div className="text-[11px] truncate">{pedido.productos.join(", ")}</div>
                    </div>

                    <div className="flex justify-between items-center">
                      <div className="text-sm font-bold text-amber-600">${pedido.total.toFixed(2)}</div>
                      <PedidoStatusBadge status={pedido.estado} />
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>

      <AlertDialog open={!!orderToCancel} onOpenChange={(open) => !open && setOrderToCancel(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Cancelar este pedido?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción cancelará el pedido de forma permanente. 
              Los productos contenidos en este pedido volverán al stock automáticamente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Volver</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => orderToCancel && confirmCancelOrder(orderToCancel)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Sí, Cancelar Pedido
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Toaster />
    </div>
  )
}

function PedidoStatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    Pendiente: "bg-yellow-100 text-yellow-800",
    "En Proceso": "bg-blue-100 text-blue-800",
    Entregado: "bg-green-100 text-green-800",
    Cancelado: "bg-red-100 text-red-800",
  }

  return (
    <Badge className={styles[status] || "bg-gray-100 text-gray-800"}>
      {status}
    </Badge>
  )
}

function PedidoActions({ 
  pedido, 
  onUpdate, 
  onCancel, 
  isUpdating 
}: { 
  pedido: any, 
  onUpdate: (id: number, status: string) => void, 
  onCancel: () => void, 
  isUpdating: boolean 
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" disabled={isUpdating}>
          {isUpdating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
              <MoreHorizontal className="w-4 h-4" />
          )}
          <span className="sr-only">Abrir menú</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Cambiar Estado</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          onClick={() => onUpdate(pedido.db_id, 'shipped')}
          disabled={pedido.estado === "Cancelado" || pedido.estado === "Entregado"}
          className="cursor-pointer"
        >
          <PackageSearch className="w-4 h-4 mr-2" />
          Marcar "En Proceso"
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => onUpdate(pedido.db_id, 'delivered')} 
          className="font-medium text-green-600 cursor-pointer"
          disabled={pedido.estado === "Cancelado" || pedido.estado === "Entregado"}
        >
          <CheckCircle className="w-4 h-4 mr-2" />
          Marcar como "Entregado"
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          onClick={onCancel} 
          className="font-medium text-red-600 cursor-pointer"
          disabled={pedido.estado === "Entregado" || pedido.estado === "Cancelado"}
        >
          <Ban className="w-4 h-4 mr-2" />
          Cancelar Pedido
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
