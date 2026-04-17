"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { ArrowLeft, Calendar, Minus, Plus, Search, Trash2, User, Check, ChevronsUpDown, Loader2 } from "lucide-react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { cn } from "@/lib/utils"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { apiFetch } from "@/lib/api"

// ──────────────────────────────────────────────────────────────
// Tipos
// ──────────────────────────────────────────────────────────────

interface Customer {
  id: number
  name: string
  phone: string
  email: string
}

interface CartItem {
  id: number
  name: string
  price: number
  quantity: number
  subtotal: number
}

interface ApiProduct {
  id: number
  name: string
  price: number
  stock: number
}

// ──────────────────────────────────────────────────────────────
// Schema de validación
// ──────────────────────────────────────────────────────────────

const saleSchema = z.object({
  clientId: z.number({ required_error: "Selecciona un cliente" }),
  clientName: z.string().min(1),
  clientPhone: z.string().optional(),
  clientEmail: z.string().optional(),
  date: z.date({ required_error: "La fecha de pedido es requerida" }),
  deliveryDate: z.date().optional().nullable(),
  status: z.enum(["pending", "delivered"]).default("pending"),
  paymentStatus: z.enum(["pending", "partial", "paid"]).default("pending"),
  amountPaid: z.coerce.number().min(0).optional(),
  notes: z.string().optional(),
})

type SaleFormValues = z.infer<typeof saleSchema>

// ──────────────────────────────────────────────────────────────
// Componente principal
// ──────────────────────────────────────────────────────────────

