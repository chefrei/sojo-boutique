import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export function DebtReport() {
  // Datos de ejemplo para el reporte
  const debtsData = [
    {
      id: "DEU-001",
      cliente: "María González",
      fecha: "2023-04-15",
      vencimiento: "2023-05-15",
      monto: 250.0,
      pagado: 0,
      pendiente: 250.0,
      estado: "Pendiente",
    },
    {
      id: "DEU-002",
      cliente: "Laura Martínez",
      fecha: "2023-04-10",
      vencimiento: "2023-05-10",
      monto: 120.5,
      pagado: 120.5,
      pendiente: 0,
      estado: "Pagado",
    },
    {
      id: "DEU-003",
      cliente: "Carolina Pérez",
      fecha: "2023-03-28",
      vencimiento: "2023-04-28",
      monto: 350.75,
      pagado: 0,
      pendiente: 350.75,
      estado: "Vencido",
    },
    {
      id: "DEU-004",
      cliente: "Sofía Rodríguez",
      fecha: "2023-04-05",
      vencimiento: "2023-05-05",
      monto: 180.25,
      pagado: 50,
      pendiente: 130.25,
      estado: "Pendiente",
    },
    {
      id: "DEU-005",
      cliente: "Valentina López",
      fecha: "2023-04-12",
      vencimiento: "2023-05-12",
      monto: 95.0,
      pagado: 0,
      pendiente: 95.0,
      estado: "Pendiente",
    },
  ]

  // Calcular totales
  const totalDeudas = debtsData.reduce((sum, debt) => sum + debt.monto, 0)
  const totalPendiente = debtsData.reduce((sum, debt) => sum + debt.pendiente, 0)
  const totalPagado = debtsData.reduce((sum, debt) => sum + debt.pagado, 0)
  const deudasVencidas = debtsData.filter((debt) => debt.estado === "Vencido").length

  return (
    <div className="space-y-6">
      <div className="text-center border-b pb-4">
        <h2 className="text-2xl font-bold">Sojo Boutique</h2>
        <h3 className="text-xl font-semibold mt-2">Reporte de Deudas</h3>
        <p className="text-muted-foreground mt-1">Período: 01/03/2023 - 15/04/2023</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="py-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Deudas</CardTitle>
          </CardHeader>
          <CardContent className="py-2">
            <div className="text-2xl font-bold">${totalDeudas.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="py-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pendiente de Pago</CardTitle>
          </CardHeader>
          <CardContent className="py-2">
            <div className="text-2xl font-bold text-amber-500">${totalPendiente.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="py-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Pagado</CardTitle>
          </CardHeader>
          <CardContent className="py-2">
            <div className="text-2xl font-bold text-green-600">${totalPagado.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="py-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Deudas Vencidas</CardTitle>
          </CardHeader>
          <CardContent className="py-2">
            <div className="text-2xl font-bold text-destructive">{deudasVencidas}</div>
          </CardContent>
        </Card>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Vencimiento</TableHead>
              <TableHead className="text-right">Monto</TableHead>
              <TableHead className="text-right">Pagado</TableHead>
              <TableHead className="text-right">Pendiente</TableHead>
              <TableHead className="text-center">Estado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {debtsData.map((debt) => (
              <TableRow key={debt.id}>
                <TableCell>{debt.id}</TableCell>
                <TableCell>{debt.cliente}</TableCell>
                <TableCell>{formatDate(debt.fecha)}</TableCell>
                <TableCell>{formatDate(debt.vencimiento)}</TableCell>
                <TableCell className="text-right">${debt.monto.toFixed(2)}</TableCell>
                <TableCell className="text-right">${debt.pagado.toFixed(2)}</TableCell>
                <TableCell className="text-right">${debt.pendiente.toFixed(2)}</TableCell>
                <TableCell className="text-center">
                  <Badge
                    variant={
                      debt.estado === "Pagado" ? "outline" : debt.estado === "Vencido" ? "destructive" : "default"
                    }
                  >
                    {debt.estado}
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
          <p className="font-semibold">Total Pendiente: ${totalPendiente.toFixed(2)}</p>
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
