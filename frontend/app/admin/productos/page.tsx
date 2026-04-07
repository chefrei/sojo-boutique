"use client"

import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Edit, MoreHorizontal, Plus, Search, Trash2, Loader2 } from "lucide-react"
import { useEffect, useState } from "react"
import { apiFetch } from "@/lib/api"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
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
  const router = useRouter()
  const [products, setProducts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [productToDelete, setProductToDelete] = useState<{ id: number; name: string } | null>(null)
  const [search, setSearch] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")

  async function loadProducts() {
    try {
      const data = await apiFetch<any[]>("/products/")
      setProducts(data)
    } catch (error) {
      console.error("No se pudieron cargar los productos", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadProducts()
  }, [])

  async function handleDelete(id: number, name: string) {
    try {
      setDeletingId(id)
      setProductToDelete(null)
      await apiFetch(`/products/${id}`, { method: "DELETE" })
      toast({ title: "Producto eliminado", description: `"${name}" fue eliminado exitosamente.` })
      await loadProducts()
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "No se pudo eliminar el producto.", variant: "destructive" })
    } finally {
      setDeletingId(null)
    }
  }

  const getStatus = (stock: number) => {
    if (stock > 5) return "Activo"
    if (stock > 0) return "Bajo Stock"
    return "Agotado"
  }

  // Filtrado en tiempo real (client-side)
  const filteredProducts = products.filter((p) => {
    const matchesSearch = search === "" ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.category?.name || "").toLowerCase().includes(search.toLowerCase())

    const matchesCategory = categoryFilter === "all" ||
      (p.category?.name || "").toLowerCase() === categoryFilter.toLowerCase()

    const st = getStatus(p.stock)
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && st === "Activo") ||
      (statusFilter === "low" && st === "Bajo Stock") ||
      (statusFilter === "out" && st === "Agotado")

    return matchesSearch && matchesCategory && matchesStatus
  })


  return (
    <>
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
          <Input
            placeholder="Buscar productos..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
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

          <Select value={statusFilter} onValueChange={setStatusFilter}>
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

      <div className="border rounded-lg overflow-hidden overflow-x-auto min-h-[300px]">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
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
              {filteredProducts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                    {products.length === 0 ? "No hay productos todavía." : "No se encontraron productos con esos filtros."}
                  </TableCell>
                </TableRow>
              ) : (
                filteredProducts.map((product) => {
                  const status = getStatus(product.stock)
                  return (
                    <TableRow key={product.id}>
                      <TableCell>
                        <Image
                          src={product.image_url || "/placeholder.svg"}
                          alt={product.name}
                          width={50}
                          height={50}
                          className="aspect-square rounded-md object-cover"
                        />
                      </TableCell>
                      <TableCell className="font-medium max-w-[150px] truncate">{product.name}</TableCell>
                      <TableCell className="hidden md:table-cell">{product.category?.name || "Sin categoría"}</TableCell>
                      <TableCell className="text-right">${Number(product.price).toFixed(2)}</TableCell>
                      <TableCell className="hidden sm:table-cell text-center">{product.stock}</TableCell>
                      <TableCell className="text-center">
                        <Badge
                          variant={
                            status === "Activo"
                              ? "default"
                              : status === "Bajo Stock"
                                ? "outline"
                                : "destructive"
                          }
                        >
                          {status}
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
                            <DropdownMenuItem onClick={() => router.push(`/admin/productos/${product.id}/editar`)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              disabled={deletingId === product.id}
                              onClick={() => setProductToDelete({ id: product.id, name: product.name })}
                            >
                              {deletingId === product.id ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="mr-2 h-4 w-4" />
                              )}
                              Eliminar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        )}
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
    <Toaster />
    
    {/* Diálogo de confirmación de eliminación */}
    <AlertDialog open={!!productToDelete} onOpenChange={(open) => !open && setProductToDelete(null)}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Eliminar producto?</AlertDialogTitle>
          <AlertDialogDescription>
            Estás a punto de eliminar{" "}
            <span className="font-semibold text-foreground">"{productToDelete?.name}"</span>.
            <br />
            Esta acción es permanente y no se puede deshacer.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            onClick={() => productToDelete && handleDelete(productToDelete.id, productToDelete.name)}
          >
            {deletingId ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
            Sí, eliminar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </>
  )
}
