"use client"

import { useState } from "react"
import { Download, FileText, Printer, Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DatePickerWithRange } from "@/components/date-range-picker"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { ReportPreview } from "@/components/reports/report-preview"
import { SalesReport } from "@/components/reports/sales-report"
import { DebtReport } from "@/components/reports/debt-report"
import { PaymentReport } from "@/components/reports/payment-report"
import { IndividualSaleReport } from "@/components/reports/individual-sale-report"
import { IndividualDebtReport } from "@/components/reports/individual-debt-report"
import { IndividualPaymentReport } from "@/components/reports/individual-payment-report"

export default function ReportesPage() {
  const [selectedReport, setSelectedReport] = useState("ventas")
  const [reportType, setReportType] = useState("global")
  const [showPreview, setShowPreview] = useState(false)
  const [searchId, setSearchId] = useState("")
  const [selectedFormat, setSelectedFormat] = useState("pdf")
  const { toast } = useToast()

  // Función para generar el reporte
  const generateReport = () => {
    setShowPreview(true)
    toast({
      title: "Reporte generado",
      description: "El reporte ha sido generado exitosamente.",
    })
  }

  // Función para descargar el reporte
  const downloadReport = () => {
    toast({
      title: "Descargando reporte",
      description: `El reporte está siendo descargado en formato ${selectedFormat.toUpperCase()}.`,
    })
  }

  // Función para imprimir el reporte
  const printReport = () => {
    if (typeof window !== "undefined") {
      window.print()
    }
  }

  // Renderizar el componente de reporte adecuado según la selección
  const renderReportComponent = () => {
    if (reportType === "global") {
      switch (selectedReport) {
        case "ventas":
          return <SalesReport />
        case "deudas":
          return <DebtReport />
        case "pagos":
          return <PaymentReport />
        default:
          return <div>Seleccione un tipo de reporte</div>
      }
    } else {
      // Reportes individuales
      switch (selectedReport) {
        case "ventas":
          return <IndividualSaleReport id={searchId} />
        case "deudas":
          return <IndividualDebtReport id={searchId} />
        case "pagos":
          return <IndividualPaymentReport id={searchId} />
        default:
          return <div>Seleccione un tipo de reporte</div>
      }
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-heading">Reportes</h2>
        <p className="text-muted-foreground">Genera reportes detallados de tu negocio</p>
      </div>

      <Tabs defaultValue="ventas" onValueChange={setSelectedReport} className="space-y-4">
        <TabsList className="grid grid-cols-3 w-full max-w-md">
          <TabsTrigger value="ventas">Ventas</TabsTrigger>
          <TabsTrigger value="deudas">Deudas</TabsTrigger>
          <TabsTrigger value="pagos">Pagos</TabsTrigger>
        </TabsList>

        <Card>
          <CardHeader>
            <CardTitle>
              {selectedReport === "ventas" && "Reporte de Ventas"}
              {selectedReport === "deudas" && "Reporte de Deudas"}
              {selectedReport === "pagos" && "Reporte de Pagos"}
            </CardTitle>
            <CardDescription>
              {selectedReport === "ventas" && "Genera un reporte detallado de ventas por período"}
              {selectedReport === "deudas" && "Seguimiento de deudas pendientes y pagadas"}
              {selectedReport === "pagos" && "Analiza los pagos recibidos"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tipo de Reporte</Label>
                <Select defaultValue="global" onValueChange={setReportType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="global">Reporte Global</SelectItem>
                    <SelectItem value="individual">Reporte Individual</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {reportType === "individual" ? (
                <div className="space-y-2">
                  <Label htmlFor="search-id">ID de Referencia</Label>
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="search-id"
                      placeholder={`Buscar ${selectedReport === "ventas" ? "venta" : selectedReport === "deudas" ? "deuda" : "pago"} por ID`}
                      className="pl-8"
                      value={searchId}
                      onChange={(e) => setSearchId(e.target.value)}
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <Label>Rango de Fechas</Label>
                  <DatePickerWithRange className="w-full" />
                </div>
              )}
            </div>

            {reportType === "global" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Agrupar por</Label>
                  <Select defaultValue="day">
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar agrupación" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="day">Día</SelectItem>
                      <SelectItem value="week">Semana</SelectItem>
                      <SelectItem value="month">Mes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Estado</Label>
                  <Select defaultValue="all">
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      {selectedReport === "ventas" && (
                        <>
                          <SelectItem value="completed">Completado</SelectItem>
                          <SelectItem value="pending">Pendiente</SelectItem>
                        </>
                      )}
                      {selectedReport === "deudas" && (
                        <>
                          <SelectItem value="pending">Pendiente</SelectItem>
                          <SelectItem value="overdue">Vencido</SelectItem>
                          <SelectItem value="paid">Pagado</SelectItem>
                        </>
                      )}
                      {selectedReport === "pagos" && (
                        <>
                          <SelectItem value="cash">Efectivo</SelectItem>
                          <SelectItem value="card">Tarjeta</SelectItem>
                          <SelectItem value="transfer">Transferencia</SelectItem>
                        </>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            <Separator />

            <div className="space-y-2">
              <Label>Formato de Descarga</Label>
              <Select defaultValue="pdf" onValueChange={setSelectedFormat}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar formato" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="excel">Excel</SelectItem>
                  <SelectItem value="csv">CSV</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 pt-4">
              <Button className="sm:flex-1" onClick={generateReport}>
                <FileText className="mr-2 h-4 w-4" />
                Generar Reporte
              </Button>
              <Button variant="outline" className="sm:flex-1" onClick={printReport}>
                <Printer className="mr-2 h-4 w-4" />
                Imprimir
              </Button>
              <Button variant="outline" className="sm:flex-1" onClick={downloadReport}>
                <Download className="mr-2 h-4 w-4" />
                Descargar
              </Button>
            </div>
          </CardContent>
        </Card>

        {showPreview && (
          <Card className="print:shadow-none print:border-none">
            <CardHeader className="print:hidden">
              <CardTitle>Vista Previa del Reporte</CardTitle>
              <CardDescription>Previsualización del reporte generado</CardDescription>
            </CardHeader>
            <CardContent>
              <ReportPreview>{renderReportComponent()}</ReportPreview>
            </CardContent>
          </Card>
        )}
      </Tabs>
      <Toaster />
    </div>
  )
}
