import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"

export function PaymentReport() {
  // Datos de ejemplo para el reporte
  const paymentsData = [
    {
      id: "PAG-001",
      fecha: "2023-05-01",
      cliente: "María González",
      monto: 150.0,
      metodo: "Efectivo",
      concepto: "Pago de deuda",
      referencia: "DEU-001",
    },
    {
      id: "PAG-002",
      fecha: "2023-05-02",
      cliente: "Laura Martínez",
      monto: 120.5,
      metodo: "Tarjeta",
      concepto: "Pago de venta",
      referencia: "VEN-002",
    },
    {
      id: "PAG-003",
      fecha: "2023-05-03",
      cliente: "Carolina Pérez",
      monto: 200.75,
      metodo: "Transferencia",
      concepto: "Pago parcial de deuda",
      referencia: "DEU-003",
    },
    {
      id: "PAG-004",
      fecha: "2023-05-04",
      cliente: "Sofía Rodríguez",
      monto: 180.25,
      metodo: "Efectivo",
      concepto: "Pago de venta",
      referencia: "VEN-004",
    },
    {
      id: "PAG-005",
      fecha: "2023-05-05",
      cliente: "Valentina López",
      monto: 95.0,
      metodo: "Tarjeta",
      concepto: "Pago de deuda",
      referencia: "DEU-005",
    },
  ]

  // Calcular totales
  const totalPagos = paymentsData.reduce((sum, payment) => sum + payment.monto, 0)

  // Datos para el gráfico de métodos de pago
  const metodosData = [
    {
      name: "Efectivo",
      value: paymentsData.filter((p) => p.metodo === "Efectivo").reduce((sum, p) => sum + p.monto, 0),
    },
    { name: "Tarjeta", value: paymentsData.filter((p) => p.metodo === "Tarjeta").reduce((sum, p) => sum + p.monto, 0) },
    {
      name: "Transferencia",
      value: paymentsData.filter((p) => p.metodo === "Transferencia").reduce((sum, p) => sum + p.monto, 0),
    },
  ]

  // Colores para el gráfico
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28"]

  return (
    <div className="space-y-6">
      <div className="text-center border-b pb-4">
        <h2 className="text-2xl font-bold">Sojo Boutique</h2>
        <h3 className="text-xl font-semibold mt-2">Reporte de Pagos</h3>
        <p className="text-muted-foreground mt-1">Período: 01/05/2023 - 05/05/2023</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Resumen de Pagos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Total Pagos:</span>
                  <span className="text-xl font-bold">${totalPagos.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium">Efectivo:</span>
                  <span className="font-semibold">${metodosData[0].value.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium">Tarjeta:</span>
                  <span className="font-semibold">${metodosData[1].value.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium">Transferencia:</span>
                  <span className="font-semibold">${metodosData[2].value.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Distribución por Método de Pago</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={metodosData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {metodosData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Método</TableHead>
              <TableHead className="text-right">Monto</TableHead>
              <TableHead>Concepto</TableHead>
              <TableHead>Referencia</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paymentsData.map((payment) => (
              <TableRow key={payment.id}>
                <TableCell>{payment.id}</TableCell>
                <TableCell>{formatDate(payment.fecha)}</TableCell>
                <TableCell>{payment.cliente}</TableCell>
                <TableCell>{payment.metodo}</TableCell>
                <TableCell className="text-right">${payment.monto.toFixed(2)}</TableCell>
                <TableCell>{payment.concepto}</TableCell>
                <TableCell>{payment.referencia}</TableCell>
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
          <p className="font-semibold">Total: ${totalPagos.toFixed(2)}</p>
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
