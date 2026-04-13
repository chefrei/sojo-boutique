"use client"

import { useEffect, useState } from "react"
import { SiteHeader } from "@/components/site-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Image from "next/image"
import Link from "next/link"
import { Heart, SlidersHorizontal, Loader2, ShoppingCart, Check } from "lucide-react"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { apiFetch } from "@/lib/api"
import { useCart } from "@/contexts/cart-context"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { useAuth } from "@/contexts/auth-context"
import { LoginDialog } from "@/components/login-dialog"

export default function CatalogoPage() {
  const [products, setProducts] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [addedIds, setAddedIds] = useState<Set<number>>(new Set())
  const { addItem } = useCart()

  const { isAuthenticated } = useAuth()
  const [showLoginDialog, setShowLoginDialog] = useState(false)

  const handleAddToCart = async (product: any) => {
    if (!isAuthenticated) {
      setShowLoginDialog(true)
      return
    }

    const success = await addItem({
      id: product.id,
      name: product.name,
      price: Number(product.price),
      quantity: 1,
      image_url: product.image_url,
    })

    if (success) {
      setAddedIds((prev) => new Set(prev).add(product.id))
      setTimeout(() => {
        setAddedIds((prev) => { const s = new Set(prev); s.delete(product.id); return s })
      }, 2000)
      toast({ title: "Producto agregado", description: `${product.name} fue añadido al carrito.` })
    } else {
      toast({ title: "Error", description: "No se pudo añadir al carrito.", variant: "destructive" })
    }
  }

  useEffect(() => {
    async function fetchData() {
      try {
        const [productsData, categoriesData] = await Promise.all([
          apiFetch<any[]>("/products/"),
          apiFetch<any[]>("/products/categories")
        ])
        setProducts(productsData)
        setCategories(categoriesData)
      } catch (error) {
        console.error("Error al cargar el catálogo:", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [])

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <div className="container py-8">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center min-h-[400px]">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
              <p className="text-muted-foreground">Cargando catálogo...</p>
            </div>
          ) : (
            <>
              <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-8">
            <div>
              <h1 className="font-heading text-3xl md:text-4xl mb-2">Catálogo</h1>
              <p className="text-muted-foreground">Encuentra tus productos favoritos</p>
            </div>

            <div className="flex items-center gap-4 w-full md:w-auto">
              <div className="relative w-full md:w-[300px]">
                <Input placeholder="Buscar productos..." className="pr-10" />
              </div>

              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon">
                    <SlidersHorizontal className="h-5 w-5" />
                    <span className="sr-only">Filtros</span>
                  </Button>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>Filtros</SheetTitle>
                    <SheetDescription>Ajusta los filtros para encontrar exactamente lo que buscas</SheetDescription>
                  </SheetHeader>
                  <div className="py-6 space-y-6">
                    <div className="space-y-4">
                      <h3 className="font-medium">Categorías</h3>
                      <div className="space-y-2">
                        {categories.map((category) => (
                          <div key={category.id} className="flex items-center space-x-2">
                            <Checkbox id={category.slug} />
                            <Label htmlFor={category.slug}>{category.name}</Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="font-medium">Precio</h3>
                        <span className="text-sm text-muted-foreground">$0 - $200</span>
                      </div>
                      <Slider defaultValue={[0, 200]} min={0} max={200} step={1} />
                    </div>

                    <div className="space-y-4">
                      <h3 className="font-medium">Ordenar por</h3>
                      <Select defaultValue="relevance">
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="relevance">Relevancia</SelectItem>
                          <SelectItem value="price-low">Precio: Menor a Mayor</SelectItem>
                          <SelectItem value="price-high">Precio: Mayor a Menor</SelectItem>
                          <SelectItem value="newest">Más Recientes</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex gap-2 pt-4">
                      <Button className="flex-1">Aplicar Filtros</Button>
                      <Button variant="outline">Limpiar</Button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>

              <div className="hidden md:block">
                <Select defaultValue="relevance">
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Ordenar por" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="relevance">Relevancia</SelectItem>
                    <SelectItem value="price-low">Precio: Menor a Mayor</SelectItem>
                    <SelectItem value="price-high">Precio: Mayor a Menor</SelectItem>
                    <SelectItem value="newest">Más Recientes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {products.map((product) => (
              <div
                key={product.id}
                className="group relative bg-background rounded-lg overflow-hidden border shadow-sm hover:shadow-md transition-shadow flex flex-col"
              >
                <div className="absolute top-2 right-2 z-10">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm"
                  >
                    <Heart className="h-4 w-4" />
                    <span className="sr-only">Añadir a favoritos</span>
                  </Button>
                </div>
                <Link href={`/producto/${product.id}`} className="flex-1">
                  <div className="aspect-square overflow-hidden">
                    <Image
                      src={product.image_url || "/placeholder.svg"}
                      alt={product.name}
                      width={300}
                      height={300}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-4 pb-2">
                    <div className="text-sm text-muted-foreground mb-1">
                      {product.category?.name || "Sin categoría"}
                    </div>
                    <h3 className="font-medium mb-1 group-hover:text-primary transition-colors line-clamp-1">
                      {product.name}
                    </h3>
                    <div className="font-semibold">${Number(product.price).toFixed(2)}</div>
                  </div>
                </Link>
                {/* Botón de añadir al carrito */}
                <div className="px-4 pb-4">
                  <Button
                    size="sm"
                    className="w-full gap-2 transition-all"
                    variant={addedIds.has(product.id) ? "secondary" : "default"}
                    onClick={() => handleAddToCart(product)}
                  >
                    {addedIds.has(product.id) ? (
                      <><Check className="h-4 w-4" /> Añadido</>
                    ) : (
                      <><ShoppingCart className="h-4 w-4" /> Añadir al carrito</>
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-center mt-10">
            <Button variant="outline">Cargar Más Productos</Button>
          </div>
            </>
          )}
        </div>
      </main>
      
      <LoginDialog 
        open={showLoginDialog} 
        onOpenChange={setShowLoginDialog} 
        message="Inicia sesión para añadir productos a tu carrito y disfrutar de Soho Boutique."
      />
      <Toaster />
    </div>
  )
}
