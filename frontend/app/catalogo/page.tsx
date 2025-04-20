import { SiteHeader } from "@/components/site-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Image from "next/image"
import Link from "next/link"
import { Heart, SlidersHorizontal } from "lucide-react"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"

export default function CatalogoPage() {
  // Datos de ejemplo
  const products = [
    {
      id: 1,
      name: "Vestido Floral Primavera",
      price: 89.99,
      image: "/placeholder.svg?height=400&width=300",
      category: "Prendas",
    },
    {
      id: 2,
      name: "Collar Perlas Elegance",
      price: 45.5,
      image: "/placeholder.svg?height=400&width=300",
      category: "Accesorios",
    },
    {
      id: 3,
      name: "Perfume Rosa Silvestre",
      price: 75.0,
      image: "/placeholder.svg?height=400&width=300",
      category: "Perfumes",
    },
    {
      id: 4,
      name: "Blusa Seda Premium",
      price: 65.99,
      image: "/placeholder.svg?height=400&width=300",
      category: "Prendas",
    },
    {
      id: 5,
      name: "Aretes Cristal Dorado",
      price: 35.5,
      image: "/placeholder.svg?height=400&width=300",
      category: "Accesorios",
    },
    {
      id: 6,
      name: "Falda Midi Elegante",
      price: 55.99,
      image: "/placeholder.svg?height=400&width=300",
      category: "Prendas",
    },
    {
      id: 7,
      name: "Perfume Noche Encantada",
      price: 82.0,
      image: "/placeholder.svg?height=400&width=300",
      category: "Perfumes",
    },
    {
      id: 8,
      name: "Pulsera Plata Delicada",
      price: 29.99,
      image: "/placeholder.svg?height=400&width=300",
      category: "Accesorios",
    },
  ]

  const categories = [
    { id: "prendas", label: "Prendas" },
    { id: "accesorios", label: "Accesorios" },
    { id: "perfumes", label: "Perfumes" },
  ]

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <div className="container py-8">
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
                            <Checkbox id={category.id} />
                            <Label htmlFor={category.id}>{category.label}</Label>
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
                className="group relative bg-background rounded-lg overflow-hidden border shadow-sm hover:shadow-md transition-shadow"
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
                <Link href={`/producto/${product.id}`}>
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
              </div>
            ))}
          </div>

          <div className="flex justify-center mt-10">
            <Button variant="outline">Cargar Más Productos</Button>
          </div>
        </div>
      </main>
    </div>
  )
}
