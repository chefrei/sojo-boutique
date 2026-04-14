"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { SiteHeader } from "@/components/site-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ShoppingBag, Heart, Settings, User, Trash2, ShoppingCart, Loader2 } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { apiFetch } from "@/lib/api"
import { useCart } from "@/contexts/cart-context"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"

export default function FavoritosPage() {
  const { user, isAuthenticated } = useAuth()
  const { addItem } = useCart()
  const [favorites, setFavorites] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  async function loadFavorites() {
    if (!isAuthenticated) return
    try {
      setIsLoading(true)
      // Primero obtenemos los IDs de la wishlist
      const ids = await apiFetch<number[]>("/wishlist/")
      if (ids.length === 0) {
        setFavorites([])
        return
      }
      
      // Ahora obtenemos el detalle de cada producto pos ID
      // En una API más robusta, tendríamos un endpoint /products/by-ids
      // Para este caso, cargamos todos y filtramos o hacemos peticiones paralelas
      const allProducts = await apiFetch<any[]>("/products/")
      const myFavorites = allProducts.filter(p => ids.includes(p.id))
      setFavorites(myFavorites)
    } catch (err) {
      console.error("Error al cargar favoritos:", err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadFavorites()
  }, [isAuthenticated])

  const handleRemoveFavorite = async (productId: number) => {
    try {
      await apiFetch(`/wishlist/toggle/${productId}`, { method: "POST" })
      setFavorites(prev => prev.filter(p => p.id !== productId))
      toast({ title: "Eliminado", description: "Producto quitado de tus favoritos." })
    } catch (err) {
      toast({ title: "Error", description: "No se pudo eliminar de favoritos.", variant: "destructive" })
    }
  }

  const handleAddToCart = async (product: any) => {
    const success = await addItem({
      id: product.id,
      name: product.name,
      price: Number(product.price),
      quantity: 1,
      image_url: product.image_url,
    })

    if (success) {
      toast({ title: "Producto agregado", description: `${product.name} fue añadido al carrito.` })
    }
  }

  if (!isAuthenticated && !isLoading) {
    return (
      <div className="flex min-h-screen flex-col">
        <SiteHeader />
        <main className="flex-1 flex items-center justify-center p-4 text-center">
           <div>
              <Heart className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-20" />
              <h2 className="text-2xl font-heading mb-2">Inicia Sesión</h2>
              <p className="text-muted-foreground mb-6">Debes estar conectado para ver tu lista de deseos.</p>
              <Button asChild><Link href="/login">Ir a Iniciar Sesión</Link></Button>
           </div>
        </main>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1 container py-8">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="md:w-1/4">
            <Card>
              <CardHeader>
                <CardTitle>Mi Cuenta</CardTitle>
                <CardDescription>Gestiona tu información personal y favoritos</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <nav className="flex flex-col">
                  <Link href="/cuenta" className="flex items-center gap-2 p-3 hover:bg-muted">
                    <User className="h-4 w-4" />
                    Perfil
                  </Link>
                  <Link href="/pedidos" className="flex items-center gap-2 p-3 hover:bg-muted">
                    <ShoppingBag className="h-4 w-4" />
                    Mis Pedidos
                  </Link>
                  <Link href="/favoritos" className="flex items-center gap-2 p-3 hover:bg-muted text-primary font-medium">
                    <Heart className="h-4 w-4 fill-primary" />
                    Favoritos
                  </Link>
                </nav>
              </CardContent>
            </Card>
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-6">
               <div>
                  <h1 className="font-heading text-3xl">Mis Favoritos</h1>
                  <p className="text-muted-foreground">Productos que has guardado para después</p>
               </div>
            </div>

            {isLoading ? (
               <div className="flex flex-col items-center justify-center py-20">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
               </div>
            ) : favorites.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {favorites.map((product) => (
                  <Card key={product.id} className="group overflow-hidden border-none shadow-sm hover:shadow-md transition-all">
                    <div className="relative aspect-[4/5] bg-muted">
                      <Image
                        src={product.image_url || "/placeholder.svg"}
                        alt={product.name}
                        fill
                        className="object-cover transition-transform group-hover:scale-105"
                      />
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => handleRemoveFavorite(product.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <CardContent className="p-4">
                      <p className="text-[10px] uppercase text-muted-foreground tracking-widest mb-1">
                         {product.category?.name || "Boutique"}
                      </p>
                      <h3 className="font-heading text-lg mb-1 group-hover:text-primary transition-colors">
                        {product.name}
                      </h3>
                      <div className="flex items-center justify-between mt-4">
                        <span className="font-bold text-lg">${Number(product.price).toFixed(2)}</span>
                        <Button size="sm" variant="outline" className="gap-2" onClick={() => handleAddToCart(product)}>
                          <ShoppingCart className="h-4 w-4" />
                          Añadir
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="border-dashed py-16">
                 <CardContent className="flex flex-col items-center justify-center text-center">
                    <Heart className="w-12 h-12 text-muted-foreground mb-4 opacity-20" />
                    <p className="font-medium">Tu lista de deseos está vacía</p>
                    <p className="text-sm text-muted-foreground mt-1 mb-6">
                      Explora el catálogo y guarda lo que más te guste clicando en el corazón.
                    </p>
                    <Button asChild>
                      <Link href="/catalogo">Ver productos</Link>
                    </Button>
                 </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
      <Toaster />
    </div>
  )
}
