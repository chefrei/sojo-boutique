"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { Download, MoreHorizontal, Plus, Search, Loader2, Trash2, DollarSign, FileText, FileSpreadsheet } from "lucide-react"
import { useState, useEffect, useMemo } from "react"
import { apiFetch } from "@/lib/api"
import { exportToCSV, exportToPDF } from "@/lib/exportUtils"
import { useSettings } from "@/contexts/settings-context"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"

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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export default function ClientesPage() {
  const router = useRouter()
  const { settings } = useSettings()
  const [clients, setClients] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sortBy, setSortBy] = useState("newest")
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [clientToDelete, setClientToDelete] = useState<{ id: number; name: string } | null>(null)

  // Payment Modal State
  const [paymentClient, setPaymentClient] = useState<{ id: number; name: string; debt: number } | null>(null)
  const [paymentAmount, setPaymentAmount] = useState("")
  const [paymentMethod, setPaymentMethod] = useState("Efectivo")
  const [paymentNotes, setPaymentNotes] = useState("")
  const [isSubmittingPayment, setIsSubmittingPayment] = useState(false)

  async function loadClients() {
    try {
      const data = await apiFetch<any[]>("/customers/")
      setClients(data)
    } catch (error) {
      console.error("Error al cargar clientes", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadClients()
  }, [])

  async function handleDelete(id: number, name: string) {
    try {
      setDeletingId(id)
      setClientToDelete(null)
      await apiFetch(`/customers/${id}`, { method: "DELETE" })
      toast({ title: "Cliente eliminado", description: `"${name}" fue eliminado exitosamente.` })
      await loadClients()
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "No se pudo eliminar el cliente.", variant: "destructive" })
    } finally {
      setDeletingId(null)
    }
  }

  async function handlePaymentSubmit() {
    if (!paymentClient) return
    const amountNum = parseFloat(paymentAmount)
    if (isNaN(amountNum) || amountNum <= 0) {
      toast({ title: "Error", description: "Por favor, ingresa un monto válido mayor a 0.", variant: "destructive" })
      return
    }

    try {
      setIsSubmittingPayment(true)
      await apiFetch("/admin/payments", {
        method: "POST",
        body: JSON.stringify({
          user_id: paymentClient.id,
          amount: amountNum,
          method: paymentMethod,
          notes: paymentNotes || null
        })
      })

      toast({ title: "Pago Registrado", description: `Se acreditó $${amountNum.toFixed(2)} al cliente ${paymentClient.name}.` })
      setPaymentClient(null)
      setPaymentAmount("")
      setPaymentNotes("")
      await loadClients() // recargar lista para ver deuda reducida
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Ocurrió un problema guardando el pago.", variant: "destructive" })
    } finally {
      setIsSubmittingPayment(false)
    }
  }

  const filteredClients = useMemo(() => {
    let result = clients.filter((c) => {
      const matchesSearch =
        search === "" ||
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.email.toLowerCase().includes(search.toLowerCase()) ||
        c.phone.includes(search)

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && c.status === "active") ||
        (statusFilter === "inactive" && c.status === "inactive")

      return matchesSearch && matchesStatus
    })

    if (sortBy === "purchases") {
      result.sort((a, b) => b.compras - a.compras)
    } else if (sortBy === "debt") {
      result.sort((a, b) => b.deuda - a.deuda)
    } else if (sortBy === "oldest") {
      result.sort((a, b) => a.id - b.id)
    } else {
      // newest
      result.sort((a, b) => b.id - a.id)
    }

    return result
  }, [clients, search, statusFilter, sortBy])

  const handleExportCSV = () => {
    const headers = ["Nombre", "Teléfono", "Email", "Ventas", "Última Compra", "Deuda ($)", "Estado"]
    const rows = filteredClients.map(c => [
      c.name,
      c.phone || "—",
      c.email || "—",
      c.compras,
      c.ultimaCompra ? formatDate(c.ultimaCompra) : "—",
      c.deuda,
      c.status === "active" ? "Activo" : "Inactivo"
    ])
    exportToCSV("clientes_soho", headers, rows)
  }

  const handleExportPDF = () => {
    const headers = ["Nombre", "Teléfono", "Email", "Ventas", "Última Compra", "Deuda", "Estado"]
    const rows = filteredClients.map(c => [
      `<b>${c.name}</b>`,
      c.phone || "—",
      c.email || "—",
      `${c.compras}`,
      c.ultimaCompra ? formatDate(c.ultimaCompra) : "—",
      c.deuda > 0 ? `$${Number(c.deuda).toFixed(2)}` : "$0.00",
      c.status === "active" ? "Activo" : "Inactivo"
    ])
    
    let subtitle = "Todos los clientes"
    if (statusFilter === "active") subtitle = "Clientes Activos"
    if (statusFilter === "inactive") subtitle = "Clientes Inactivos"
    if (search) subtitle += ` | Búsqueda: "${search}"`

    exportToPDF("Reporte de Clientes", subtitle, headers, rows, toast, settings)
  }

  return (
    <>
      <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-heading">Clientes</h2>
          <p className="text-muted-foreground">Gestiona la información de tus clientes</p>
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

          <Button asChild>
            <Link href="/admin/clientes/nuevo">
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Cliente
            </Link>
          </Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-[300px]">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Buscar clientes..." 
            className="pl-8" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex gap-2 w-full md:w-auto">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estados</SelectItem>
              <SelectItem value="active">Activo</SelectItem>
              <SelectItem value="inactive">Inactivo</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Ordenar por" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Más recientes</SelectItem>
              <SelectItem value="oldest">Más antiguos</SelectItem>
              <SelectItem value="purchases">Más compras (Ventas)</SelectItem>
              <SelectItem value="debt">Mayor deuda</SelectItem>
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
              <TableHead>Nombre</TableHead>
              <TableHead>Teléfono</TableHead>
              <TableHead>Email</TableHead>
              <TableHead className="text-center">Ventas</TableHead>
              <TableHead>Última Compra</TableHead>
              <TableHead className="text-right">Deuda</TableHead>
              <TableHead className="text-center">Estado</TableHead>
              <TableHead className="w-[100px] text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredClients.length === 0 ? (
               <TableRow>
                 <TableCell colSpan={8} className="text-center py-6 text-muted-foreground">
                   {clients.length === 0 ? "No hay clientes todavía." : "No se encontraron clientes con esos filtros."}
                 </TableCell>
               </TableRow>
             ) : (
            filteredClients.map((client) => (
              <TableRow key={client.id}>
                <TableCell className="font-medium">{client.name}</TableCell>
                <TableCell>{client.phone || "—"}</TableCell>
                <TableCell>{client.email || "—"}</TableCell>
                <TableCell className="text-center">{client.compras}</TableCell>
                <TableCell>{client.ultimaCompra ? formatDate(client.ultimaCompra) : "—"}</TableCell>
                <TableCell className="text-right">
                  {client.deuda > 0 ? (
                    <span className="text-amber-500 font-medium">${Number(client.deuda).toFixed(2)}</span>
                  ) : (
                    <span className="text-green-500 font-medium">$0.00</span>
                  )}
                </TableCell>
                <TableCell className="text-center">
                  <Badge variant={client.status === "active" ? "default" : "outline"}>
                    {client.status === "active" ? "Activo" : "Inactivo"}
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
                      <DropdownMenuItem onClick={() => router.push(`/admin/clientes/${client.id}`)}>Ver detalles</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => router.push(`/admin/clientes/${client.id}/editar`)}>Editar</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => router.push(`/admin/ventas/nueva?cliente=${client.id}`)}>Registrar venta</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setPaymentClient({ id: client.id, name: client.name, debt: client.deuda })}>
                        <DollarSign className="mr-2 h-4 w-4" />
                        Registrar Pago
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        className="text-destructive focus:text-destructive"
                        disabled={deletingId === client.id}
                        onClick={() => setClientToDelete({ id: client.id, name: client.name })}
                      >
                        {deletingId === client.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                        Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            )))}
          </TableBody>
        </Table>
        )}
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Mostrando <span className="font-medium">{filteredClients.length}</span> clientes
        </p>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">Anterior</Button>
          <Button variant="outline" size="sm">Siguiente</Button>
        </div>
      </div>
      </div>
      
      <Toaster />

      {/* Diálogo de confirmación de eliminación */}
      <AlertDialog open={!!clientToDelete} onOpenChange={(open) => !open && setClientToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar cliente?</AlertDialogTitle>
            <AlertDialogDescription>
              Estás a punto de eliminar al cliente{" "}
              <span className="font-semibold text-foreground">"{clientToDelete?.name}"</span>.
              <br />
              Esta acción es permanente y no se puede deshacer. No podrás eliminarlo si tiene compras registradas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => clientToDelete && handleDelete(clientToDelete.id, clientToDelete.name)}
            >
              {deletingId ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
              Sí, eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Modal para Registrar Pago */}
      <Dialog open={!!paymentClient} onOpenChange={(open) => {
        if (!open) {
          setPaymentClient(null)
          setPaymentAmount("")
          setPaymentNotes("")
        }
      }}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Registrar Pago</DialogTitle>
            <DialogDescription>
              Acreditando pago para {paymentClient?.name}. 
              {paymentClient?.debt && paymentClient.debt > 0 ? (
                <span className="block mt-1 font-medium text-amber-600">Deuda actual: ${Number(paymentClient.debt).toFixed(2)}</span>
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
            <Button variant="outline" onClick={() => setPaymentClient(null)} disabled={isSubmittingPayment}>
              Cancelar
            </Button>
            <Button onClick={handlePaymentSubmit} disabled={isSubmittingPayment}>
              {isSubmittingPayment ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Guardar Pago"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

function formatDate(dateString: string | null | undefined) {
  if (!dateString) return "—"
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return "—"
  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date)
}
