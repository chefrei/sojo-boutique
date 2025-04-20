import Link from "next/link"
import { Calendar, Edit, MoreHorizontal, Plus, Search, Trash2 } from "lucide-react"

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

export default function PedidosPage() {
  // Datos de ejemplo
  const pedidos = [
    {
      id: "PED-001",
      fecha: "2025-04-19",
      cliente: "María González",
      total: 235.98,
      estado: "Pendiente",
      productos: ["Vestido Floral Primavera", "Collar Perlas Elegance"],
    },
    {
      id: "PED-002",
      fecha: "2025-04-18",
      cliente: "Juan Pérez",
      total: 75.0,
      estado: "En Proceso",
      productos: ["Perfume Rosa Silvestre"],
    },
    {
      id: "PED-003",
      fecha: "2025-04-17",
      cliente: "Ana Martínez",
      total: 167.48,
      estado: "Completado",
      productos: ["Blusa Seda Premium", "Aretes Cristal Dorado"],
    },
    {
      id: "PED-004",
      fecha: "2025-04-16",
      cliente: "Carlos Rodríguez",
      total: 89.99,
      estado: "Cancelado",
      productos: ["Vestido Floral Primavera"],
    },
  ]

  const getStatusBadge = (status: string) => {
    const styles = {
      Pendiente: "bg-yellow-100 text-yellow-800",
      "En Proceso": "bg-blue-100 text-blue-800",
      Completado: "bg-green-100 text-green-800",
      Cancelado: "bg-red-100 text-red-800",
    }[status]

    return <Badge className={styles}>{status}</Badge>
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-heading">Pedidos</h2>
          <p className="text-muted-foreground">Gestiona los pedidos de tus clientes</p>
        </div>
        <Button size="sm" className="sm:size-default" asChild>
          <Link href="/admin/pedidos/nuevo">
            <Plus className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Nuevo Pedido</span>
          </Link>
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-[300px]">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar pedidos..." className="pl-8" />
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          <Select defaultValue="all">
            <SelectTrigger className="w-full sm:w-[150px]">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="pendiente">Pendiente</SelectItem>
              <SelectItem value="en-proceso">En Proceso</SelectItem>
              <SelectItem value="completado">Completado</SelectItem>
              <SelectItem value="cancelado">Cancelado</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Productos</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="w-[100px]">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pedidos.map((pedido) => (
              <TableRow key={pedido.id}>
                <TableCell>{pedido.id}</TableCell>
                <TableCell>{pedido.fecha}</TableCell>
                <TableCell>{pedido.cliente}</TableCell>
                <TableCell>{pedido.productos.join(", ")}</TableCell>
                <TableCell>${pedido.total.toFixed(2)}</TableCell>
                <TableCell>{getStatusBadge(pedido.estado)}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="w-4 h-4" />
                        <span className="sr-only">Abrir menú</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>
                        <Edit className="w-4 h-4 mr-2" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
