"use client"

import Link from "next/link"
import Image from "next/image"
import { ArrowRight, Loader2 } from "lucide-react"
import { useEffect, useState } from "react"
import { apiFetch } from "@/lib/api"

import { Button } from "@/components/ui/button"
import { SiteHeader } from "@/components/site-header"

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchFeatured() {
      try {
        const data = await apiFetch<any[]>("/products/")
        // Mostrar solo los primeros 4 productos como destacados
        setFeaturedProducts(data.slice(0, 4))
      } catch (error) {
        console.error("Error al cargar productos destacados:", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchFeatured()
  }, [])

  const categories = [
    {
      title: "Prendas",
      image: "/placeholder.svg?height=600&width=400",
      href: "/prendas",
    },
    {
      title: "Accesorios",
      image: "/placeholder.svg?height=600&width=400",
      href: "/accesorios",
    },
    {
      title: "Perfumes",
      image: "/placeholder.svg?height=600&width=400",
      href: "/perfumes",
    },
  ]

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative h-[70vh] overflow-hidden">
          <div className="absolute inset-0 bg-wood-bg opacity-20" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/90 to-background/60" />
          <div className="relative h-full flex justify-between items-center container">
            <div className="max-w-xl space-y-4">
              <h1 className="font-heading text-4xl md:text-6xl">Elegancia y Estilo en Cada Detalle</h1>
              <p className="text-lg text-muted-foreground">
                Descubre nuestra exclusiva colección de prendas, accesorios y perfumes diseñados para resaltar tu
                belleza natural.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button size="lg" asChild>
                  <Link href="/catalogo">
                    Ver Catálogo
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/novedades">Novedades</Link>
                </Button>
              </div>
            </div>
            <div className="hidden lg:flex items-center justify-center flex-1 pl-8">
              <Image
                src="/images/logo.png"
                alt="Sojo Boutique"
                width={400}
                height={400}
                className="object-contain"
                priority
              />
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <section className="py-16 container">
          <div className="flex flex-col items-center text-center mb-12">
            <h2 className="font-heading text-3xl md:text-4xl mb-4">Nuestras Categorías</h2>
            <div className="w-20 h-1 bg-primary rounded-full mb-4" />
            <p className="text-muted-foreground max-w-2xl">
              Explora nuestra variedad de productos cuidadosamente seleccionados para ti
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {categories.map((category) => (
              <Link key={category.title} href={category.href} className="group relative overflow-hidden rounded-lg">
                <div className="aspect-[3/4] overflow-hidden rounded-lg">
                  <Image
                    src={category.image || "/placeholder.svg"}
                    alt={category.title}
                    width={400}
                    height={600}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-6">
                  <div>
                    <h3 className="font-heading text-2xl text-white mb-2">{category.title}</h3>
                    <span className="inline-flex items-center text-white/90 text-sm">
                      Explorar
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Featured Products */}
        <section className="py-16 bg-muted/30">
          <div className="container">
            <div className="flex flex-col items-center text-center mb-12">
              <h2 className="font-heading text-3xl md:text-4xl mb-4">Productos Destacados</h2>
              <div className="w-20 h-1 bg-primary rounded-full mb-4" />
              <p className="text-muted-foreground max-w-2xl">Descubre nuestras piezas más populares y exclusivas</p>
            </div>

            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {featuredProducts.map((product) => (
                  <Link
                    key={product.id}
                    href={`/producto/${product.id}`}
                    className="group bg-background rounded-lg overflow-hidden border shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="aspect-square overflow-hidden">
                      <Image
                        src={product.image_url || "/placeholder.svg"}
                        alt={product.name}
                        width={300}
                        height={300}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                    <div className="p-4">
                      <div className="text-sm text-muted-foreground mb-1">{product.category?.name || "Sin categoría"}</div>
                      <h3 className="font-medium mb-1 group-hover:text-primary transition-colors line-clamp-1">{product.name}</h3>
                      <div className="font-semibold">${Number(product.price).toFixed(2)}</div>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            <div className="flex justify-center mt-10">
              <Button size="lg" variant="outline" asChild>
                <Link href="/catalogo">Ver Todo el Catálogo</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
