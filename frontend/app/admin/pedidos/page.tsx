"use client"

import Link from "next/link"
import { MoreHorizontal, Plus, Search, Loader2, CheckCircle, PackageSearch } from "lucide-react"
import { useState, useEffect, useMemo } from "react"
import { apiFetch } from "@/lib/api"
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
  const [pedidos, setPedidos] = useState<OrderType[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("pendientes")
  const [isUpdating, setIsUpdating] = useState<number | null>(null)

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

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      Pendiente: "bg-yellow-100 text-yellow-800",
      "En Proceso": "bg-blue-100 text-blue-800",
      Completado: "bg-green-100 text-green-800",
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

      // By default, hide 'Completado' to only show active orders for tracking
      if (statusFilter === "pendientes") {
        return matchesSearch && p.estado !== "Completado"
      } else if (statusFilter === "completados") {
        return matchesSearch && p.estado === "Completado"
      }
      return matchesSearch
    })
  }, [pedidos, search, statusFilter])

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-heading">Pedidos Entrantes</h2>
          <p className="text-muted-foreground">Gestiona y procesa los pedidos de tus clientes para entregarlos.</p>
        </div>
        <Button size="sm" className="sm:size-default" asChild>
          <Link href="/admin/ventas/nueva">
            <Plus className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Nuevo Pedido Manual</span>
          </Link>
        </Button>
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
                <TableCell className="text-center">{getStatusBadge(pedido.estado)}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" disabled={isUpdating === pedido.db_id}>
                        {isUpdating === pedido.db_id ? (
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
                      <DropdownMenuItem onClick={() => updateOrderStatus(pedido.db_id, 'shipped')}>
                        <PackageSearch className="w-4 h-4 mr-2" />
                        Poner "En Proceso"
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => updateOrderStatus(pedido.db_id, 'delivered')} className="font-medium text-green-600">
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Marcar como "Entregado"
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            )))}
          </TableBody>
        </Table>
        )}
      </div>
      <Toaster />
    </div>
  )
}
