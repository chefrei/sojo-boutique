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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DatePickerWithRange } from "@/components/date-range-picker"

export default function PagosPage() {
  // Datos de ejemplo
  const payments = [
    {
      id: 1,
      cliente: "María González",
      fecha: "2023-05-01",
      monto: 150.0,
      metodo: "Efectivo",
      concepto: "Pago de deuda",
      referencia: "DEU-001",
    },
    {
      id: 2,
      cliente: "Laura Martínez",
      fecha: "2023-05-02",
      monto: 120.5,
      metodo: "Tarjeta",
      concepto: "Pago de venta",
      referencia: "VEN-002",
    },
    {
      id: 3,
      cliente: "Carolina Pérez",
      fecha: "2023-05-03",
      monto: 200.75,
      metodo: "Transferencia",
      concepto: "Pago parcial de deuda",
      referencia: "DEU-003",
    },
    {
      id: 4,
      cliente: "Sofía Rodríguez",
      fecha: "2023-05-04",
      monto: 180.25,
      metodo: "Efectivo",
      concepto: "Pago de venta",
      referencia: "VEN-004",
    },
    {
      id: 5,
      cliente: "Valentina López",
      fecha: "2023-05-05",
      monto: 95.0,
      metodo: "Tarjeta",
      concepto: "Pago de deuda",
      referencia: "DEU-005",
    },
  ]

  // Calcular totales
  const totalPagos = payments.reduce((sum, payment) => sum + payment.monto, 0)
  const pagosTarjeta = payments
    .filter((payment) => payment.metodo === "Tarjeta")
    .reduce((sum, payment) => sum + payment.monto, 0)
  const pagosEfectivo = payments
    .filter((payment) => payment.metodo === "Efectivo")
    .reduce((sum, payment) => sum + payment.monto, 0)

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-heading">Pagos</h2>
          <p className="text-muted-foreground">Gestiona los pagos recibidos</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Exportar
          </Button>
          <Button asChild>
            <Link href="/admin/pagos/nuevo">
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Pago
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Pagos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalPagos.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pagos con Tarjeta</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${pagosTarjeta.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pagos en Efectivo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${pagosEfectivo.toFixed(2)}</div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-start justify-between">
        <div className="relative w-full md:w-[300px]">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar pagos..." className="pl-8" />
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <DatePickerWithRange className="w-full md:w-auto" />

          <div className="flex gap-2 w-full sm:w-auto">
            <Select defaultValue="all">
              <SelectTrigger className="w-full sm:w-[150px]">
                <SelectValue placeholder="Método" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="cash">Efectivo</SelectItem>
                <SelectItem value="card">Tarjeta</SelectItem>
                <SelectItem value="transfer">Transferencia</SelectItem>
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
              <TableHead className="text-right">Monto</TableHead>
              <TableHead className="hidden lg:table-cell">Método</TableHead>
              <TableHead className="hidden sm:table-cell">Concepto</TableHead>
              <TableHead className="hidden md:table-cell">Referencia</TableHead>
              <TableHead className="w-[70px] text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payments.map((payment) => (
              <TableRow key={payment.id}>
                <TableCell>#{payment.id.toString().padStart(4, "0")}</TableCell>
                <TableCell className="font-medium max-w-[120px] truncate">{payment.cliente}</TableCell>
                <TableCell className="hidden md:table-cell">{formatDate(payment.fecha)}</TableCell>
                <TableCell className="text-right">${payment.monto.toFixed(2)}</TableCell>
                <TableCell className="hidden lg:table-cell">{payment.metodo}</TableCell>
                <TableCell className="hidden sm:table-cell max-w-[150px] truncate">{payment.concepto}</TableCell>
                <TableCell className="hidden md:table-cell">{payment.referencia}</TableCell>
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
                      <DropdownMenuItem>Imprimir recibo</DropdownMenuItem>
                      <DropdownMenuItem>Editar</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive">Anular pago</DropdownMenuItem>
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
          Mostrando <span className="font-medium">{payments.length}</span> de{" "}
          <span className="font-medium">{payments.length}</span> pagos
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
