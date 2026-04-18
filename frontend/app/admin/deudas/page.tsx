"use client"

import Link from "next/link"
import { Download, MoreHorizontal, Plus, Search, Loader2, FileText, FileSpreadsheet } from "lucide-react"
import { useEffect, useState } from "react"
import { apiFetch } from "@/lib/api"
import { exportToCSV, exportToPDF } from "@/lib/exportUtils"
import { useSettings } from "@/contexts/settings-context"
import { toast } from "@/components/ui/use-toast"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"

export default function DeudasPage() {
  const { settings } = useSettings()
  const [debtors, setDebtors] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  // Payment Modal State
  const [debtorToPay, setDebtorToPay] = useState<any | null>(null)
  const [paymentAmount, setPaymentAmount] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function loadDebts() {
    try {
      setIsLoading(true)
      const data = await apiFetch<any[]>("/admin/debtors")
      setDebtors(data)
    } catch (error) {
      console.error("No se pudieron cargar las deudas", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadDebts()
  }, [])
  // Calcular totales
  const totalPending = debtors.reduce((sum, d) => sum + Number(d.balance || 0), 0)
  const totalOverdue = 0 // Requiere cálculo de fechas en backend
  const totalPaid = debtors.reduce((sum, d) => sum + Number(d.total_paid || 0), 0)

  const handleExportCSV = () => {
    const headers = ["Cliente", "Email", "Pedidos Realizados ($)", "Monto Pagado ($)", "Deuda Restante ($)", "Estado"]
    const rows = debtors.map(d => [
      d.full_name,
      d.email || "—",
      d.total_orders,
      d.total_paid,
      d.balance,
      "Pendiente"
    ])
    exportToCSV("deudas_soho", headers, rows)
  }

  const handleExportPDF = () => {
    const headers = ["Cliente", "Email", "Pedidos", "Pagado", "Deuda", "Estado"]
    const rows = debtors.map(d => [
      `<b>${d.full_name}</b>`,
      d.email || "—",
      `$${Number(d.total_orders).toFixed(2)}`,
      `$${Number(d.total_paid).toFixed(2)}`,
      `$${Number(d.balance).toFixed(2)}`,
      "Deudor"
    ])
    
    exportToPDF("Reporte de Deudas", "Estado de cuenta por cobrar", headers, rows, toast, settings)
  }

  const handleRegisterPayment = async () => {
    if (!debtorToPay || !paymentAmount || Number(paymentAmount) <= 0) return

    try {
      setIsSubmitting(true)
      await apiFetch("/admin/payments", {
        method: "POST",
        body: JSON.stringify({
          user_id: debtorToPay.id,
          amount: Number(paymentAmount),
          method: "cash", // o transfer, lo manejamos genérico por ahora
          notes: "Abono rápido a cuenta desde listado de deudas",
        }),
      })

      toast({
        title: "Pago registrado",
        description: `Se han abonado $${paymentAmount} a la cuenta de ${debtorToPay.full_name}.`,
      })

      setDebtorToPay(null)
      setPaymentAmount("")
      await loadDebts()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo registrar el pago.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-heading">Deudas</h2>
          <p className="text-muted-foreground">Gestiona las deudas de tus clientes</p>
        </div>
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="hidden sm:flex">
                <Download className="mr-2 h-4 w-4" />
                Exportar Reporte
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Selecciona formato</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleExportPDF} className="cursor-pointer">
                <FileText className="mr-2 h-4 w-4 text-red-600" />
                Descargar PDF (Listo para imprimir)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportCSV} className="cursor-pointer">
                <FileSpreadsheet className="mr-2 h-4 w-4 text-green-600" />
                Descargar CSV (Para Excel)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button asChild variant="outline">
            <Link href="/admin/pagos">
              <Plus className="mr-2 h-4 w-4" />
              Registrar Cobro
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Deudas Pendientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalPending.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Deudas Vencidas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">${totalOverdue.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Deudas Pagadas (Mes Actual)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">${totalPaid.toFixed(2)}</div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-[300px]">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar por cliente..." className="pl-8" />
        </div>

        <div className="flex gap-2 w-full md:w-auto">
          <Select defaultValue="all">
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estados</SelectItem>
              <SelectItem value="pending">Pendiente</SelectItem>
              <SelectItem value="overdue">Vencido</SelectItem>
              <SelectItem value="paid">Pagado</SelectItem>
            </SelectContent>
          </Select>

          <Select defaultValue="newest">
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Ordenar por" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Más recientes</SelectItem>
              <SelectItem value="oldest">Más antiguos</SelectItem>
              <SelectItem value="amount-high">Mayor monto</SelectItem>
              <SelectItem value="amount-low">Menor monto</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="border rounded-lg overflow-hidden min-h-[300px]">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Email</TableHead>
                <TableHead className="text-right">Pedidos</TableHead>
                <TableHead className="text-right">Pagado</TableHead>
                <TableHead className="text-right">Deuda Restante</TableHead>
                <TableHead className="text-center">Estado</TableHead>
                <TableHead className="w-[100px] text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {debtors.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                    No hay clientes con deudas.
                  </TableCell>
                </TableRow>
              ) : (
                debtors.map((debtor) => (
                  <TableRow key={debtor.id}>
                    <TableCell className="font-medium">{debtor.full_name}</TableCell>
                    <TableCell className="max-w-[200px] truncate">{debtor.email}</TableCell>
                    <TableCell className="text-right">${Number(debtor.total_orders).toFixed(2)}</TableCell>
                    <TableCell className="text-right text-green-600">${Number(debtor.total_paid).toFixed(2)}</TableCell>
                    <TableCell className="text-right font-bold text-amber-500">${Number(debtor.balance).toFixed(2)}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline">
                        Pendiente
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Abrir menú</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem asChild className="cursor-pointer">
                            <Link href={`/admin/clientes/${debtor.id}`}>Ver historial</Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="cursor-pointer"
                            onClick={() => {
                              setDebtorToPay(debtor)
                              setPaymentAmount("")
                            }}
                          >
                            Registrar pago a cuenta
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </div>

      <div className="flex items-center justify-end space-x-2">
        <Button variant="outline" size="sm">
          Anterior
        </Button>
        <Button variant="outline" size="sm">
          Siguiente
        </Button>
      </div>

      {/* Payment Modal */}
      <Dialog open={!!debtorToPay} onOpenChange={(open) => !open && setDebtorToPay(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Registrar Pago</DialogTitle>
            <DialogDescription>
              Abonar a la cuenta de <span className="font-semibold">{debtorToPay?.full_name}</span>.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Deuda Actual:</span>
              <span className="font-bold text-amber-500">${Number(debtorToPay?.balance || 0).toFixed(2)}</span>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="amount">Monto a abonar ($)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setDebtorToPay(null)} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button onClick={handleRegisterPayment} disabled={isSubmitting || !paymentAmount || Number(paymentAmount) <= 0}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Guardar Pago
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Función para formatear fechas
function formatDate(dateString: string | null | undefined) {
  if (!dateString) return "—"
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return dateString
  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date)
}
