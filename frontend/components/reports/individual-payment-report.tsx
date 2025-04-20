import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface IndividualPaymentReportProps {
  id: string
}

export function IndividualPaymentReport({ id }: IndividualPaymentReportProps) {
  // Datos de ejemplo para el reporte individual
  const paymentData = {
    id: id || "PAG-001",
    fecha: "2023-05-01",
    cliente: {
      nombre: "María González",
      telefono: "555-123-4567",
      email: "maria@ejemplo.com",
    },
    monto: 150.0,
    metodo: "Efectivo",
    concepto: "Pago de deuda",
    referencia: "DEU-001",
    notas: "Cliente realizó pago en tienda.",
    recibidoPor: "Ana Torres",
  }

  return (
    <div className="space-y-6">
      <div className="text-center border-b pb-4">
        <h2 className="text-2xl font-bold">Sojo Boutique</h2>
        <h3 className="text-xl font-semibold mt-2">Comprobante de Pago</h3>
        <p className="text-muted-foreground mt-1">ID: {paymentData.id}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Información del Pago</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Fecha:</span>
                <span>{formatDate(paymentData.fecha)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Monto:</span>
                <span className="font-bold">${paymentData.monto.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Método de Pago:</span>
                <span>{paymentData.metodo}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Concepto:</span>
                <span>{paymentData.concepto}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Referencia:</span>
                <span>{paymentData.referencia}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Recibido por:</span>
                <span>{paymentData.recibidoPor}</span>
              </div>
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
                <span>{paymentData.cliente.nombre}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Teléfono:</span>
                <span>{paymentData.cliente.telefono}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Email:</span>
                <span>{paymentData.cliente.email}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {paymentData.notas && (
        <Card>
          <CardHeader>
            <CardTitle>Notas Adicionales</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{paymentData.notas}</p>
          </CardContent>
        </Card>
      )}

      <div className="border-t pt-4 flex justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Generado el: {formatDate(new Date().toISOString())}</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Sojo Boutique - Comprobante de Pago</p>
        </div>
      </div>

      <div className="border-2 border-dashed p-6 text-center">
        <p className="font-medium">Este documento es un comprobante de pago válido</p>
        <p className="text-sm text-muted-foreground mt-2">Sojo Boutique - {new Date().getFullYear()}</p>
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
