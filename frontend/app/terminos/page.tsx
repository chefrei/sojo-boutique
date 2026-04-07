"use client"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function TerminosPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-background border rounded-lg shadow-md p-8 max-w-lg text-center space-y-6">
        <h1 className="text-3xl font-heading text-primary">Términos de Servicio</h1>
        <p className="text-muted-foreground">Esta página se encuentra en construcción. Aquí aparecerán las directrices legales de la boutique.</p>
        <Button asChild variant="outline">
          <Link href="/login">Volver</Link>
        </Button>
      </div>
    </div>
  )
}
