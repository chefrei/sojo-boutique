import Link from "next/link"
import Image from "next/image"
import { ArrowDownUp, ArrowUp, ArrowDown, Search, Download } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function InventarioPage() {
  // Datos de ejemplo
  const inventario = [
    {
      id: 1,
      producto: "Vestido Floral Primavera",
      categoria: "Prendas",
      stock_actual: 15,
      stock_minimo: 5,
      movimientos: "+3 (19/04)",
      estado: "Normal",
    },
    {
      id: 2,
      producto: "Collar Perlas Elegance",
      categoria: "Accesorios",
      stock_actual: 8,
      stock_minimo: 10,
      movimientos: "-2 (18/04)",
      estado: "Bajo Stock",
    },
    {
      id: 3,
      producto: "Perfume Rosa Silvestre",
      categoria: "Perfumes",
      stock_actual: 12,
      stock_minimo: 8,
      movimientos: "+5 (17/04)",
      estado: "Normal",
    },
    {
      id: 4,
      producto: "Blusa Seda Premium",
      categoria: "Prendas",
      stock_actual: 5,
      stock_minimo: 8,
      movimientos: "-1 (16/04)",
      estado: "Bajo Stock",
    },
    {
      id: 5,
      producto: "Aretes Cristal Dorado",
      categoria: "Accesorios",
      stock_actual: 0,
      stock_minimo: 5,
      movimientos: "-3 (15/04)",
      estado: "Agotado",
    },
  ]

  const resumen = {
    total_productos: 156,
    productos_bajo_stock: 12,
    productos_agotados: 3,
    valor_inventario: 8750.45,
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      Normal: "bg-green-100 text-green-800",
      "Bajo Stock": "bg-yellow-100 text-yellow-800",
      Agotado: "bg-red-100 text-red-800",
    }[status]

    return <Badge className={styles}>{status}</Badge>
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-heading">Inventario</h2>
          <p className="text-muted-foreground">Control y seguimiento de stock</p>
        </div>
        <Button size="sm" className="sm:size-default">
          <Download className="mr-2 h-4 w-4" />
          <span className="hidden sm:inline">Exportar Reporte</span>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Productos</CardTitle>
            <ArrowDownUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{resumen.total_productos}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bajo Stock</CardTitle>
            <ArrowDown className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{resumen.productos_bajo_stock}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Agotados</CardTitle>
            <ArrowDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{resumen.productos_agotados}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
            <ArrowUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">${resumen.valor_inventario.toFixed(2)}</div>
          </CardContent>
        </Card>
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
              <SelectItem value="normal">Normal</SelectItem>
              <SelectItem value="bajo">Bajo Stock</SelectItem>
              <SelectItem value="agotado">Agotado</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Producto</TableHead>
              <TableHead>Categoría</TableHead>
              <TableHead>Stock Actual</TableHead>
              <TableHead>Stock Mínimo</TableHead>
              <TableHead>Últimos Movimientos</TableHead>
              <TableHead>Estado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {inventario.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.producto}</TableCell>
                <TableCell>{item.categoria}</TableCell>
                <TableCell>{item.stock_actual}</TableCell>
                <TableCell>{item.stock_minimo}</TableCell>
                <TableCell>{item.movimientos}</TableCell>
                <TableCell>{getStatusBadge(item.estado)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
