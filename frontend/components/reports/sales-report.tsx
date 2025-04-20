import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export function SalesReport() {
  // Datos de ejemplo para el reporte
  const salesData = [
    {
      id: "VEN-001",
      fecha: "2023-05-01",
      cliente: "María González",
      productos: 3,
      monto: 250.0,
      estado: "Completado",
    },
    {
      id: "VEN-002",
      fecha: "2023-05-02",
      cliente: "Laura Martínez",
      productos: 2,
      monto: 120.5,
      estado: "Completado",
    },
    {
      id: "VEN-003",
      fecha: "2023-05-03",
      cliente: "Carolina Pérez",
      productos: 5,
      monto: 350.75,
      estado: "Pendiente",
    },
    {
      id: "VEN-004",
      fecha: "2023-05-04",
      cliente: "Sofía Rodríguez",
      productos: 1,
      monto: 180.25,
      estado: "Completado",
    },
    {
      id: "VEN-005",
      fecha: "2023-05-05",
      cliente: "Valentina López",
      productos: 2,
      monto: 95.0,
      estado: "Completado",
    },
  ]

  // Calcular totales
  const totalVentas = salesData.reduce((sum, sale) => sum + sale.monto, 0)
  const totalProductos = salesData.reduce((sum, sale) => sum + sale.productos, 0)
  const ventasCompletadas = salesData.filter((sale) => sale.estado === "Completado").length
  const ventasPendientes = salesData.filter((sale) => sale.estado === "Pendiente").length

  return (
    <div className="space-y-6">
      <div className="text-center border-b pb-4">
        <h2 className="text-2xl font-bold">Sojo Boutique</h2>
        <h3 className="text-xl font-semibold mt-2">Reporte de Ventas</h3>
        <p className="text-muted-foreground mt-1">Período: 01/05/2023 - 05/05/2023</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="py-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Ventas</CardTitle>
          </CardHeader>
          <CardContent className="py-2">
            <div className="text-2xl font-bold">${totalVentas.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="py-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Productos</CardTitle>
          </CardHeader>
          <CardContent className="py-2">
            <div className="text-2xl font-bold">{totalProductos}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="py-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Ventas Completadas</CardTitle>
          </CardHeader>
          <CardContent className="py-2">
            <div className="text-2xl font-bold text-green-600">{ventasCompletadas}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="py-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Ventas Pendientes</CardTitle>
          </CardHeader>
          <CardContent className="py-2">
            <div className="text-2xl font-bold text-amber-500">{ventasPendientes}</div>
          </CardContent>
        </Card>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead className="text-center">Productos</TableHead>
              <TableHead className="text-right">Monto</TableHead>
              <TableHead className="text-center">Estado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {salesData.map((sale) => (
              <TableRow key={sale.id}>
                <TableCell>{sale.id}</TableCell>
                <TableCell>{formatDate(sale.fecha)}</TableCell>
                <TableCell>{sale.cliente}</TableCell>
                <TableCell className="text-center">{sale.productos}</TableCell>
                <TableCell className="text-right">${sale.monto.toFixed(2)}</TableCell>
                <TableCell className="text-center">
                  <Badge
                    variant={
                      sale.estado === "Completado" ? "default" : sale.estado === "Pendiente" ? "outline" : "destructive"
                    }
                  >
                    {sale.estado}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="border-t pt-4 flex justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Generado el: {formatDate(new Date().toISOString())}</p>
        </div>
        <div className="text-right">
          <p className="font-semibold">Total: ${totalVentas.toFixed(2)}</p>
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
