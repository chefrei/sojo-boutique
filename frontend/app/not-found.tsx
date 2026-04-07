"use client"

import Link from "next/link"

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <h2 className="text-2xl font-bold">Página no encontrada</h2>
      <p className="text-muted-foreground">La página que buscas no existe o ha sido eliminada.</p>
      <Link 
        href="/"
        className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
      >
        Volver al inicio
      </Link>
    </div>
  )
}
