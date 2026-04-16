"use client"

import { useEffect, useState, Suspense } from "react"
import { SiteHeader } from "@/components/site-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Image from "next/image"
import Link from "next/link"
import { Heart, SlidersHorizontal, Loader2, ShoppingCart, Check, X } from "lucide-react"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { apiFetch } from "@/lib/api"
import { useCart } from "@/contexts/cart-context"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { useAuth } from "@/contexts/auth-context"
import { LoginDialog } from "@/components/login-dialog"

import { useSearchParams } from "next/navigation"

export default function CatalogoPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen flex-col">
        <SiteHeader />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    }>
      <CatalogoContent />
    </Suspense>
  )
}

function CatalogoContent() {
  const searchParams = useSearchParams()
  const searchQueryParam = searchParams.get("search") || ""
  
  const [products, setProducts] = useState<any[]>([])
  const [filteredProducts, setFilteredProducts] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [addedIds, setAddedIds] = useState<Set<number>>(new Set())
  const { addItem } = useCart()

  const { isAuthenticated } = useAuth()
  const [showLoginDialog, setShowLoginDialog] = useState(false)
  const [wishlist, setWishlist] = useState<number[]>([])

  // Filtros
  const [searchQuery, setSearchQuery] = useState(searchQueryParam)
  const [selectedCategories, setSelectedCategories] = useState<number[]>([])
  const [priceRange, setPriceRange] = useState([0, 500])
  const [sortBy, setSortBy] = useState("newest")

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
          apiFetch<any[]>("/products/", { auth: false }),
          apiFetch<any[]>("/products/categories", { auth: false })
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

  useEffect(() => {
    setSearchQuery(searchQueryParam)
  }, [searchQueryParam])

  useEffect(() => {
    let result = [...products]

    // Filtrar por búsqueda
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(p => 
        p.name.toLowerCase().includes(query) || 
        p.description.toLowerCase().includes(query)
      )
    }

    // Filtrar por categorías
    if (selectedCategories.length > 0) {
      result = result.filter(p => selectedCategories.includes(p.category_id))
    }

    // Filtrar por precio
    result = result.filter(p => Number(p.price) >= priceRange[0] && Number(p.price) <= priceRange[1])

    // Ordenar
    if (sortBy === "price-low") {
      result.sort((a, b) => Number(a.price) - Number(b.price))
    } else if (sortBy === "price-high") {
      result.sort((a, b) => Number(b.price) - Number(a.price))
    } else if (sortBy === "newest") {
      result.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime())
    }

    setFilteredProducts(result)
  }, [products, searchQuery, selectedCategories, priceRange, sortBy])

  useEffect(() => {
    async function fetchWishlist() {
      if (isAuthenticated) {
        try {
          const data = await apiFetch<number[]>("/wishlist/")
          setWishlist(data)
        } catch (error) {
          console.error("Error al cargar favoritos:", error)
        }
      } else {
        setWishlist([])
      }
    }
    fetchWishlist()
  }, [isAuthenticated])

  const handleToggleWishlist = async (e: React.MouseEvent, productId: number) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!isAuthenticated) {
      setShowLoginDialog(true)
      return
    }

    try {
      const res = await apiFetch<any>(`/wishlist/toggle/${productId}`, { method: "POST" })
      if (res.action === "added") {
        setWishlist(prev => [...prev, productId])
      } else {
        setWishlist(prev => prev.filter(id => id !== productId))
      }
    } catch (error) {
      toast({ title: "Error", description: "No se pudo actualizar favoritos", variant: "destructive" })
    }
  }

  const toggleCategory = (id: number) => {
    setSelectedCategories(prev => 
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    )
  }

  const isNewProduct = (dateStr: string) => {
    if (!dateStr) return false
    const date = new Date(dateStr)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays <= 30
  }

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
          <div className="flex flex-col md:flex-row gap-8">
            <div className="flex-1 space-y-8">
              {/* Filtros de Categorías Estilo Pills */}
              <div className="flex flex-wrap gap-2 pb-2">
                <Button 
                  variant={selectedCategories.length === 0 ? "default" : "outline"} 
                  size="sm" 
                  className="rounded-full px-5"
                  onClick={() => setSelectedCategories([])}
                >
                  Todos
                </Button>
                {categories.map((category) => (
                  <Button 
                    key={category.id}
                    variant={selectedCategories.includes(category.id) ? "default" : "outline"} 
                    size="sm" 
                    className="rounded-full px-5"
                    onClick={() => toggleCategory(category.id)}
                  >
                    {category.name}
                  </Button>
                ))}
              </div>

              {/* Barra de Filtros Activos y Búsqueda */}
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-muted/30 p-4 rounded-xl border border-dashed">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="text-sm font-medium mr-2">Filtros activos:</div>
                  {searchQuery && (
                    <Badge variant="secondary" className="gap-1 pl-2 pr-1 py-1">
                      Búsqueda: {searchQuery}
                      <Button variant="ghost" size="icon" className="h-4 w-4 rounded-full" onClick={() => setSearchQuery("")}>
                        <Check className="h-3 w-3 rotate-45" />
                      </Button>
                    </Badge>
                  )}
                  {selectedCategories.length > 0 && (
                    <Badge variant="secondary" className="gap-1 pl-2 pr-1 py-1">
                      Categorías ({selectedCategories.length})
                      <Button variant="ghost" size="icon" className="h-4 w-4 rounded-full" onClick={() => setSelectedCategories([])}>
                        <Check className="h-3 w-3 rotate-45" />
                      </Button>
                    </Badge>
                  )}
                  {(priceRange[0] > 0 || priceRange[1] < 500) && (
                    <Badge variant="secondary" className="gap-1 pl-2 pr-1 py-1">
                      ${priceRange[0]} - ${priceRange[1]}
                      <Button variant="ghost" size="icon" className="h-4 w-4 rounded-full" onClick={() => setPriceRange([0, 500])}>
                        <Check className="h-3 w-3 rotate-45" />
                      </Button>
                    </Badge>
                  )}
                  {(!searchQuery && selectedCategories.length === 0 && priceRange[0] === 0 && priceRange[1] === 500) && (
                    <span className="text-sm text-muted-foreground italic">Ninguno</span>
                  )}
                </div>

                <div className="flex items-center gap-3 w-full lg:w-auto">
                  <div className="relative flex-1 lg:w-[250px]">
                    <Input 
                      placeholder="Buscar por nombre..." 
                      className="h-9 bg-background" 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-[160px] h-9 bg-background focus:ring-1">
                      <SelectValue placeholder="Ordenar" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">Más Recientes</SelectItem>
                      <SelectItem value="price-low">Precio: Menor a Mayor</SelectItem>
                      <SelectItem value="price-high">Precio: Mayor a Menor</SelectItem>
                    </SelectContent>
                  </Select>

                  <Sheet>
                    <SheetTrigger asChild>
                      <Button variant="outline" size="sm" className="gap-2">
                        <SlidersHorizontal className="h-4 w-4" />
                        Avanzado
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="right">
                      <SheetHeader>
                        <SheetTitle>Filtros Avanzados</SheetTitle>
                        <SheetDescription>Ajusta el rango de precios y otros parámetros.</SheetDescription>
                      </SheetHeader>
                      <div className="py-6 space-y-8">
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">Rango de Precio</h3>
                            <span className="text-sm font-semibold">${priceRange[0]} - ${priceRange[1]}</span>
                          </div>
                          <Slider 
                            defaultValue={[0, 500]} 
                            max={500} 
                            step={10} 
                            value={priceRange}
                            onValueChange={setPriceRange}
                            className="py-4"
                          />
                        </div>
                        <Button className="w-full" onClick={() => { setPriceRange([0, 500]); }}>
                          Reiniciar Precio
                        </Button>
                      </div>
                    </SheetContent>
                  </Sheet>
                </div>
              </div>

              {filteredProducts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 bg-muted/20 rounded-xl border border-dashed text-center">
                  <SlidersHorizontal className="w-12 h-12 mb-4 opacity-20" />
                  <p className="text-lg font-medium">No hay resultados</p>
                  <p className="text-muted-foreground text-sm">Prueba ajustando los filtros o la búsqueda</p>
                  <Button variant="link" onClick={() => { setSearchQuery(""); setSelectedCategories([]); setPriceRange([0,500]); }}>
                    Limpiar Filtros
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                  {filteredProducts.map((product) => (
                    <div
                      key={product.id}
                      className="group relative bg-background rounded-xl overflow-hidden border shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col"
                    >
                      {isNewProduct(product.created_at) && (
                        <div className="absolute top-3 left-3 z-10">
                          <span className="bg-primary text-primary-foreground text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">
                            Nuevo
                          </span>
                        </div>
                      )}
                      
                      <div className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant={wishlist.includes(product.id) ? "default" : "secondary"}
                          size="icon"
                          className="h-8 w-8 rounded-full shadow-md"
                          onClick={(e) => handleToggleWishlist(e, product.id)}
                        >
                          <Heart className={`h-4 w-4 ${wishlist.includes(product.id) ? "fill-white" : ""}`} />
                        </Button>
                      </div>

                      <Link href={`/producto/${product.id}`} className="flex-1">
                        <div className="aspect-[4/5] overflow-hidden bg-muted">
                          <Image
                            src={product.image_url || "/placeholder.svg"}
                            alt={product.name}
                            width={400}
                            height={500}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                        </div>
                        <div className="p-4">
                          <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">
                            {product.category?.name || "Boutique"}
                          </p>
                          <h3 className="font-heading text-lg mb-1 group-hover:text-primary transition-colors line-clamp-1">
                            {product.name}
                          </h3>
                          <div className="font-bold text-xl">${Number(product.price).toFixed(2)}</div>
                        </div>
                      </Link>

                      <div className="px-4 pb-4">
                        <Button
                          size="sm"
                          className="w-full gap-2 rounded-lg"
                          variant={addedIds.has(product.id) ? "secondary" : "default"}
                          onClick={() => handleAddToCart(product)}
                        >
                          {addedIds.has(product.id) ? (
                            <><Check className="h-4 w-4" /> En carrito</>
                          ) : (
                            <><ShoppingCart className="h-4 w-4" /> Añadir</>
                          )}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
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
        message="Inicia sesión para añadir productos a tu carrito y disfrutar de Sojo Boutique."
      />
      <Toaster />
    </div>
  )
}
