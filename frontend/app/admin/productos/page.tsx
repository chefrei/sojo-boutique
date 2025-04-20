import Link from "next/link"
import Image from "next/image"
import { Edit, MoreHorizontal, Plus, Search, Trash2 } from "lucide-react"

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

export default function ProductosPage() {
  // Datos de ejemplo
  const products = [
    {
      id: 1,
      name: "Vestido Floral Primavera",
      price: 89.99,
      image: "/placeholder.svg?height=400&width=300",
      category: "Prendas",
      stock: 15,
      status: "Activo",
    },
    {
      id: 2,
      name: "Collar Perlas Elegance",
      price: 45.5,
      image: "/placeholder.svg?height=400&width=300",
      category: "Accesorios",
      stock: 8,
      status: "Activo",
    },
    {
      id: 3,
      name: "Perfume Rosa Silvestre",
      price: 75.0,
      image: "/placeholder.svg?height=400&width=300",
      category: "Perfumes",
      stock: 12,
      status: "Activo",
    },
    {
      id: 4,
      name: "Blusa Seda Premium",
      price: 65.99,
      image: "/placeholder.svg?height=400&width=300",
      category: "Prendas",
      stock: 5,
      status: "Bajo Stock",
    },
    {
      id: 5,
      name: "Aretes Cristal Dorado",
      price: 35.5,
      image: "/placeholder.svg?height=400&width=300",
      category: "Accesorios",
      stock: 0,
      status: "Agotado",
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-heading">Productos</h2>
          <p className="text-muted-foreground">Gestiona tu inventario de productos</p>
        </div>
        <Button size="sm" className="sm:size-default" asChild>
          <Link href="/admin/productos/nuevo">
            <Plus className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Nuevo Producto</span>
          </Link>
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-[300px]">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar productos..." className="pl-8" />
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          <Select defaultValue="all">
            <SelectTrigger className="w-full sm:w-[150px]">
              <SelectValue placeholder="Categoría" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="prendas">Prendas</SelectItem>
              <SelectItem value="accesorios">Accesorios</SelectItem>
              <SelectItem value="perfumes">Perfumes</SelectItem>
            </SelectContent>
          </Select>

          <Select defaultValue="all">
            <SelectTrigger className="w-full sm:w-[150px]">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="active">Activo</SelectItem>
              <SelectItem value="low">Bajo Stock</SelectItem>
              <SelectItem value="out">Agotado</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="border rounded-lg overflow-hidden overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">Imagen</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead className="hidden md:table-cell">Categoría</TableHead>
              <TableHead className="text-right">Precio</TableHead>
              <TableHead className="hidden sm:table-cell text-center">Stock</TableHead>
              <TableHead className="text-center">Estado</TableHead>
              <TableHead className="w-[70px] text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell>
                  <Image
                    src={product.image || "/placeholder.svg"}
                    alt={product.name}
                    width={50}
                    height={50}
                    className="aspect-square rounded-md object-cover"
                  />
                </TableCell>
                <TableCell className="font-medium max-w-[150px] truncate">{product.name}</TableCell>
                <TableCell className="hidden md:table-cell">{product.category}</TableCell>
                <TableCell className="text-right">${product.price.toFixed(2)}</TableCell>
                <TableCell className="hidden sm:table-cell text-center">{product.stock}</TableCell>
                <TableCell className="text-center">
                  <Badge
                    variant={
                      product.status === "Activo"
                        ? "default"
                        : product.status === "Bajo Stock"
                          ? "outline"
                          : "destructive"
                    }
                  >
                    {product.status}
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
                      <DropdownMenuItem>
                        <Edit className="mr-2 h-4 w-4" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Trash2 className="mr-2 h-4 w-4" />
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

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Mostrando <span className="font-medium">{products.length}</span> de{" "}
          <span className="font-medium">{products.length}</span> productos
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
