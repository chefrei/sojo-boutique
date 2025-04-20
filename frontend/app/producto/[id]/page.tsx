import { SiteHeader } from "@/components/site-header"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Image from "next/image"
import Link from "next/link"
import { Heart, Minus, Plus, Share2, ShoppingBag, Star } from "lucide-react"

export default function ProductoPage({ params }: { params: { id: string } }) {
  // Datos de ejemplo
  const product = {
    id: Number.parseInt(params.id),
    name: "Vestido Floral Primavera",
    price: 89.99,
    description:
      "Elegante vestido floral perfecto para la temporada de primavera. Confeccionado con tela de alta calidad que garantiza comodidad y durabilidad. El estampado floral añade un toque de frescura y feminidad a tu guardarropa.",
    details:
      "Material: 95% Algodón, 5% Elastano\nCuidado: Lavado a máquina, agua fría\nLargo: Midi\nCuello: V\nMangas: Cortas\nEstilo: Casual, Elegante\nTemporada: Primavera/Verano",
    category: "Prendas",
    stock: 15,
    rating: 4.5,
    reviews: 24,
    images: [
      "/placeholder.svg?height=600&width=500",
      "/placeholder.svg?height=600&width=500",
      "/placeholder.svg?height=600&width=500",
      "/placeholder.svg?height=600&width=500",
    ],
    colors: ["Negro", "Blanco", "Rosa"],
    sizes: ["XS", "S", "M", "L", "XL"],
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
                  src={product.images[0] || "/placeholder.svg"}
                  alt={product.name}
                  width={500}
                  height={600}
                  className="h-full w-full object-cover"
                  priority
                />
              </div>
              <div className="grid grid-cols-4 gap-2">
                {product.images.map((image, index) => (
                  <div
                    key={index}
                    className={`aspect-square overflow-hidden rounded-md border cursor-pointer ${index === 0 ? "ring-2 ring-primary" : ""}`}
                  >
                    <Image
                      src={image || "/placeholder.svg"}
                      alt={`${product.name} - Vista ${index + 1}`}
                      width={120}
                      height={120}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Información del producto - Responsivo */}
            <div className="space-y-6">
              <div>
                <div className="text-sm text-muted-foreground mb-1">
                  <Link href={`/catalogo?categoria=${product.category.toLowerCase()}`} className="hover:text-primary">
                    {product.category}
                  </Link>
                </div>
                <h1 className="font-heading text-2xl sm:text-3xl md:text-4xl">{product.name}</h1>
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${i < Math.floor(product.rating) ? "fill-primary text-primary" : i < product.rating ? "fill-primary text-primary" : "text-muted-foreground"}`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground">({product.reviews} reseñas)</span>
                </div>
              </div>

              <div className="text-2xl font-semibold">${product.price.toFixed(2)}</div>

              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">Color</h3>
                  <div className="flex flex-wrap gap-2">
                    {product.colors.map((color) => (
                      <Button key={color} variant="outline" className="rounded-md">
                        {color}
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-2">Talla</h3>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map((size) => (
                      <Button key={size} variant="outline" className="rounded-md min-w-[3rem]">
                        {size}
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-2">Cantidad</h3>
                  <div className="flex items-center">
                    <Button variant="outline" size="icon" className="rounded-r-none">
                      <Minus className="h-4 w-4" />
                    </Button>
                    <div className="px-4 py-2 border-y text-center w-12">1</div>
                    <Button variant="outline" size="icon" className="rounded-l-none">
                      <Plus className="h-4 w-4" />
                    </Button>
                    <div className="ml-4 text-sm text-muted-foreground">{product.stock} disponibles</div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-2">
                <Button size="lg" className="flex-1">
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
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="description">Descripción</TabsTrigger>
                  <TabsTrigger value="details">Detalles</TabsTrigger>
                  <TabsTrigger value="reviews">Reseñas</TabsTrigger>
                </TabsList>
                <TabsContent value="description" className="pt-4">
                  <p className="text-muted-foreground">{product.description}</p>
                </TabsContent>
                <TabsContent value="details" className="pt-4">
                  <pre className="text-sm text-muted-foreground whitespace-pre-line font-sans">{product.details}</pre>
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

          {/* Productos relacionados - Responsivo */}
          <div className="mt-16">
            <h2 className="font-heading text-2xl mb-6">También te puede interesar</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {relatedProducts.map((product) => (
                <Link
                  key={product.id}
                  href={`/producto/${product.id}`}
                  className="group bg-background rounded-lg overflow-hidden border shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="aspect-square overflow-hidden">
                    <Image
                      src={product.image || "/placeholder.svg"}
                      alt={product.name}
                      width={300}
                      height={300}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-4">
                    <div className="text-sm text-muted-foreground mb-1">{product.category}</div>
                    <h3 className="font-medium mb-1 group-hover:text-primary transition-colors line-clamp-1">
                      {product.name}
                    </h3>
                    <div className="font-semibold">${product.price.toFixed(2)}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
