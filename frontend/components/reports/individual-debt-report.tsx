import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface IndividualDebtReportProps {
  id: string
}

export function IndividualDebtReport({ id }: IndividualDebtReportProps) {
  // Datos de ejemplo para el reporte individual
  const debtData = {
    id: id || "DEU-001",
    fecha: "2023-04-15",
    vencimiento: "2023-05-15",
    cliente: {
      nombre: "María González",
      telefono: "555-123-4567",
      email: "maria@ejemplo.com",
    },
    descripcion: "Compra de vestido y accesorios",
    monto: 250.0,
    pagado: 100.0,
    pendiente: 150.0,
    estado: "Pendiente",
    pagos: [
      {
        id: "PAG-001",
        fecha: "2023-04-20",
        monto: 50.0,
        metodo: "Efectivo",
      },
      {
        id: "PAG-002",
        fecha: "2023-04-30",
        monto: 50.0,
        metodo: "Transferencia",
      },
    ],
    notas: "Cliente solicitó pago en cuotas mensuales.",
  }

  return (
    <div className="space-y-6">
      <div className="text-center border-b pb-4">
        <h2 className="text-2xl font-bold">Sojo Boutique</h2>
        <h3 className="text-xl font-semibold mt-2">Detalle de Deuda</h3>
        <p className="text-muted-foreground mt-1">ID: {debtData.id}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Información de la Deuda</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Fecha de Creación:</span>
                <span>{formatDate(debtData.fecha)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Fecha de Vencimiento:</span>
                <span>{formatDate(debtData.vencimiento)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Estado:</span>
                <Badge
                  variant={
                    debtData.estado === "Pagado" ? "outline" : debtData.estado === "Vencido" ? "destructive" : "default"
                  }
                >
                  {debtData.estado}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Descripción:</span>
                <span>{debtData.descripcion}</span>
              </div>
              {debtData.notas && (
                <div className="pt-2">
                  <span className="text-muted-foreground">Notas:</span>
                  <p className="mt-1 text-sm">{debtData.notas}</p>
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
                <span>{debtData.cliente.nombre}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Teléfono:</span>
                <span>{debtData.cliente.telefono}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Email:</span>
                <span>{debtData.cliente.email}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Resumen Financiero</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <Card>
                <CardHeader className="py-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Monto Total</CardTitle>
                </CardHeader>
                <CardContent className="py-2">
                  <div className="text-2xl font-bold">${debtData.monto.toFixed(2)}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="py-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Pagado</CardTitle>
                </CardHeader>
                <CardContent className="py-2">
                  <div className="text-2xl font-bold text-green-600">${debtData.pagado.toFixed(2)}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="py-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Pendiente</CardTitle>
                </CardHeader>
                <CardContent className="py-2">
                  <div className="text-2xl font-bold text-amber-500">${debtData.pendiente.toFixed(2)}</div>
                </CardContent>
              </Card>
            </div>

            <div className="pt-4">
              <h4 className="font-medium mb-2">Historial de Pagos</h4>
              {debtData.pagos.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Fecha</TableHead>
                      <TableHead className="text-right">Monto</TableHead>
                      <TableHead>Método</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {debtData.pagos.map((pago) => (
                      <TableRow key={pago.id}>
                        <TableCell>{pago.id}</TableCell>
                        <TableCell>{formatDate(pago.fecha)}</TableCell>
                        <TableCell className="text-right">${pago.monto.toFixed(2)}</TableCell>
                        <TableCell>{pago.metodo}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-muted-foreground text-sm">No hay pagos registrados.</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="border-t pt-4 flex justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Generado el: {formatDate(new Date().toISOString())}</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Sojo Boutique - Reporte de Deuda</p>
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
