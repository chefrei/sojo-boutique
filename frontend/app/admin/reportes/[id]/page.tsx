"use client"

import { useState, useRef } from "react"
import Link from "next/link"
import { ArrowLeft, Download, Printer } from "lucide-react"
import { useParams } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { IndividualSaleReport } from "@/components/reports/individual-sale-report"
import { IndividualDebtReport } from "@/components/reports/individual-debt-report"
import { IndividualPaymentReport } from "@/components/reports/individual-payment-report"
import { useToast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"

export default function ReporteDetallePage() {
  const params = useParams()
  const id = params.id as string
  const [reportType, setReportType] = useState(() => {
    // Determinar el tipo de reporte basado en el ID
    if (id.startsWith("VEN-")) return "venta"
    if (id.startsWith("DEU-")) return "deuda"
    if (id.startsWith("PAG-")) return "pago"
    return "venta" // Por defecto
  })

  const componentRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  const handlePrint = () => {
    // Usar la API nativa de impresión del navegador
    window.print()
  }

  const downloadReport = () => {
    toast({
      title: "Descargando reporte",
      description: `El reporte ${id} está siendo descargado en formato PDF.`,
    })
  }

  // Renderizar el componente de reporte adecuado según el tipo
  const renderReportComponent = () => {
    switch (reportType) {
      case "venta":
        return <IndividualSaleReport id={id} />
      case "deuda":
        return <IndividualDebtReport id={id} />
      case "pago":
        return <IndividualPaymentReport id={id} />
      default:
        return <div>Reporte no disponible</div>
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild>
            <Link href="/admin/reportes">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Volver</span>
            </Link>
          </Button>
          <h2 className="text-2xl font-heading">Reporte Detallado</h2>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" />
            Imprimir
          </Button>
          <Button onClick={downloadReport}>
            <Download className="mr-2 h-4 w-4" />
            Descargar PDF
          </Button>
        </div>
      </div>

      <Card className="print:shadow-none print:border-none">
        <CardHeader className="print:hidden">
          <CardTitle>
            {reportType === "venta" && "Detalle de Venta"}
            {reportType === "deuda" && "Detalle de Deuda"}
            {reportType === "pago" && "Comprobante de Pago"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div
            ref={componentRef}
            className="p-6 bg-white rounded-lg border min-h-[500px] print:min-h-0 print:border-none print:p-0"
          >
            {renderReportComponent()}
          </div>
        </CardContent>
      </Card>
      <Toaster />
    </div>
  )
}
