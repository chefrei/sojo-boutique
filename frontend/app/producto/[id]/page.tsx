"use client"

import { useEffect, useState, use } from "react"
import { SiteHeader } from "@/components/site-header"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Image from "next/image"
import Link from "next/link"
import { Heart, Minus, Plus, Share2, ShoppingBag, Star, Loader2, Check } from "lucide-react"
import { apiFetch } from "@/lib/api"
import { useCart } from "@/contexts/cart-context"
import { useAuth } from "@/contexts/auth-context"
import { LoginDialog } from "@/components/login-dialog"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"

export default function ProductoDetalle({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const productId = resolvedParams.id
  
  const [product, setProduct] = useState<any>(null)
  const [quantity, setQuantity] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [isAdded, setIsAdded] = useState(false)
  const [showLoginDialog, setShowLoginDialog] = useState(false)
  const [inWishlist, setInWishlist] = useState(false)
  
  const { isAuthenticated } = useAuth()
  const { addItem } = useCart()

  const isNewProduct = (dateStr: string) => {
    if (!dateStr) return false
    const date = new Date(dateStr)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays <= 30
  }

  const handleToggleWishlist = async () => {
    if (!isAuthenticated) {
      setShowLoginDialog(true)
      return
    }
    try {
      const res = await apiFetch<any>(`/wishlist/toggle/${product.id}`, { method: "POST" })
      setInWishlist(res.action === "added")
      toast({ 
        title: res.action === "added" ? "Añadido a favoritos" : "Eliminado de favoritos",
        description: `${product.name} ${res.action === "added" ? "ahora está" : "ya no está"} en tu lista de deseos.`
      })
    } catch (err) {
      toast({ title: "Error", description: "No se pudo actualizar la lista de deseos.", variant: "destructive" })
    }
  }

  const handleShare = async () => {
    const shareData = {
      title: `Soho Boutique - ${product.name}`,
      text: product.description,
      url: window.location.href,
    }

    try {
      if (navigator.share) {
        await navigator.share(shareData)
      } else {
        await navigator.clipboard.writeText(window.location.href)
        toast({ title: "Enlace copiado", description: "El enlace al producto se copió al portapapeles." })
      }
    } catch (err) {
      console.error("Error al compartir:", err)
    }
  }

  useEffect(() => {
    async function loadProduct() {
      try {
        const data = await apiFetch<any>(`/products/${productId}`)
        setProduct(data)
        
        // Verificar si está en wishlist
        if (isAuthenticated) {
          const wishRes = await apiFetch<any>(`/wishlist/check/${productId}`)
          setInWishlist(wishRes.inWishlist)
        }
      } catch (err) {
        console.error("Error al cargar producto:", err)
      } finally {
        setIsLoading(false)
      }
    }
    loadProduct()
  }, [productId, isAuthenticated])

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

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      setShowLoginDialog(true)
      return
    }

    const success = await addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: quantity,
      image_url: product.image_url
    })

    if (success) {
      setIsAdded(true)
      toast({ title: "Producto agregado", description: `${product.name} añadido al carrito.` })
      setTimeout(() => setIsAdded(false), 2000)
    } else {
      toast({ title: "Error", description: "No se pudo añadir al carrito", variant: "destructive" })
    }
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
                  {isNewProduct(product.created_at) && (
                    <span className="bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ml-2">Nuevo</span>
                  )}
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
                      onClick={() => setQuantity(quantity + 1)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                    <div className="ml-4 text-sm text-muted-foreground">
                      {product.stock > 0 
                        ? `${product.stock} disponibles` 
                        : "Disponible bajo pedido (se solicitará a proveedor)"}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-2">
                <Button size="lg" className="flex-1" onClick={handleAddToCart} variant={isAdded ? "secondary" : "default"}>
                  {isAdded ? (
                    <><Check className="mr-2 h-5 w-5" /> Añadido</>
                  ) : (
                    <><ShoppingBag className="mr-2 h-5 w-5" /> Añadir al Carrito</>
                  )}
                </Button>
                <Button 
                  size="lg" 
                  variant={inWishlist ? "secondary" : "outline"} 
                  className="flex-1 sm:flex-none"
                  onClick={handleToggleWishlist}
                >
                  <Heart className={`mr-2 h-5 w-5 ${inWishlist ? "fill-primary text-primary" : ""}`} />
                  <span className="sm:inline">{inWishlist ? "En Favoritos" : "Favoritos"}</span>
                </Button>
                <Button size="lg" variant="ghost" className="sm:w-auto flex" onClick={handleShare}>
                  <Share2 className="h-5 w-5 mr-2" />
                  <span className="sm:hidden">Compartir</span>
                </Button>
              </div>

              <Tabs defaultValue="description" className="pt-4">
                <TabsList className="grid w-full grid-cols-1">
                  <TabsTrigger value="description">Descripción</TabsTrigger>
                </TabsList>
                <TabsContent value="description" className="pt-4">
                  <p className="text-muted-foreground leading-relaxed">{product.description || "Sin descripción disponible."}</p>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </main>
      <LoginDialog 
        open={showLoginDialog} 
        onOpenChange={setShowLoginDialog} 
        message="Inicia sesión para añadir productos a tu carrito de compras."
      />
      <Toaster />
    </div>
  )
}
