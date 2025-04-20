import Link from "next/link"
import { Download, MoreHorizontal, Plus, Search } from "lucide-react"

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
  // Datos de ejemplo
  const sales = [
    {
      id: 1,
      cliente: "María González",
      fecha: "2023-05-01",
      productos: 3,
      monto: 250.0,
      metodo: "Efectivo",
      estado: "Completado",
    },
    {
      id: 2,
      cliente: "Laura Martínez",
      fecha: "2023-05-02",
      productos: 2,
      monto: 120.5,
      metodo: "Tarjeta",
      estado: "Completado",
    },
    {
      id: 3,
      cliente: "Carolina Pérez",
      fecha: "2023-05-03",
      productos: 5,
      monto: 350.75,
      metodo: "Transferencia",
      estado: "Pendiente",
    },
    {
      id: 4,
      cliente: "Sofía Rodríguez",
      fecha: "2023-05-04",
      productos: 1,
      monto: 180.25,
      metodo: "Efectivo",
      estado: "Completado",
    },
    {
      id: 5,
      cliente: "Valentina López",
      fecha: "2023-05-05",
      productos: 2,
      monto: 95.0,
      metodo: "Tarjeta",
      estado: "Completado",
    },
    {
      id: 6,
      cliente: "Ana Torres",
      fecha: "2023-05-06",
      productos: 4,
      monto: 210.5,
      metodo: "Efectivo",
      estado: "Completado",
    },
    {
      id: 7,
      cliente: "Gabriela Sánchez",
      fecha: "2023-05-07",
      productos: 3,
      monto: 175.25,
      metodo: "Transferencia",
      estado: "Pendiente",
    },
  ]

  // Calcular totales
  const totalVentas = sales.reduce((sum, sale) => sum + sale.monto, 0)
  const ventasCompletadas = sales.filter((sale) => sale.estado === "Completado").length
  const ventasPendientes = sales.filter((sale) => sale.estado === "Pendiente").length

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-heading">Ventas</h2>
          <p className="text-muted-foreground">Gestiona y analiza tus ventas</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="sm:size-default">
            <Download className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Exportar</span>
          </Button>
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
            <CardTitle className="text-sm font-medium text-muted-foreground">Ventas Completadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{ventasCompletadas}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Ventas Pendientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-500">{ventasPendientes}</div>
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
                <SelectItem value="completed">Completado</SelectItem>
                <SelectItem value="pending">Pendiente</SelectItem>
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

      <div className="border rounded-lg overflow-hidden overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead className="hidden md:table-cell">Fecha</TableHead>
              <TableHead className="hidden sm:table-cell text-center">Productos</TableHead>
              <TableHead className="text-right">Monto</TableHead>
              <TableHead className="hidden lg:table-cell">Método</TableHead>
              <TableHead className="text-center">Estado</TableHead>
              <TableHead className="w-[70px] text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sales.map((sale) => (
              <TableRow key={sale.id}>
                <TableCell>#{sale.id.toString().padStart(4, "0")}</TableCell>
                <TableCell className="font-medium max-w-[120px] truncate">{sale.cliente}</TableCell>
                <TableCell className="hidden md:table-cell">{formatDate(sale.fecha)}</TableCell>
                <TableCell className="hidden sm:table-cell text-center">{sale.productos}</TableCell>
                <TableCell className="text-right">${sale.monto.toFixed(2)}</TableCell>
                <TableCell className="hidden lg:table-cell">{sale.metodo}</TableCell>
                <TableCell className="text-center">
                  <Badge
                    variant={
                      sale.estado === "Completado" ? "default" : sale.estado === "Pendiente" ? "outline" : "destructive"
                    }
                  >
                    {sale.estado}
                  </Badge>
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
                      <DropdownMenuItem>Editar</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive">Anular venta</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
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
function formatDate(dateString: string) {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date)
}