export default function NuevaVentaPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [date, setDate] = useState<Date>(new Date())
  const [deliveryDate, setDeliveryDate] = useState<Date | undefined>(undefined)
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [showProductDialog, setShowProductDialog] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Estado para clientes
  const [customers, setCustomers] = useState<Customer[]>([])
  const [customersLoading, setCustomersLoading] = useState(true)
  const [customersError, setCustomersError] = useState<string | null>(null)
  const [clientComboOpen, setClientComboOpen] = useState(false)

  // Estado para productos (desde API)
  const [availableProducts, setAvailableProducts] = useState<ApiProduct[]>([])
  const [productsLoading, setProductsLoading] = useState(false)

  // Cargar clientes al montar — con timeout para evitar spinner infinito
  useEffect(() => {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 8000) // 8 s máximo

    async function loadCustomers() {
      setCustomersLoading(true)
      setCustomersError(null)
      try {
        const data = await apiFetch<Customer[]>("/customers/")
        setCustomers(data)
      } catch (err: any) {
        const msg = err?.name === "AbortError"
          ? "El servidor tardó demasiado. Verifica que el backend esté corriendo."
          : (err?.message ?? "No se pudo cargar la lista de clientes")
        console.error("Error cargando clientes:", err)
        setCustomersError(msg)
      } finally {
        clearTimeout(timeoutId)
        setCustomersLoading(false)
      }
    }
    loadCustomers()
    return () => { controller.abort(); clearTimeout(timeoutId) }
  }, [])

  // Cargar productos al montar
  useEffect(() => {
    async function loadProducts() {
      setProductsLoading(true)
      try {
        const data = await apiFetch<ApiProduct[]>("/products/")
        setAvailableProducts(data)
      } catch (err) {
        console.error("Error cargando productos:", err)
      } finally {
        setProductsLoading(false)
      }
    }
    loadProducts()
  }, [])

  // Filtrar productos
  const filteredProducts = availableProducts.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Filtrar clientes para el combobox
  const filteredCustomers = customers.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const form = useForm<SaleFormValues>({
    resolver: zodResolver(saleSchema),
    defaultValues: {
      clientId: undefined,
      clientName: "",
      clientPhone: "",
      clientEmail: "",
      date: new Date(),
      deliveryDate: null,
      status: "pending", // Por defecto Pedido
      paymentStatus: "pending", // Por defecto Sin Pago
      amountPaid: 0,
      notes: "",
    },
  })

  // Capturar cliente de URL
  useEffect(() => {
    const clientIdParam = searchParams.get("cliente")
    if (clientIdParam && customers.length > 0) {
      const id = parseInt(clientIdParam)
      const customer = customers.find(c => c.id === id)
      if (customer) {
        form.setValue("clientId", customer.id)
        form.setValue("clientName", customer.name)
        form.setValue("clientPhone", customer.phone ?? "")
        form.setValue("clientEmail", customer.email ?? "")
      }
    }
  }, [searchParams, customers, form])

  useEffect(() => {
    form.setValue("date", date)
  }, [date, form])

  useEffect(() => {
    form.setValue("deliveryDate", deliveryDate || null)
  }, [deliveryDate, form])

  // ── Submit ─────────────────────────────────────────────────

  async function onSubmit(data: SaleFormValues) {
    if (cartItems.length === 0) {
      toast({
        title: "Error",
        description: "Debes agregar al menos un producto a la venta",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    try {
      await apiFetch("/orders", {
        method: "POST",
        body: JSON.stringify({
          user_id: data.clientId,
          items: cartItems.map((i) => ({ product_id: i.id, quantity: i.quantity })),
          status: data.status,
          payment_status: data.paymentStatus,
          payment_method: "credit", // Por defecto deuda si no se especifica
          amount_paid: data.paymentStatus === "partial" ? (data.amountPaid || 0) : (data.paymentStatus === "paid" ? calculateTotal() : 0),
          created_at: data.date.toISOString(),
          delivered_at: data.status === "delivered" ? (data.deliveryDate || data.date).toISOString() : null,
          notes: data.notes
        }),
      })

      toast({
        title: "✅ Venta registrada",
        description: `Venta para ${data.clientName} registrada exitosamente.`,
      })

      setTimeout(() => router.push("/admin/ventas"), 1500)
    } catch (error: any) {
      toast({
        title: "Error al registrar venta",
        description: error?.message ?? "Ocurrió un error inesperado",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // ── Carrito ────────────────────────────────────────────────

  const addProductToCart = (product: ApiProduct, quantity = 1) => {
    const existing = cartItems.find((item) => item.id === product.id)
    if (existing) {
      setCartItems(
        cartItems.map((item) =>
          item.id === product.id
            ? {
                ...item,
                quantity: item.quantity + quantity,
                subtotal: Number(((item.quantity + quantity) * item.price).toFixed(2)),
              }
            : item
        )
      )
    } else {
      setCartItems([
        ...cartItems,
        {
          id: product.id,
          name: product.name,
          price: Number(product.price),
          quantity,
          subtotal: Number((quantity * Number(product.price)).toFixed(2)),
        },
      ])
    }
    setSearchTerm("")
    toast({ title: "Añadido", description: `${product.name} sumado a la venta.` })
    // No cerramos el diálogo para permitir agregar múltiples productos rápidamente
  }

  const updateQuantity = (id: number, newQuantity: number) => {
    if (newQuantity < 1) return
    setCartItems(
      cartItems.map((item) =>
        item.id === id
          ? { ...item, quantity: newQuantity, subtotal: Number((item.price * newQuantity).toFixed(2)) }
          : item
      )
    )
  }

  const removeItem = (id: number) => setCartItems(cartItems.filter((item) => item.id !== id))

  const calculateSubtotal = () => Number(cartItems.reduce((s, i) => s + i.subtotal, 0).toFixed(2))
  const calculateTaxes = () => Number((calculateSubtotal() * 0.16).toFixed(2))
  const calculateTotal = () => Number((calculateSubtotal() + calculateTaxes()).toFixed(2))

  // ──────────────────────────────────────────────────────────────
  // Render
  // ──────────────────────────────────────────────────────────────

  const selectedClientId = form.watch("clientId")

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild>
            <Link href="/admin/ventas">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Volver</span>
            </Link>
          </Button>
          <h2 className="text-2xl font-heading">Nueva Venta</h2>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push("/admin/ventas")}>
            Cancelar
          </Button>
          <Button onClick={form.handleSubmit(onSubmit)} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Guardando…
              </>
            ) : (
              "Completar Venta"
            )}
          </Button>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* ── Columna izquierda ── */}
            <div className="md:col-span-2 space-y-6">
              {/* Información del cliente */}
              <Card>
                <CardHeader>
                  <CardTitle>Información del Cliente</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Combobox de búsqueda de cliente */}
                  <div className="space-y-2">
                    <Label htmlFor="client-search-btn">Buscar Cliente</Label>
                    {customersError ? (
                      <div className="flex items-center gap-2 rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                        <span className="flex-1">⚠️ {customersError}</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-auto py-0 px-1 text-xs"
                          onClick={() => window.location.reload()}
                        >
                          Reintentar
                        </Button>
                      </div>
                    ) : (
                    <Popover open={clientComboOpen} onOpenChange={setClientComboOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          id="client-search-btn"
                          variant="outline"
                          role="combobox"
                          aria-expanded={clientComboOpen}
                          className="w-full justify-between"
                          disabled={customersLoading}
                        >
                          {customersLoading
                            ? <span className="text-muted-foreground">Cargando clientes…</span>
                            : selectedClientId
                              ? customers.find((c) => c.id === selectedClientId)?.name ?? "Seleccionar cliente…"
                              : "Seleccionar cliente…"}
                          {customersLoading
                            ? <Loader2 className="ml-2 h-4 w-4 animate-spin opacity-50" />
                            : <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[400px] p-0">
                        <Command>
                          <CommandInput id="client-search-input" name="client-search" placeholder="Buscar por nombre, teléfono o correo…" />
                          <CommandList>
                            <CommandEmpty>
                              {"No se encontraron clientes."}
                            </CommandEmpty>
                            <CommandGroup>
                              {customers.map((customer) => (
                                <CommandItem
                                  key={customer.id}
                                  value={`${customer.name} ${customer.phone ?? ""} ${customer.email ?? ""}`}
                                  onSelect={() => {
                                    form.setValue("clientId", customer.id)
                                    form.setValue("clientName", customer.name)
                                    form.setValue("clientPhone", customer.phone ?? "")
                                    form.setValue("clientEmail", customer.email ?? "")
                                    setClientComboOpen(false)
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      selectedClientId === customer.id ? "opacity-100" : "opacity-0"
                                    )}
                                  />
                                  <div className="flex flex-col">
                                    <span className="font-medium">{customer.name}</span>
                                    <span className="text-xs text-muted-foreground">
                                      {customer.phone}{customer.email ? ` · ${customer.email}` : ""}
                                    </span>
                                  </div>
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    )}
                    {form.formState.errors.clientId && (
                      <p className="text-sm text-destructive">Selecciona un cliente registrado</p>
                    )}
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <User className="h-3 w-3" />
                      Solo puedes registrar ventas a clientes ya registrados en el sistema.
                    </p>
                  </div>

                  {/* Datos del cliente (solo lectura, se rellenan al seleccionar) */}
                  {selectedClientId && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Nombre</Label>
                        <div className="px-3 py-2 text-sm border rounded-md bg-muted/30">
                          {form.watch("clientName") || "—"}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Teléfono</Label>
                        <div className="px-3 py-2 text-sm border rounded-md bg-muted/30">
                          {form.watch("clientPhone") || "—"}
                        </div>
                      </div>
                      <div className="space-y-1 md:col-span-2">
                        <Label className="text-xs text-muted-foreground">Correo</Label>
                        <div className="px-3 py-2 text-sm border rounded-md bg-muted/30">
                          {form.watch("clientEmail") || "—"}
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Productos */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Productos</CardTitle>
                  <Dialog open={showProductDialog} onOpenChange={setShowProductDialog}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Plus className="mr-2 h-4 w-4" />
                        Añadir Producto
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                      <DialogHeader>
                        <DialogTitle>Añadir Producto</DialogTitle>
                        <DialogDescription>Busca y selecciona productos para añadir a la venta.</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="relative mb-4">
                          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="Buscar por nombre o descripción..."
                            className="pl-8 h-11"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            autoFocus
                          />
                        </div>
                        <div className="max-h-[300px] overflow-auto border rounded-md">
                          {productsLoading ? (
                            <div className="flex items-center justify-center gap-2 p-6 text-muted-foreground">
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Cargando productos…
                            </div>
                          ) : filteredProducts.length > 0 ? (
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Producto</TableHead>
                                  <TableHead className="text-right">Precio</TableHead>
                                  <TableHead className="text-center">Stock</TableHead>
                                  <TableHead></TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {filteredProducts.map((product) => (
                                  <TableRow key={product.id}>
                                    <TableCell className="font-medium">{product.name}</TableCell>
                                    <TableCell className="text-right">${Number(product.price).toFixed(2)}</TableCell>
                                    <TableCell className="text-center">
                                      <Badge variant={product.stock > 5 ? "outline" : "secondary"}>
                                        {product.stock}
                                      </Badge>
                                    </TableCell>
                                    <TableCell>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => addProductToCart(product)}
                                      >
                                        Añadir
                                      </Button>
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          ) : (
                            <div className="p-4 text-center text-muted-foreground">No se encontraron productos</div>
                          )}
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setShowProductDialog(false)}>
                          Cerrar
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </CardHeader>
                <CardContent>
                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Producto</TableHead>
                          <TableHead className="text-right">Precio</TableHead>
                          <TableHead className="text-center">Cantidad</TableHead>
                          <TableHead className="text-right">Subtotal</TableHead>
                          <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {cartItems.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                              No hay productos en el carrito
                            </TableCell>
                          </TableRow>
                        ) : (
                          cartItems.map((item) => (
                            <TableRow key={item.id}>
                              <TableCell className="font-medium">{item.name}</TableCell>
                              <TableCell className="text-right">${item.price.toFixed(2)}</TableCell>
                              <TableCell>
                                <div className="flex items-center justify-center">
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-8 w-8 rounded-r-none"
                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                  >
                                    <Minus className="h-4 w-4" />
                                  </Button>
                                  <div className="px-3 py-1 border-y w-12 text-center">{item.quantity}</div>
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-8 w-8 rounded-l-none"
                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                  >
                                    <Plus className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                              <TableCell className="text-right">${item.subtotal.toFixed(2)}</TableCell>
                              <TableCell>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-muted-foreground"
                                  onClick={() => removeItem(item.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* ── Columna derecha ── */}
            <div className="space-y-6">
              {/* Resumen */}
              <Card>
                <CardHeader>
                  <CardTitle>Resumen de Venta</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal:</span>
                      <span>${calculateSubtotal().toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Impuestos (16%):</span>
                      <span>${calculateTaxes().toFixed(2)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-medium text-lg">
                      <span>Total:</span>
                      <span>${calculateTotal().toFixed(2)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Detalles de pago */}
              <Card>
                <CardHeader>
                  <CardTitle>Detalles de Pago</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Fecha */}
                  <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Fecha</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? formatDate(field.value) : <span>Seleccionar fecha</span>}
                                <Calendar className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <CalendarComponent
                              mode="single"
                              selected={field.value}
                              onSelect={(d) => {
                                if (d) {
                                  setDate(d)
                                  field.onChange(d)
                                }
                              }}
                              disabled={(d) => d > new Date() || d < new Date("1900-01-01")}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Estado de Entrega */}
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Estado de Entrega</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar estado" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="pending">Pedido (Pendiente de Entrega)</SelectItem>
                            <SelectItem value="delivered">Venta (Entregado)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Fecha de Entrega si está entregado */}
                  {form.watch("status") === "delivered" && (
                    <FormField
                      control={form.control}
                      name="deliveryDate"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Fecha de Entrega</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant="outline"
                                  className={cn(
                                    "w-full pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  {field.value ? formatDate(field.value as Date) : <span>Igual a la fecha de pedido</span>}
                                  <Calendar className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <CalendarComponent
                                mode="single"
                                selected={field.value as Date}
                                onSelect={(d) => {
                                  if (d) {
                                    setDeliveryDate(d)
                                    field.onChange(d)
                                  }
                                }}
                                disabled={(d) => d > new Date() || d < new Date("1900-01-01")}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  {/* Estado de pago */}
                  <FormField
                    control={form.control}
                    name="paymentStatus"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Estado de Pago</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar estado" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="paid">Completado (Pagado)</SelectItem>
                            <SelectItem value="pending">Pendiente (Sin Pago)</SelectItem>
                            <SelectItem value="partial">Pago Parcial (Abono)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Campo de Abono si es pago parcial */}
                  {form.watch("paymentStatus") === "partial" && (
                    <FormField
                      control={form.control}
                      name="amountPaid"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Monto Abonado ($)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              step="0.01" 
                              placeholder="0.00" 
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription>
                            El resto (${(calculateTotal() - Number(form.watch("amountPaid") || 0)).toFixed(2)}) se registrará como deuda.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  {/* Notas */}
                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notas</FormLabel>
                        <FormControl>
                          <Input placeholder="Notas adicionales sobre la venta" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </Form>
      <Toaster />
    </div>
  )
}

// ──────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date)
}
