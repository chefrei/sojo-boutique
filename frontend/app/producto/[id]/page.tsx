"use client"

import { useEffect, useState } from "react"
import { SiteHeader } from "@/components/site-header"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Image from "next/image"
import Link from "next/link"
import { Heart, Minus, Plus, Share2, ShoppingBag, Star, Loader2 } from "lucide-react"
import { apiFetch } from "@/lib/api"
import { useCart } from "@/contexts/cart-context"

export default function ProductoPage({ params }: { params: { id: string } }) {
  const [product, setProduct] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const { addItem } = useCart()

  useEffect(() => {
    async function loadProduct() {
      try {
        const data = await apiFetch<any>(`/products/${params.id}`)
        setProduct(data)
      } catch (err) {
        console.error("Error al cargar producto:", err)
      } finally {
        setIsLoading(false)
      }
    }
    loadProduct()
  }, [params.id])

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col">
        <SiteHeader />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    )
  }

  if (!product) {
    return <div>Producto no encontrado</div>
  }

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: quantity,
      image_url: product.image_url
    })
  }

  // Productos relacionados
  const relatedProducts = [
    {
      id: 2,
      name: "Blusa Seda Premium",
      price: 65.99,
      image: "/placeholder.svg?height=400&width=300",
      category: "Prendas",
    },
    {
      id: 3,
      name: "Falda Midi Elegante",
      price: 55.99,
      image: "/placeholder.svg?height=400&width=300",
      category: "Prendas",
    },
    {
      id: 4,
      name: "Collar Perlas Elegance",
      price: 45.5,
      image: "/placeholder.svg?height=400&width=300",
      category: "Accesorios",
    },
  ]

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <div className="container py-8">
          <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
            {/* Imágenes del producto - Responsivo */}
            <div className="space-y-4">
              <div className="aspect-[4/5] overflow-hidden rounded-lg border">
                <Image
                  src={product.image_url || "/placeholder.svg"}
                  alt={product.name}
                  width={500}
                  height={600}
                  className="h-full w-full object-cover"
                  priority
                />
              </div>
            </div>

            {/* Información del producto - Responsivo */}
            <div className="space-y-6">
              <div>
                <div className="text-sm text-muted-foreground mb-1">
                  <Link href={`/catalogo?categoria=${product.category?.slug}`} className="hover:text-primary">
                    {product.category?.name || "Sin categoría"}
                  </Link>
                </div>
                <h1 className="font-heading text-2xl sm:text-3xl md:text-4xl">{product.name}</h1>
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${i < 4 ? "fill-primary text-primary" : "text-muted-foreground"}`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground">(Nuevo)</span>
                </div>
              </div>

              <div className="text-2xl font-semibold">${Number(product.price).toFixed(2)}</div>

              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">Cantidad</h3>
                  <div className="flex items-center">
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="rounded-r-none"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <div className="px-4 py-2 border-y text-center w-12">{quantity}</div>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="rounded-l-none"
                      onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                    <div className="ml-4 text-sm text-muted-foreground">{product.stock} disponibles</div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-2">
                <Button size="lg" className="flex-1" onClick={handleAddToCart}>
                  <ShoppingBag className="mr-2 h-5 w-5" />
                  Añadir al Carrito
                </Button>
                <Button size="lg" variant="outline" className="flex-1 sm:flex-none">
                  <Heart className="mr-2 h-5 w-5" />
                  <span className="sm:inline">Favoritos</span>
                </Button>
                <Button size="lg" variant="ghost" className="sm:w-auto hidden sm:flex">
                  <Share2 className="h-5 w-5" />
                  <span className="sr-only">Compartir</span>
                </Button>
              </div>

              <Tabs defaultValue="description" className="pt-4">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="description">Descripción</TabsTrigger>
                  <TabsTrigger value="reviews">Reseñas</TabsTrigger>
                </TabsList>
                <TabsContent value="description" className="pt-4">
                  <p className="text-muted-foreground">{product.description || "Sin descripción disponible."}</p>
                </TabsContent>
                <TabsContent value="reviews" className="pt-4">
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-4">Las reseñas estarán disponibles próximamente</p>
                    <Button variant="outline">Escribir una Reseña</Button>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
