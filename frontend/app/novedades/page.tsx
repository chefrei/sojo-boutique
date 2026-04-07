"use client"
import Link from "next/link"
import { SiteHeader } from "@/components/site-header"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export default function NovedadesPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1 flex items-center justify-center container">
        <div className="text-center space-y-4 max-w-md">
          <h1 className="text-4xl font-heading text-primary">Novedades</h1>
          <p className="text-muted-foreground">Estamos preparando la nueva colección. ¡Vuelve pronto para enterarte de lo más reciente en Sojo Boutique!</p>
          <Button asChild className="mt-4">
            <Link href="/"><ArrowLeft className="w-4 h-4 mr-2"/> Volver a la Tienda</Link>
          </Button>
        </div>
      </main>
    </div>
  )
}
