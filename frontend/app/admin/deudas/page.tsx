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
import { Textarea } from "@/components/ui/textarea"

export default function DeudasPage() {
  const { settings } = useSettings()
  const [debtors, setDebtors] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  // Payment Modal State
  const [debtorToPay, setDebtorToPay] = useState<any | null>(null)
  const [paymentAmount, setPaymentAmount] = useState("")
  const [paymentMethod, setPaymentMethod] = useState("Efectivo")
  const [paymentNotes, setPaymentNotes] = useState("")
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
          method: paymentMethod,
          notes: paymentNotes || null,
        }),
      })

      toast({
        title: "Pago Registrado",
        description: `Se acreditó $${Number(paymentAmount).toFixed(2)} al cliente ${debtorToPay.full_name}.`,
      })

      setDebtorToPay(null)
      setPaymentAmount("")
      setPaymentNotes("")
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
          <>
            {/* Vista de Escritorio (Tabla) */}
            <div className="hidden md:block overflow-x-auto">
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
                          <DebtorActions 
                            debtor={debtor} 
                            onPay={() => {
                              setDebtorToPay(debtor)
                              setPaymentAmount("")
                              setPaymentNotes("")
                              setPaymentMethod("Efectivo")
                            }}
                          />
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Vista Móvil (Cards) */}
            <div className="md:hidden divide-y">
              {debtors.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground">
                  No hay clientes con deudas.
                </div>
              ) : (
                debtors.map((debtor) => (
                  <div key={debtor.id} className="p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-sm">{debtor.full_name}</h3>
                        <p className="text-[10px] text-muted-foreground truncate max-w-[200px]">{debtor.email}</p>
                      </div>
                      <DebtorActions 
                        debtor={debtor} 
                        onPay={() => {
                          setDebtorToPay(debtor)
                          setPaymentAmount("")
                          setPaymentNotes("")
                          setPaymentMethod("Efectivo")
                        }}
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div className="bg-muted/30 p-2 rounded-lg">
                        <span className="text-muted-foreground block text-[9px] uppercase">Pedidos</span>
                        <span className="font-bold">${Number(debtor.total_orders).toFixed(2)}</span>
                      </div>
                      <div className="bg-muted/30 p-2 rounded-lg text-right">
                        <span className="text-muted-foreground block text-[9px] uppercase">Pagado</span>
                        <span className="font-bold text-green-600">${Number(debtor.total_paid).toFixed(2)}</span>
                      </div>
                    </div>

                    <div className="flex justify-between items-end">
                       <div className="space-y-0.5">
                          <span className="text-[9px] text-muted-foreground uppercase block">Deuda Pendiente</span>
                          <span className="text-lg font-bold text-amber-500">${Number(debtor.balance).toFixed(2)}</span>
                       </div>
                       <Badge variant="outline" className="text-[10px]">Pendiente</Badge>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
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

      {/* Modal para Registrar Pago */}
      <Dialog open={!!debtorToPay} onOpenChange={(open) => {
        if (!open) {
          setDebtorToPay(null)
          setPaymentAmount("")
          setPaymentNotes("")
        }
      }}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Registrar Pago</DialogTitle>
            <DialogDescription>
              Acreditando pago para {debtorToPay?.full_name}. 
              {debtorToPay?.balance && debtorToPay.balance > 0 ? (
                <span className="block mt-1 font-medium text-amber-600">Deuda actual: ${Number(debtorToPay.balance).toFixed(2)}</span>
              ) : null}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="amount" className="text-right">
                Monto ($)
              </Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="method" className="text-right">
                Método
              </Label>
              <div className="col-span-3">
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger id="method">
                    <SelectValue placeholder="Selecciona un método" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Efectivo">Efectivo</SelectItem>
                    <SelectItem value="Zelle">Zelle</SelectItem>
                    <SelectItem value="Pago Movil">Pago Móvil</SelectItem>
                    <SelectItem value="Transferencia">Transferencia</SelectItem>
                    <SelectItem value="Punto de Venta">Punto de Venta</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="notes" className="text-right">
                Referencia
              </Label>
              <Textarea
                id="notes"
                placeholder="Número de referencia o notas del pago..."
                value={paymentNotes}
                onChange={(e) => setPaymentNotes(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDebtorToPay(null)} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button onClick={handleRegisterPayment} disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Guardar Pago"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function DebtorActions({ debtor, onPay }: { debtor: any, onPay: () => void }) {
  return (
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
          onClick={onPay}
        >
          Registrar pago a cuenta
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
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
