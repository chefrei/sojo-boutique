"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, Calendar, Minus, Plus, Search, Trash2 } from "lucide-react"
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

// Esquema para validación del formulario
const saleSchema = z.object({
  clientName: z.string().min(3, { message: "El nombre del cliente es requerido" }),
  clientPhone: z.string().min(7, { message: "El teléfono del cliente es requerido" }),
  clientEmail: z.string().email({ message: "Ingresa un correo electrónico válido" }).optional().or(z.literal("")),
  date: z.date({ required_error: "La fecha es requerida" }),
  paymentMethod: z.string({ required_error: "El método de pago es requerido" }),
  paymentStatus: z.string({ required_error: "El estado de pago es requerido" }),
  notes: z.string().optional(),
})

type SaleFormValues = z.infer<typeof saleSchema>

// Tipo para los productos en el carrito
interface CartItem {
  id: number
  name: string
  price: number
  quantity: number
  subtotal: number
}

export default function NuevaVentaPage() {
  const [date, setDate] = useState<Date>(new Date())
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [showProductDialog, setShowProductDialog] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<CartItem | null>(null)

  // Productos de ejemplo para búsqueda
  const availableProducts = [
    { id: 1, name: "Vestido Floral Primavera", price: 89.99, stock: 15 },
    { id: 2, name: "Blusa Seda Premium", price: 65.99, stock: 8 },
    { id: 3, name: "Collar Perlas Elegance", price: 45.5, stock: 12 },
    { id: 4, name: "Perfume Rosa Silvestre", price: 75.0, stock: 10 },
    { id: 5, name: "Falda Midi Elegante", price: 55.99, stock: 6 },
    { id: 6, name: "Aretes Cristal Dorado", price: 35.5, stock: 20 },
  ]

  // Filtrar productos según término de búsqueda
  const filteredProducts = availableProducts.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const form = useForm<SaleFormValues>({
    resolver: zodResolver(saleSchema),
    defaultValues: {
      clientName: "",
      clientPhone: "",
      clientEmail: "",
      date: new Date(),
      paymentMethod: "cash",
      paymentStatus: "completed",
      notes: "",
    },
  })

  // Actualizar el campo de fecha en el formulario cuando cambia el estado
  useEffect(() => {
    form.setValue("date", date)
  }, [date, form])

  function onSubmit(data: SaleFormValues) {
    if (cartItems.length === 0) {
      toast({
        title: "Error",
        description: "Debes agregar al menos un producto a la venta",
        variant: "destructive",
      })
      return
    }

    // En una aplicación real, aquí enviarías los datos al servidor
    console.log({
      ...data,
      items: cartItems,
      subtotal: calculateSubtotal(),
      taxes: calculateTaxes(),
      total: calculateTotal(),
    })

    toast({
      title: "Venta registrada",
      description: `La venta ha sido registrada exitosamente.`,
    })
  }

  // Función para agregar un producto al carrito
  const addProductToCart = (product: (typeof availableProducts)[0], quantity = 1) => {
    const existingItem = cartItems.find((item) => item.id === product.id)

    if (existingItem) {
      // Si el producto ya está en el carrito, actualizar cantidad
      setCartItems(
        cartItems.map((item) =>
          item.id === product.id
            ? {
                ...item,
                quantity: item.quantity + quantity,
                subtotal: Number(((item.quantity + quantity) * item.price).toFixed(2)),
              }
            : item,
        ),
      )
    } else {
      // Si es un producto nuevo, agregarlo al carrito
      setCartItems([
        ...cartItems,
        {
          id: product.id,
          name: product.name,
          price: product.price,
          quantity: quantity,
          subtotal: Number((quantity * product.price).toFixed(2)),
        },
      ])
    }

    setShowProductDialog(false)
    setSelectedProduct(null)
    setSearchTerm("")
  }

  // Función para actualizar la cantidad de un producto
  const updateQuantity = (id: number, newQuantity: number) => {
    if (newQuantity < 1) return

    setCartItems(
      cartItems.map((item) => {
        if (item.id === id) {
          return {
            ...item,
            quantity: newQuantity,
            subtotal: Number((item.price * newQuantity).toFixed(2)),
          }
        }
        return item
      }),
    )
  }

  // Función para eliminar un producto
  const removeItem = (id: number) => {
    setCartItems(cartItems.filter((item) => item.id !== id))
  }

  // Calcular subtotal
  const calculateSubtotal = () => {
    return Number(cartItems.reduce((sum, item) => sum + item.subtotal, 0).toFixed(2))
  }

  // Calcular impuestos (16%)
  const calculateTaxes = () => {
    return Number((calculateSubtotal() * 0.16).toFixed(2))
  }

  // Calcular total
  const calculateTotal = () => {
    return Number((calculateSubtotal() + calculateTaxes()).toFixed(2))
  }

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
          <Button variant="outline" onClick={() => form.reset()}>
            Cancelar
          </Button>
          <Button onClick={form.handleSubmit(onSubmit)}>Completar Venta</Button>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Información del Cliente</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="client-search">Buscar Cliente</Label>
                    <div className="relative">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input id="client-search" placeholder="Nombre o teléfono del cliente" className="pl-8" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="clientName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nombre</FormLabel>
                          <FormControl>
                            <Input placeholder="Nombre completo" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="clientPhone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Teléfono</FormLabel>
                          <FormControl>
                            <Input placeholder="Número de teléfono" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="clientEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Correo Electrónico (opcional)</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="correo@ejemplo.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

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
                        <div className="relative">
                          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="Buscar productos..."
                            className="pl-8"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                          />
                        </div>
                        <div className="max-h-[300px] overflow-auto border rounded-md">
                          {filteredProducts.length > 0 ? (
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
                                    <TableCell className="text-right">${product.price.toFixed(2)}</TableCell>
                                    <TableCell className="text-center">
                                      <Badge variant={product.stock > 5 ? "outline" : "secondary"}>
                                        {product.stock}
                                      </Badge>
                                    </TableCell>
                                    <TableCell>
                                      <Button variant="ghost" size="sm" onClick={() => addProductToCart(product)}>
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
                          Cancelar
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

            <div className="space-y-6">
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

              <Card>
                <CardHeader>
                  <CardTitle>Detalles de Pago</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
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
                                variant={"outline"}
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground",
                                )}
                              >
                                {field.value ? format(field.value) : <span>Seleccionar fecha</span>}
                                <Calendar className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <CalendarComponent
                              mode="single"
                              selected={field.value}
                              onSelect={(date) => {
                                if (date) {
                                  setDate(date)
                                  field.onChange(date)
                                }
                              }}
                              disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="paymentMethod"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Método de Pago</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar método" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="cash">Efectivo</SelectItem>
                            <SelectItem value="card">Tarjeta</SelectItem>
                            <SelectItem value="transfer">Transferencia</SelectItem>
                            <SelectItem value="credit">Crédito (Deuda)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

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
                            <SelectItem value="completed">Completado</SelectItem>
                            <SelectItem value="pending">Pendiente</SelectItem>
                            <SelectItem value="partial">Pago Parcial</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

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

// Función para formatear fechas
function format(date: Date) {
  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date)
}
