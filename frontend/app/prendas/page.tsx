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

export default function PrendasPage() {
  // Datos de ejemplo
  const prendas = [
    {
      id: 1,
      name: "Vestido Floral Primavera",
      price: 89.99,
      image: "/placeholder.svg?height=400&width=300",
      category: "Prendas",
      subcategory: "Vestidos",
    },
    {
      id: 2,
      name: "Blusa Seda Premium",
      price: 65.99,
      image: "/placeholder.svg?height=400&width=300",
      category: "Prendas",
      subcategory: "Blusas",
    },
    {
      id: 3,
      name: "Falda Midi Elegante",
      price: 55.99,
      image: "/placeholder.svg?height=400&width=300",
      category: "Prendas",
      subcategory: "Faldas",
    },
    {
      id: 4,
      name: "Pantalón Casual Moderno",
      price: 72.5,
      image: "/placeholder.svg?height=400&width=300",
      category: "Prendas",
      subcategory: "Pantalones",
    },
    {
      id: 5,
      name: "Chaqueta Ligera Verano",
      price: 95.0,
      image: "/placeholder.svg?height=400&width=300",
      category: "Prendas",
      subcategory: "Chaquetas",
    },
    {
      id: 6,
      name: "Conjunto Dos Piezas",
      price: 110.0,
      image: "/placeholder.svg?height=400&width=300",
      category: "Prendas",
      subcategory: "Conjuntos",
    },
  ]

  const subcategorias = [
    { id: "vestidos", label: "Vestidos" },
    { id: "blusas", label: "Blusas" },
    { id: "faldas", label: "Faldas" },
    { id: "pantalones", label: "Pantalones" },
    { id: "chaquetas", label: "Chaquetas" },
    { id: "conjuntos", label: "Conjuntos" },
  ]

  const tallas = [
    { id: "xs", label: "XS" },
    { id: "s", label: "S" },
    { id: "m", label: "M" },
    { id: "l", label: "L" },
    { id: "xl", label: "XL" },
  ]

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <div className="container py-8">
          <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-8">
            <div>
              <h1 className="font-heading text-3xl md:text-4xl mb-2">Prendas</h1>
              <p className="text-muted-foreground">Descubre nuestra colección de prendas exclusivas</p>
            </div>

            <div className="flex items-center gap-4 w-full md:w-auto">
              <div className="relative w-full md:w-[300px]">
                <Input placeholder="Buscar prendas..." className="pr-10" />
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
                    <SheetDescription>Ajusta los filtros para encontrar tus prendas favoritas</SheetDescription>
                  </SheetHeader>
                  <div className="py-6 space-y-6">
                    <div className="space-y-4">
                      <h3 className="font-medium">Subcategorías</h3>
                      <div className="space-y-2">
                        {subcategorias.map((subcategoria) => (
                          <div key={subcategoria.id} className="flex items-center space-x-2">
                            <Checkbox id={subcategoria.id} />
                            <Label htmlFor={subcategoria.id}>{subcategoria.label}</Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="font-medium">Tallas</h3>
                      <div className="flex flex-wrap gap-2">
                        {tallas.map((talla) => (
                          <div key={talla.id} className="flex items-center space-x-2 border rounded-md px-3 py-1">
                            <Checkbox id={`talla-${talla.id}`} />
                            <Label htmlFor={`talla-${talla.id}`}>{talla.label}</Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="font-medium">Precio</h3>
                        <span className="text-sm text-muted-foreground">$50 - $120</span>
                      </div>
                      <Slider defaultValue={[50, 120]} min={50} max={120} step={1} />
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
            {prendas.map((prenda) => (
              <div
                key={prenda.id}
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
                <Link href={`/producto/${prenda.id}`}>
                  <div className="aspect-square overflow-hidden">
                    <Image
                      src={prenda.image || "/placeholder.svg"}
                      alt={prenda.name}
                      width={300}
                      height={300}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-4">
                    <div className="text-sm text-muted-foreground mb-1">{prenda.subcategory}</div>
                    <h3 className="font-medium mb-1 group-hover:text-primary transition-colors line-clamp-1">
                      {prenda.name}
                    </h3>
                    <div className="font-semibold">${prenda.price.toFixed(2)}</div>
                  </div>
                </Link>
              </div>
            ))}
          </div>

          <div className="flex justify-center mt-10">
            <Button variant="outline">Cargar Más Prendas</Button>
          </div>
        </div>
      </main>
    </div>
  )
}
