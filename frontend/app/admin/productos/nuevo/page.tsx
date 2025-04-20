"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, Upload, X } from "lucide-react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"

const productSchema = z.object({
  name: z.string().min(3, { message: "El nombre debe tener al menos 3 caracteres" }),
  description: z.string().min(10, { message: "La descripción debe tener al menos 10 caracteres" }),
  category: z.string().min(1, { message: "Selecciona una categoría" }),
  subcategory: z.string().optional(),
  price: z.coerce.number().positive({ message: "El precio debe ser mayor que 0" }),
  comparePrice: z.coerce.number().nonnegative().optional(),
  cost: z.coerce.number().nonnegative().optional(),
  sku: z.string().min(1, { message: "El SKU es requerido" }),
  barcode: z.string().optional(),
  inventory: z.coerce.number().int().nonnegative(),
  trackInventory: z.boolean().default(true),
  continueSelling: z.boolean().default(false),
  status: z.string().default("active"),
  tags: z.string().optional(),
  details: z.string().optional(),
})

type ProductFormValues = z.infer<typeof productSchema>

export default function NuevoProductoPage() {
  const [images, setImages] = useState<string[]>([])

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      description: "",
      category: "",
      subcategory: "",
      price: 0,
      comparePrice: undefined,
      cost: undefined,
      sku: "",
      barcode: "",
      inventory: 0,
      trackInventory: true,
      continueSelling: false,
      status: "active",
      tags: "",
      details: "",
    },
  })

  function onSubmit(data: ProductFormValues) {
    // En una aplicación real, aquí enviarías los datos al servidor
    console.log(data)
    toast({
      title: "Producto guardado",
      description: `El producto "${data.name}" ha sido guardado exitosamente.`,
    })
  }

  // Función para manejar la carga de imágenes
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newImages = Array.from(e.target.files).map((file) => URL.createObjectURL(file))
      setImages([...images, ...newImages])
    }
  }

  // Función para eliminar una imagen
  const removeImage = (index: number) => {
    const newImages = [...images]
    newImages.splice(index, 1)
    setImages(newImages)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild>
            <Link href="/admin/productos">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Volver</span>
            </Link>
          </Button>
          <h2 className="text-2xl font-heading">Nuevo Producto</h2>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => form.reset()}>
            Cancelar
          </Button>
          <Button onClick={form.handleSubmit(onSubmit)}>Guardar Producto</Button>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-6">
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre del Producto</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej: Vestido Floral Primavera" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descripción</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe el producto detalladamente..."
                          className="min-h-[120px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Imágenes</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {images.map((image, index) => (
                    <div key={index} className="aspect-square rounded-md border overflow-hidden relative group">
                      <img
                        src={image || "/placeholder.svg"}
                        alt={`Imagen ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removeImage(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <label
                    htmlFor="image-upload"
                    className="aspect-square rounded-md border-2 border-dashed flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors"
                  >
                    <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                    <span className="text-sm text-muted-foreground">Subir imagen</span>
                    <input
                      id="image-upload"
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={handleImageUpload}
                    />
                  </label>
                </div>
                <p className="text-sm text-muted-foreground">
                  Puedes subir hasta 8 imágenes. La primera imagen será la principal.
                </p>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Detalles del Producto</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="sku"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>SKU</FormLabel>
                        <FormControl>
                          <Input placeholder="Ej: VFP-001" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="barcode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Código de Barras (opcional)</FormLabel>
                        <FormControl>
                          <Input placeholder="Ej: 9780123456789" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="details"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Especificaciones</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Material, cuidados, dimensiones, etc."
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-4 border rounded-lg p-4">
                <h3 className="text-lg font-medium">Organización</h3>

                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Categoría</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar categoría" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="prendas">Prendas</SelectItem>
                          <SelectItem value="accesorios">Accesorios</SelectItem>
                          <SelectItem value="perfumes">Perfumes</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="subcategory"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subcategoría</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar subcategoría" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="vestidos">Vestidos</SelectItem>
                          <SelectItem value="blusas">Blusas</SelectItem>
                          <SelectItem value="faldas">Faldas</SelectItem>
                          <SelectItem value="pantalones">Pantalones</SelectItem>
                          <SelectItem value="collares">Collares</SelectItem>
                          <SelectItem value="aretes">Aretes</SelectItem>
                          <SelectItem value="pulseras">Pulseras</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="tags"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Etiquetas</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej: verano, elegante, casual" {...field} />
                      </FormControl>
                      <FormDescription>Separa las etiquetas con comas</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-4 border rounded-lg p-4">
                <h3 className="text-lg font-medium">Precios e Inventario</h3>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Precio</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <span className="absolute left-3 top-2.5">$</span>
                            <Input type="number" min="0" step="0.01" className="pl-6" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="comparePrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Precio Comparativo</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <span className="absolute left-3 top-2.5">$</span>
                            <Input type="number" min="0" step="0.01" className="pl-6" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="cost"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Costo por Unidad (opcional)</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <span className="absolute left-3 top-2.5">$</span>
                          <Input type="number" min="0" step="0.01" className="pl-6" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Separator />

                <FormField
                  control={form.control}
                  name="inventory"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Inventario</FormLabel>
                      <FormControl>
                        <Input type="number" min="0" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="trackInventory"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} id="track-inventory" />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel htmlFor="track-inventory">Rastrear inventario</FormLabel>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="continueSelling"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} id="continue-selling" />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel htmlFor="continue-selling">Continuar vendiendo cuando no haya stock</FormLabel>
                      </div>
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-4 border rounded-lg p-4">
                <h3 className="text-lg font-medium">Estado</h3>

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar estado" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="active">Activo</SelectItem>
                          <SelectItem value="draft">Borrador</SelectItem>
                          <SelectItem value="hidden">Oculto</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </div>
        </form>
      </Form>
      <Toaster />
    </div>
  )
}
