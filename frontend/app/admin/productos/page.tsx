"use client"

import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Edit, MoreHorizontal, Plus, Search, Trash2, Loader2, Download, FileText, FileSpreadsheet } from "lucide-react"
import { useEffect, useState } from "react"
import { apiFetch } from "@/lib/api"
import { exportToCSV, exportToPDF } from "@/lib/exportUtils"
import { useSettings } from "@/contexts/settings-context"
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
  const { settings } = useSettings()
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
      (p.sku || "").toLowerCase().includes(search.toLowerCase()) ||
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

  // Exportar a CSV nativo
  const handleExportCSV = () => {
    const headers = ["ID", "Nombre", "Categoría", "Precio ($)", "Stock", "Estado"]
    const rows = filteredProducts.map(p => [
      p.id,
      p.name,
      p.category?.name || "Sin categoría",
      p.price,
      p.stock,
      getStatus(p.stock)
    ])
    exportToCSV("productos_soho", headers, rows)
    toast({ title: "Exportación exitosa", description: "Tu reporte de Excel se descargó." })
  }

  // Exportar a PDF genérico
  const handleExportPDF = () => {
    const titleParts = []
    if (categoryFilter !== "all") titleParts.push(`Categoría: ${categoryFilter}`)
    if (statusFilter !== "all") {
      if (statusFilter === "active") titleParts.push("Activos")
      if (statusFilter === "low") titleParts.push("Bajo Stock")
      if (statusFilter === "out") titleParts.push("Agotados")
    }
    if (search !== "") titleParts.push(`Búsqueda: "${search}"`)

    const dynamicSubtitle = titleParts.length > 0 
      ? `Filtros aplicados: ${titleParts.join(" | ")}` 
      : "Listado completo de productos"

    const headers = ["ID", "Nombre", "Categoría", "Precio", "Stock", "Estado"]
    const rows = filteredProducts.map(p => [
      p.id,
      `<b>${p.name}</b>`,
      p.category?.name || "N/A",
      `$${Number(p.price).toFixed(2)}`,
      `<b>${p.stock}</b>`,
      getStatus(p.stock)
    ])

    exportToPDF("Inventario de Productos", dynamicSubtitle, headers, rows, toast, settings)
  }


  return (
    <>
      <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-heading">Productos</h2>
          <p className="text-muted-foreground">Gestiona tu inventario de productos</p>
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
            <Link href="/admin/productos/nuevo">
              <Plus className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Nuevo Producto</span>
            </Link>
          </Button>
        </div>
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
                              width={60}
                              height={75}
                              className="aspect-boutique rounded-md object-cover border"
                            />
                          </TableCell>
                          <TableCell className="font-medium max-w-[150px] truncate">{product.name}</TableCell>
                          <TableCell className="hidden md:table-cell">{product.category?.name || "Sin categoría"}</TableCell>
                          <TableCell className="text-right">${Number(product.price).toFixed(2)}</TableCell>
                          <TableCell className="hidden sm:table-cell text-center">{product.stock}</TableCell>
                          <TableCell className="text-center">
                            <ProductStatusBadge status={status} />
                          </TableCell>
                          <TableCell className="text-right">
                            <ProductActions 
                              product={product} 
                              onEdit={() => router.push(`/admin/productos/${product.id}/editar`)}
                              onDelete={() => setProductToDelete({ id: product.id, name: product.name })}
                              isDeleting={deletingId === product.id}
                            />
                          </TableCell>
                        </TableRow>
                      )
                    })
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Vista Móvil (Cards) */}
            <div className="md:hidden divide-y">
              {filteredProducts.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground">
                  No hay productos.
                </div>
              ) : (
                filteredProducts.map((product) => {
                  const status = getStatus(product.stock)
                  return (
                    <div key={product.id} className="p-4 flex gap-4">
                      <Image
                        src={product.image_url || "/placeholder.svg"}
                        alt={product.name}
                        width={80}
                        height={100}
                        className="aspect-boutique rounded-lg object-cover border flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start gap-2">
                            <h3 className="font-bold truncate text-sm">{product.name}</h3>
                            <ProductActions 
                              product={product} 
                              onEdit={() => router.push(`/admin/productos/${product.id}/editar`)}
                              onDelete={() => setProductToDelete({ id: product.id, name: product.name })}
                              isDeleting={deletingId === product.id}
                            />
                          </div>
                          <p className="text-xs text-muted-foreground">{product.category?.name || "Sin categoría"}</p>
                        </div>
                        <div className="flex justify-between items-end mt-2">
                          <div className="space-y-1">
                            <div className="text-lg font-bold text-primary">${Number(product.price).toFixed(2)}</div>
                            <div className="text-[10px] text-muted-foreground">Stock: {product.stock}</div>
                          </div>
                          <ProductStatusBadge status={status} />
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </>
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

// Componentes auxiliares para mejorar la legibilidad y mantenimiento
function ProductStatusBadge({ status }: { status: string }) {
  return (
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
  )
}

function ProductActions({ 
  product, 
  onEdit, 
  onDelete, 
  isDeleting 
}: { 
  product: any, 
  onEdit: () => void, 
  onDelete: () => void, 
  isDeleting: boolean 
}) {
  return (
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
        <DropdownMenuItem onClick={onEdit} className="cursor-pointer">
          <Edit className="mr-2 h-4 w-4" />
          Editar
        </DropdownMenuItem>
        <DropdownMenuItem
          className="text-destructive focus:text-destructive cursor-pointer"
          disabled={isDeleting}
          onClick={onDelete}
        >
          {isDeleting ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Trash2 className="mr-2 h-4 w-4" />
          )}
          Eliminar
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
