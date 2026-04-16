"use client"

import { useState, useEffect } from "react"
import { Download, FileText, Printer, Search, Loader2, Calendar, User as UserIcon, TrendingUp } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DatePickerWithRange } from "@/components/date-range-picker"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { apiFetch } from "@/lib/api"
import { exportToPDF } from "@/lib/exportUtils"
import { useSettings } from "@/contexts/settings-context"

export default function ReportesPage() {
  const { settings } = useSettings()
  const [activeTab, setActiveTab] = useState("kardex")
  const [loading, setLoading] = useState(false)
  
  // States for Kardex (Individual)
  const [customers, setCustomers] = useState<any[]>([])
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("")
  const [kardexData, setKardexData] = useState<any>(null)

  // States for Finance (Global)
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date } | undefined>()
  const [financeData, setFinanceData] = useState<any>(null)

  useEffect(() => {
    async function loadCustomers() {
      try {
        const data = await apiFetch<any[]>("/customers")
        setCustomers(data)
      } catch (e) {
        console.error("Error loading customers", e)
      }
    }
    loadCustomers()
  }, [])

  const handleGenerateKardex = async () => {
    if (!selectedCustomerId) {
       toast({ title: "Selecciona un cliente", description: "Debes elegir un cliente para generar su historial.", variant: "destructive" })
       return
    }

    try {
      setLoading(true)
      const data = await apiFetch<any>(`/reports/customers/${selectedCustomerId}/kardex`)
      setKardexData(data)
      toast({ title: "Reporte Generado", description: "El historial del cliente se cargó correctamente." })
    } catch (e) {
      toast({ title: "Error", description: "No se pudo obtener el historial del cliente.", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateFinance = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (dateRange?.from) params.append("start_date", dateRange.from.toISOString())
      if (dateRange?.to) params.append("end_date", dateRange.to.toISOString())
      
      const data = await apiFetch<any>(`/reports/finance/summary?${params.toString()}`)
      setFinanceData(data)
      toast({ title: "Resumen Generado", description: "Los datos financieros se han consolidado." })
    } catch (e) {
      toast({ title: "Error", description: "No se pudo obtener el resumen financiero.", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const exportKardexPDF = () => {
    if (!kardexData) return
    
    const headers = ["Fecha", "Concepto", "Referencia", "Monto", "Saldo Acumulado"]
    const rows = kardexData.transactions.map((t: any) => [
      t.dateFormatted,
      t.type,
      t.reference,
      `${t.is_credit ? "-" : ""}$${t.amount.toFixed(2)}`,
      `<b>$${t.running_balance.toFixed(2)}</b>`
    ])

    exportToPDF(
      `Estado de Cuenta: ${kardexData.customer_name}`,
      `Resumen histórico de movimientos | Saldo actual: $${kardexData.current_balance.toFixed(2)}`,
      headers,
      rows,
      undefined,
      settings
    )
  }

  const exportFinancePDF = () => {
    if (!financeData) return
    
    const headers = ["Indicador", "Valor"]
    const rows = [
      ["Período Analizado", financeData.period],
      ["Total Ventas Brutas", `$${financeData.total_sales.toFixed(2)}`],
      ["Total Recaudado (Pagos)", `$${financeData.total_collected.toFixed(2)}`],
      ["Cuentas por Cobrar Pendientes (Global)", `$${financeData.total_receivable.toFixed(2)}`],
      ["Cantidad de Pedidos", financeData.order_count.toString()],
      ["Cantidad de Pagos Recibidos", financeData.payment_count.toString()]
    ]

    exportToPDF(
      "Resumen Financiero Consolidado",
      `Análisis de ingresos y ventas | Sojo Boutique Intelligence`,
      headers,
      rows,
      undefined,
      settings
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-heading">Inteligencia de Negocios</h2>
          <p className="text-muted-foreground">Analiza el rendimiento y la salud financiera de tu boutique</p>
        </div>
      </div>

      <Tabs defaultValue="kardex" onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-2 w-full max-w-md">
          <TabsTrigger value="kardex">Estado de Cuenta</TabsTrigger>
          <TabsTrigger value="finanzas">Resumen General</TabsTrigger>
        </TabsList>

        <TabsContent value="kardex">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-1 h-fit">
              <CardHeader>
                <CardTitle className="text-sm font-semibold flex items-center">
                  <UserIcon className="w-4 h-4 mr-2" />
                  Selección de Cliente
                </CardTitle>
                <CardDescription>Genera una línea de tiempo para un cliente específico.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="customer-select">Cliente</Label>
                  <Select onValueChange={setSelectedCustomerId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un cliente" />
                    </SelectTrigger>
                    <SelectContent>
                      {customers.map(c => (
                        <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button className="w-full" onClick={handleGenerateKardex} disabled={loading}>
                  {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <FileText className="w-4 h-4 mr-2" />}
                  Cargar Historial
                </Button>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2 min-h-[400px]">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Historial de Movimientos</CardTitle>
                  <CardDescription>Visualización cronológica de pedidos y pagos.</CardDescription>
                </div>
                {kardexData && (
                  <Button variant="outline" size="sm" onClick={exportKardexPDF}>
                     <Download className="w-4 h-4 mr-2" />
                     PDF
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                {!kardexData ? (
                  <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                    <Search className="w-12 h-12 mb-4 opacity-20" />
                    <p>Selecciona un cliente para ver su estado de cuenta</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 mb-4">
                       <div className="p-3 bg-muted rounded-lg">
                          <p className="text-xs text-muted-foreground uppercase">Cliente</p>
                          <p className="font-bold">{kardexData.customer_name}</p>
                       </div>
                       <div className="p-3 bg-primary/10 rounded-lg">
                          <p className="text-xs text-primary uppercase">Saldo Pendiente</p>
                          <p className="font-bold text-lg">${kardexData.current_balance.toFixed(2)}</p>
                       </div>
                    </div>
                    
                    <div className="relative border-l-2 border-muted ml-3 space-y-6 pb-4">
                       {kardexData.transactions.map((t: any, idx: number) => (
                         <div key={idx} className="relative pl-6">
                            <div className={`absolute -left-2.5 top-1.5 w-5 h-5 rounded-full border-2 border-background ${t.is_credit ? 'bg-green-500' : 'bg-primary'}`} />
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-3 rounded-lg border bg-card/50">
                               <div>
                                  <p className="text-xs text-muted-foreground">{t.dateFormatted}</p>
                                  <p className="font-medium">{t.type} <span className="text-xs text-muted-foreground ml-2">({t.reference})</span></p>
                               </div>
                               <div className="text-right mt-2 sm:mt-0">
                                  <p className={t.is_credit ? 'text-green-600 font-bold' : 'text-primary font-bold'}>
                                    {t.is_credit ? '-' : '+'}${t.amount.toFixed(2)}
                                  </p>
                                  <p className="text-[10px] text-muted-foreground italic">Saldo: ${t.running_balance.toFixed(2)}</p>
                               </div>
                            </div>
                         </div>
                       ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="finanzas">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
             <Card className="lg:col-span-1">
                <CardHeader>
                  <CardTitle className="text-sm font-semibold flex items-center">
                    <Calendar className="w-4 h-4 mr-2" />
                    Filtros de Período
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                   <div className="space-y-2">
                      <Label>Rango</Label>
                      <DatePickerWithRange onRangeChange={setDateRange} />
                   </div>
                   <Button className="w-full" onClick={handleGenerateFinance} disabled={loading}>
                      {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <TrendingUp className="w-4 h-4 mr-2" />}
                      Calcular Resumen
                   </Button>
                </CardContent>
             </Card>

             <Card className="lg:col-span-3">
                <CardHeader className="flex flex-row items-center justify-between">
                   <div>
                      <CardTitle>Consolidado Financiero</CardTitle>
                      <CardDescription>Resumen de operaciones en el período seleccionado.</CardDescription>
                   </div>
                   {financeData && (
                      <Button variant="outline" size="sm" onClick={exportFinancePDF}>
                         <Download className="w-4 h-4 mr-2" />
                         PDF
                      </Button>
                    )}
                </CardHeader>
                <CardContent>
                   {!financeData ? (
                      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                        <TrendingUp className="w-12 h-12 mb-4 opacity-20" />
                        <p>Ajusta el rango de fechas y presiona calcular</p>
                      </div>
                   ) : (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                         <div className="p-6 bg-muted/30 rounded-xl border-t-4 border-primary">
                            <p className="text-xs font-bold text-muted-foreground uppercase opacity-70">Total Vendido</p>
                            <p className="text-3xl font-heading text-primary">${financeData.total_sales.toFixed(2)}</p>
                            <p className="text-xs text-muted-foreground mt-2">{financeData.order_count} pedidos registrados</p>
                         </div>
                         <div className="p-6 bg-muted/30 rounded-xl border-t-4 border-green-500">
                            <p className="text-xs font-bold text-muted-foreground uppercase opacity-70">Total Recaudado</p>
                            <p className="text-3xl font-heading text-green-600">${financeData.total_collected.toFixed(2)}</p>
                            <p className="text-xs text-muted-foreground mt-2">{financeData.payment_count} abonos recibidos</p>
                         </div>
                         <div className="p-6 bg-muted/30 rounded-xl border-t-4 border-amber-500">
                            <p className="text-xs font-bold text-muted-foreground uppercase opacity-70">En la calle (Deuda)</p>
                            <p className="text-3xl font-heading text-amber-600">${financeData.total_receivable.toFixed(2)}</p>
                            <p className="text-xs text-muted-foreground mt-2">Saldo global por cobrar</p>
                         </div>
                         
                         <div className="md:col-span-3 mt-4">
                            <Separator className="my-4" />
                            <p className="text-sm text-center italic text-muted-foreground">
                               Período consultado: <span className="font-bold">{financeData.period}</span>
                            </p>
                         </div>
                      </div>
                   )}
                </CardContent>
             </Card>
          </div>
        </TabsContent>
      </Tabs>
      <Toaster />
    </div>
  )
}
