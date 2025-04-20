import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface IndividualSaleReportProps {
  id: string
}

export function IndividualSaleReport({ id }: IndividualSaleReportProps) {
  // Datos de ejemplo para el reporte individual
  const saleData = {
    id: id || "VEN-001",
    fecha: "2023-05-01",
    cliente: {
      nombre: "María González",
      telefono: "555-123-4567",
      email: "maria@ejemplo.com",
    },
    productos: [
      {
        id: 1,
        nombre: "Vestido Floral Primavera",
        precio: 89.99,
        cantidad: 1,
        subtotal: 89.99,
      },
      {
        id: 2,
        nombre: "Collar Perlas Elegance",
        precio: 45.5,
        cantidad: 2,
        subtotal: 91.0,
      },
      {
        id: 3,
        nombre: "Perfume Rosa Silvestre",
        precio: 75.0,
        cantidad: 1,
        subtotal: 75.0,
      },
    ],
    subtotal: 255.99,
    impuestos: 41.0,
    total: 296.99,
    metodoPago: "Efectivo",
    estado: "Completado",
    notas: "Cliente frecuente, entrega en tienda.",
  }

  return (
    <div className="space-y-6">
      <div className="text-center border-b pb-4">
        <h2 className="text-2xl font-bold">Sojo Boutique</h2>
        <h3 className="text-xl font-semibold mt-2">Detalle de Venta</h3>
        <p className="text-muted-foreground mt-1">ID: {saleData.id}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Información de la Venta</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Fecha:</span>
                <span>{formatDate(saleData.fecha)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Estado:</span>
                <Badge
                  variant={
                    saleData.estado === "Completado"
                      ? "default"
                      : saleData.estado === "Pendiente"
                        ? "outline"
                        : "destructive"
                  }
                >
                  {saleData.estado}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Método de Pago:</span>
                <span>{saleData.metodoPago}</span>
              </div>
              {saleData.notas && (
                <div className="pt-2">
                  <span className="text-muted-foreground">Notas:</span>
                  <p className="mt-1 text-sm">{saleData.notas}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Información del Cliente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Nombre:</span>
                <span>{saleData.cliente.nombre}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Teléfono:</span>
                <span>{saleData.cliente.telefono}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Email:</span>
                <span>{saleData.cliente.email}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Productos</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Producto</TableHead>
                <TableHead className="text-right">Precio</TableHead>
                <TableHead className="text-center">Cantidad</TableHead>
                <TableHead className="text-right">Subtotal</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {saleData.productos.map((producto) => (
                <TableRow key={producto.id}>
                  <TableCell>{producto.nombre}</TableCell>
                  <TableCell className="text-right">${producto.precio.toFixed(2)}</TableCell>
                  <TableCell className="text-center">{producto.cantidad}</TableCell>
                  <TableCell className="text-right">${producto.subtotal.toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="mt-4 space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal:</span>
              <span>${saleData.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Impuestos (16%):</span>
              <span>${saleData.impuestos.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-lg">
              <span>Total:</span>
              <span>${saleData.total.toFixed(2)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="border-t pt-4 flex justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Generado el: {formatDate(new Date().toISOString())}</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Sojo Boutique - Reporte de Venta</p>
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
