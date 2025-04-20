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

export default function DeudasPage() {
  // Datos de ejemplo
  const debts = [
    {
      id: 1,
      client: "María González",
      amount: 250.0,
      date: "2023-04-15",
      dueDate: "2023-05-15",
      status: "Pendiente",
      description: "Compra de vestido y accesorios",
    },
    {
      id: 2,
      client: "Laura Martínez",
      amount: 120.5,
      date: "2023-04-10",
      dueDate: "2023-05-10",
      status: "Pagado",
      description: "Compra de perfumes",
    },
    {
      id: 3,
      client: "Carolina Pérez",
      amount: 350.75,
      date: "2023-03-28",
      dueDate: "2023-04-28",
      status: "Vencido",
      description: "Compra de prendas de temporada",
    },
    {
      id: 4,
      client: "Sofía Rodríguez",
      amount: 180.25,
      date: "2023-04-05",
      dueDate: "2023-05-05",
      status: "Pendiente",
      description: "Compra de accesorios",
    },
    {
      id: 5,
      client: "Valentina López",
      amount: 95.0,
      date: "2023-04-12",
      dueDate: "2023-05-12",
      status: "Pendiente",
      description: "Compra de perfume",
    },
  ]

  // Calcular totales
  const totalPending = debts.filter((debt) => debt.status === "Pendiente").reduce((sum, debt) => sum + debt.amount, 0)

  const totalOverdue = debts.filter((debt) => debt.status === "Vencido").reduce((sum, debt) => sum + debt.amount, 0)

  const totalPaid = debts.filter((debt) => debt.status === "Pagado").reduce((sum, debt) => sum + debt.amount, 0)

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-heading">Deudas</h2>
          <p className="text-muted-foreground">Gestiona las deudas de tus clientes</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Exportar
          </Button>
          <Button asChild>
            <Link href="/admin/deudas/nueva">
              <Plus className="mr-2 h-4 w-4" />
              Nueva Deuda
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Deudas Pendientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalPending.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Deudas Vencidas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">${totalOverdue.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Deudas Pagadas (Mes Actual)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">${totalPaid.toFixed(2)}</div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-[300px]">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar por cliente..." className="pl-8" />
        </div>

        <div className="flex gap-2 w-full md:w-auto">
          <Select defaultValue="all">
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estados</SelectItem>
              <SelectItem value="pending">Pendiente</SelectItem>
              <SelectItem value="overdue">Vencido</SelectItem>
              <SelectItem value="paid">Pagado</SelectItem>
            </SelectContent>
          </Select>

          <Select defaultValue="newest">
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Ordenar por" />
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

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cliente</TableHead>
              <TableHead>Descripción</TableHead>
              <TableHead className="text-right">Monto</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Vencimiento</TableHead>
              <TableHead className="text-center">Estado</TableHead>
              <TableHead className="w-[100px] text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {debts.map((debt) => (
              <TableRow key={debt.id}>
                <TableCell className="font-medium">{debt.client}</TableCell>
                <TableCell className="max-w-[200px] truncate">{debt.description}</TableCell>
                <TableCell className="text-right">${debt.amount.toFixed(2)}</TableCell>
                <TableCell>{formatDate(debt.date)}</TableCell>
                <TableCell>{formatDate(debt.dueDate)}</TableCell>
                <TableCell className="text-center">
                  <Badge
                    variant={
                      debt.status === "Pagado" ? "outline" : debt.status === "Vencido" ? "destructive" : "default"
                    }
                  >
                    {debt.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Abrir menú</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>Ver detalles</DropdownMenuItem>
                      <DropdownMenuItem>Registrar pago</DropdownMenuItem>
                      <DropdownMenuItem>Editar</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive">Eliminar</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-end space-x-2">
        <Button variant="outline" size="sm">
          Anterior
        </Button>
        <Button variant="outline" size="sm">
          Siguiente
        </Button>
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
