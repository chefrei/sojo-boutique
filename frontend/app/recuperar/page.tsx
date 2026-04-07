"use client"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function RecuperarPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-background border rounded-lg shadow-md p-8 max-w-lg text-center space-y-6">
        <h1 className="text-3xl font-heading text-primary">Recuperar Contraseña</h1>
        <p className="text-muted-foreground">Por favor, contacta directamente con el proveedor técnico para restaurar credenciales administrativas de acceso.</p>
        <Button asChild variant="default">
          <Link href="/login">Volver al Login</Link>
        </Button>
      </div>
    </div>
  )
}
