"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Upload, X, Loader2 } from "lucide-react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { apiFetch } from "@/lib/api"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"

const productSchema = z.object({
  name: z.string().min(3, { message: "El nombre debe tener al menos 3 caracteres" }),
  description: z.string().min(10, { message: "La descripción debe tener al menos 10 caracteres" }),
  category: z.string().min(1, { message: "Selecciona una categoría" }),
  price: z.coerce.number().positive({ message: "El precio debe ser mayor que 0" }),
  inventory: z.coerce.number().int().nonnegative(),
})

type ProductFormValues = z.infer<typeof productSchema>

export default function EditarProductoPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null)
  const [newImage, setNewImage] = useState<{ file: File; url: string } | null>(null)

  const categorySlugMap: Record<number, string> = {
    1: "prendas",
    2: "accesorios",
    3: "perfumes",
  }

  const categoryIdMap: Record<string, number> = {
    prendas: 1,
    accesorios: 2,
    perfumes: 3,
  }

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      description: "",
      category: "",
      price: 0,
      inventory: 0,
    },
  })

  // Cargar datos del producto existente
  useEffect(() => {
    async function loadProduct() {
      try {
        const product = await apiFetch<any>(`/products/${params.id}`)
        form.reset({
          name: product.name,
          description: product.description,
          category: categorySlugMap[product.category_id] || "prendas",
          price: Number(product.price),
          inventory: product.stock,
        })
        setCurrentImageUrl(product.image_url || null)
      } catch (error) {
        toast({ title: "Error", description: "No se pudo cargar el producto.", variant: "destructive" })
        router.push("/admin/productos")
      } finally {
        setIsLoading(false)
      }
    }
    loadProduct()
  }, [params.id])

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0]
      setNewImage({ file, url: URL.createObjectURL(file) })
    }
  }

  async function onSubmit(data: ProductFormValues) {
    try {
      setIsSubmitting(true)

      let image_url = currentImageUrl || ""

      // Si se seleccionó una nueva imagen, subirla primero
      if (newImage) {
        try {
          const formData = new FormData()
          formData.append("file", newImage.file)
          const uploadRes = await apiFetch<any>("/upload/", { method: "POST", body: formData })
          image_url = uploadRes.image_url
          console.log("Nueva imagen subida:", image_url)
        } catch (err) {
          console.error("Error al subir imagen:", err)
          toast({ title: "Atención", description: "No se pudo subir la nueva imagen. Se mantendrá la imagen actual.", variant: "destructive" })
        }
      }

      const payload = {
        name: data.name,
        description: data.description,
        price: data.price,
        stock: data.inventory,
        category_id: categoryIdMap[data.category] || 1,
        image_url,
      }

      await apiFetch(`/products/${params.id}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      })

      toast({ title: "Producto actualizado", description: `"${data.name}" fue actualizado exitosamente.` })
      router.push("/admin/productos")
    } catch (error: any) {
      console.error("Error al actualizar:", error)
      toast({ title: "Error", description: error.message || "No se pudo actualizar el producto.", variant: "destructive" })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" asChild>
              <Link href="/admin/productos">
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Volver</span>
              </Link>
            </Button>
            <h2 className="text-2xl font-heading">Editar Producto</h2>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => router.push("/admin/productos")} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button onClick={form.handleSubmit(onSubmit)} disabled={isSubmitting}>
              {isSubmitting ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Guardando...</>
              ) : "Guardar Cambios"}
            </Button>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Columna izquierda */}
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

                {/* Sección de imagen */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Imagen del Producto</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {/* Imagen actual o nueva */}
                    {(newImage || currentImageUrl) && (
                      <div className="aspect-square rounded-md border overflow-hidden relative group">
                        <img
                          src={newImage ? newImage.url : currentImageUrl!}
                          alt="Imagen del producto"
                          className="w-full h-full object-cover"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => { setNewImage(null); setCurrentImageUrl(null) }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                    {/* Botón de subir nueva imagen */}
                    <label
                      htmlFor="image-upload"
                      className="aspect-square rounded-md border-2 border-dashed flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors"
                    >
                      <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                      <span className="text-sm text-muted-foreground text-center px-1">
                        {currentImageUrl || newImage ? "Cambiar imagen" : "Subir imagen"}
                      </span>
                      <input
                        id="image-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageUpload}
                      />
                    </label>
                  </div>
                  {newImage && (
                    <p className="text-sm text-amber-500">⚠ Nueva imagen seleccionada. Se guardará al hacer clic en "Guardar Cambios".</p>
                  )}
                </div>
              </div>

              {/* Columna derecha */}
              <div className="space-y-6">
                <div className="space-y-4 border rounded-lg p-4">
                  <h3 className="text-lg font-medium">Organización</h3>
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Categoría</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
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
                </div>

                <div className="space-y-4 border rounded-lg p-4">
                  <h3 className="text-lg font-medium">Precio e Inventario</h3>

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
                    name="inventory"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Stock disponible</FormLabel>
                        <FormControl>
                          <Input type="number" min="0" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>
          </form>
        </Form>
      </div>
      <Toaster />
    </>
  )
}
