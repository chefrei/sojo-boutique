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

export default function ClientesPage() {
  // Datos de ejemplo
  const clients = [
    {
      id: 1,
      nombre: "María González",
      telefono: "555-123-4567",
      email: "maria@ejemplo.com",
      compras: 8,
      ultimaCompra: "2023-04-15",
      deuda: 250.0,
      estado: "Activo",
    },
    {
      id: 2,
      nombre: "Laura Martínez",
      telefono: "555-234-5678",
      email: "laura@ejemplo.com",
      compras: 5,
      ultimaCompra: "2023-04-10",
      deuda: 0,
      estado: "Activo",
    },
    {
      id: 3,
      nombre: "Carolina Pérez",
      telefono: "555-345-6789",
      email: "carolina@ejemplo.com",
      compras: 12,
      ultimaCompra: "2023-03-28",
      deuda: 350.75,
      estado: "Activo",
    },
    {
      id: 4,
      nombre: "Sofía Rodríguez",
      telefono: "555-456-7890",
      email: "sofia@ejemplo.com",
      compras: 3,
      ultimaCompra: "2023-04-05",
      deuda: 180.25,
      estado: "Activo",
    },
    {
      id: 5,
      nombre: "Valentina López",
      telefono: "555-567-8901",
      email: "valentina@ejemplo.com",
      compras: 7,
      ultimaCompra: "2023-04-12",
      deuda: 0,
      estado: "Inactivo",
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-heading">Clientes</h2>
          <p className="text-muted-foreground">Gestiona la información de tus clientes</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Exportar
          </Button>
          <Button asChild>
            <Link href="/admin/clientes/nuevo">
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Cliente
            </Link>
          </Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-[300px]">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar clientes..." className="pl-8" />
        </div>

        <div className="flex gap-2 w-full md:w-auto">
          <Select defaultValue="all">
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estados</SelectItem>
              <SelectItem value="active">Activo</SelectItem>
              <SelectItem value="inactive">Inactivo</SelectItem>
            </SelectContent>
          </Select>

          <Select defaultValue="newest">
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Ordenar por" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Más recientes</SelectItem>
              <SelectItem value="oldest">Más antiguos</SelectItem>
              <SelectItem value="purchases">Más compras</SelectItem>
              <SelectItem value="debt">Mayor deuda</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Teléfono</TableHead>
              <TableHead>Email</TableHead>
              <TableHead className="text-center">Compras</TableHead>
              <TableHead>Última Compra</TableHead>
              <TableHead className="text-right">Deuda</TableHead>
              <TableHead className="text-center">Estado</TableHead>
              <TableHead className="w-[100px] text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clients.map((client) => (
              <TableRow key={client.id}>
                <TableCell className="font-medium">{client.nombre}</TableCell>
                <TableCell>{client.telefono}</TableCell>
                <TableCell>{client.email}</TableCell>
                <TableCell className="text-center">{client.compras}</TableCell>
                <TableCell>{formatDate(client.ultimaCompra)}</TableCell>
                <TableCell className="text-right">
                  {client.deuda > 0 ? (
                    <span className="text-amber-500">${client.deuda.toFixed(2)}</span>
                  ) : (
                    <span className="text-green-500">$0.00</span>
                  )}
                </TableCell>
                <TableCell className="text-center">
                  <Badge variant={client.estado === "Activo" ? "default" : "outline"}>{client.estado}</Badge>
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
                      <DropdownMenuItem>Editar</DropdownMenuItem>
                      <DropdownMenuItem>Registrar venta</DropdownMenuItem>
                      <DropdownMenuItem>Registrar pago</DropdownMenuItem>
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
