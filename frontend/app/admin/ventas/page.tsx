"use client"

import Link from "next/link"
import { Download, MoreHorizontal, Plus, Search, Loader2, FileText, FileSpreadsheet } from "lucide-react"
import { useEffect, useState } from "react"
import { apiFetch } from "@/lib/api"
import { exportToCSV, exportToPDF } from "@/lib/exportUtils"
import { useSettings } from "@/contexts/settings-context"
import { toast } from "@/components/ui/use-toast"

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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DatePickerWithRange } from "@/components/date-range-picker"

export default function VentasPage() {
  const { settings } = useSettings()
  const [sales, setSales] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadSales() {
      try {
        const data = await apiFetch<any[]>("/admin/orders")
        // Mostrar SOLO los entregados en Ventas
        const onlyDelivered = data.filter(order => 
          order.estado === "Entregado" || 
          order.status === "delivered"
        )
        setSales(onlyDelivered)
      } catch (error) {
        console.error("No se pudieron cargar las ventas", error)
      } finally {
        setIsLoading(false)
      }
    }
    loadSales()
  }, [])
  const [isUpdating, setIsUpdating] = useState<number | null>(null)

  // Calcular totales (basados en los pedidos entregados)
  const totalVentas = sales.reduce((sum, sale) => sum + Number(sale.total || sale.total_price || 0), 0)
  const ventasCompletadas = sales.filter((sale) => sale.payment_status === "paid").length
  const ventasPendientesDePago = sales.filter((sale) => sale.payment_status !== "paid").length

  async function cancelOrder(id: number) {
    if (!confirm("¿Estás seguro de anular esta venta? El stock será restaurado.")) return;
    try {
      setIsUpdating(id)
      await apiFetch(`/orders/${id}/cancel`, {
        method: "PUT"
      })
      // reload
      const data = await apiFetch<any[]>("/admin/orders")
      setSales(data)
    } catch (error: any) {
      console.error("Error al cancelar venta", error)
      alert(error.message || "No se pudo anular la venta")
    } finally {
      setIsUpdating(null)
    }
  }

  const handleExportCSV = () => {
    const headers = ["ID", "Cliente", "Fecha", "Método", "Total", "Estado"]
    const rows = sales.map(s => [
      s.id,
      s.cliente || "Consumidor Final",
      s.fecha,
      s.payment_method || "Efectivo",
      s.total,
      s.estado
    ])
    exportToCSV("ventas_soho", headers, rows)
  }

  const handleExportPDF = () => {
    const headers = ["Venta ID", "Cliente", "Fecha", "Método de Pago", "Total", "Estado"]
    const rows = sales.map(s => [
      `<b>${s.id}</b>`,
      s.cliente || "Consumidor Final",
      s.fecha,
      s.payment_method || "Efectivo",
      `$${Number(s.total).toFixed(2)}`,
      s.estado
    ])
    
    exportToPDF("Reporte de Ventas", "Listado de ventas registradas", headers, rows, toast, settings)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-heading">Ventas</h2>
          <p className="text-muted-foreground">Gestiona y analiza tus ventas</p>
        </div>
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="hidden sm:flex">
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
              <span className="hidden sm:inline">Nueva Venta</span>
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Ventas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalVentas.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Entregas Pagadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{ventasCompletadas}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Entregas con Deuda</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-500">{ventasPendientesDePago}</div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-start justify-between">
        <div className="relative w-full md:w-[300px]">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar ventas..." className="pl-8" />
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <DatePickerWithRange className="w-full md:w-auto" />

          <div className="flex gap-2 w-full sm:w-auto">
            <Select defaultValue="all">
              <SelectTrigger className="w-full sm:w-[150px]">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="paid">Pagados</SelectItem>
                <SelectItem value="pending">Pendientes de Pago</SelectItem>
              </SelectContent>
            </Select>

            <Select defaultValue="newest">
              <SelectTrigger className="w-full sm:w-[150px]">
                <SelectValue placeholder="Ordenar" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Más recientes</SelectItem>
                <SelectItem value="oldest">Más antiguos</SelectItem>
                <SelectItem value="amount-high">Mayor monto</SelectItem>
                <SelectItem value="amount-low">Menor monto</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="border rounded-lg overflow-hidden overflow-x-auto min-h-[300px]">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Cliente ID</TableHead>
                <TableHead className="hidden md:table-cell">Fecha</TableHead>
                <TableHead className="hidden sm:table-cell text-center">Productos</TableHead>
                <TableHead className="text-right">Monto</TableHead>
                <TableHead className="hidden lg:table-cell">Método</TableHead>
                <TableHead className="text-center">Estado</TableHead>
                <TableHead className="w-[70px] text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sales.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-6 text-muted-foreground">
                    No hay ventas registradas.
                  </TableCell>
                </TableRow>
              ) : (
                sales.map((sale) => (
                  <TableRow key={sale.db_id || sale.id}>
                    <TableCell>{sale.id}</TableCell>
                    <TableCell className="font-medium max-w-[120px] truncate">{sale.cliente || sale.user_id}</TableCell>
                    <TableCell className="hidden md:table-cell">{sale.fecha ? formatDate(sale.fecha) : "—"}</TableCell>
                    <TableCell className="hidden sm:table-cell text-center truncate max-w-[150px]">{(sale.productos || []).join(", ") || "--"}</TableCell>
                    <TableCell className="text-right">${Number(sale.total || sale.total_price || 0).toFixed(2)}</TableCell>
                    <TableCell className="hidden lg:table-cell">Online</TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant={
                          sale.payment_status === "paid" ? "default" : "outline"
                        }
                      >
                        {sale.payment_status === "paid" ? "PAGADO" : "CON DEUDA"}
                      </Badge>
                      <div className="text-[10px] text-muted-foreground mt-1">ENTREGADO</div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Abrir menú</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>Ver detalles</DropdownMenuItem>
                          <DropdownMenuItem>Imprimir factura</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="text-destructive font-medium"
                            onClick={() => cancelOrder(sale.db_id || sale.id)}
                            disabled={sale.estado === "Cancelado" || sale.estado === "Completado" || isUpdating === (sale.db_id || sale.id)}
                          >
                            Anular venta
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Mostrando <span className="font-medium">{sales.length}</span> de{" "}
          <span className="font-medium">{sales.length}</span> ventas
        </p>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            Anterior
          </Button>
          <Button variant="outline" size="sm">
            Siguiente
          </Button>
        </div>
      </div>
    </div>
  )
}

// Función para formatear fechas
function formatDate(dateString: string | null | undefined) {
  if (!dateString) return "—"
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return dateString
  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date)
}
