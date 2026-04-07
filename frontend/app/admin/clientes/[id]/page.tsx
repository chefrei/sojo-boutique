"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { ArrowLeft, Edit, ShoppingBag, Loader2, CreditCard, UserCircle } from "lucide-react"
import { apiFetch } from "@/lib/api"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

export default function ClienteDetallePage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [client, setClient] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadClient() {
      try {
        const data = await apiFetch(`/customers/${params.id}`)
        setClient(data)
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "No se pudo cargar la información del cliente.",
          variant: "destructive"
        })
        if (error.message && error.message.includes("no encontrado")) {
          router.push("/admin/clientes")
        }
      } finally {
        setIsLoading(false)
      }
    }
    loadClient()
  }, [params.id, router])

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!client) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] space-y-4">
        <h2 className="text-2xl font-bold">Cliente no encontrado</h2>
        <Button asChild>
          <Link href="/admin/clientes">Volver a clientes</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild>
            <Link href="/admin/clientes">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Volver</span>
            </Link>
          </Button>
          <div>
            <h2 className="text-2xl font-heading flex items-center gap-2">
              {client.name}
              <Badge variant={client.status === "active" ? "default" : "secondary"}>
                {client.status === "active" ? "Activo" : "Inactivo"}
              </Badge>
            </h2>
            <p className="text-muted-foreground">{client.email || "Sin correo electrónico registrado"}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={`/admin/ventas/nueva?cliente=${client.id}`}>
              <ShoppingBag className="mr-2 h-4 w-4" />
              Nueva Venta
            </Link>
          </Button>
          <Button asChild>
            <Link href={`/admin/clientes/${client.id}/editar`}>
              <Edit className="mr-2 h-4 w-4" />
              Editar Cliente
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-6 md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Información Personal</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8">
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Teléfono</dt>
                  <dd className="font-medium mt-1">{client.phone || "—"}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Identificación ({client.identificationType?.toUpperCase() || "DNI"})</dt>
                  <dd className="font-medium mt-1">{client.identificationNumber || "—"}</dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-sm font-medium text-muted-foreground">Dirección</dt>
                  <dd className="font-medium mt-1">
                    {[client.address, client.city, client.state, client.postalCode].filter(Boolean).join(", ") || "—"}
                  </dd>
                </div>
              </div>

              {client.notes && (
                <>
                  <Separator />
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground mb-2">Notas Adicionales</dt>
                    <dd className="bg-muted p-4 rounded-md text-sm whitespace-pre-wrap">
                      {client.notes}
                    </dd>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle>Resumen Financiero</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Total Compras</span>
                </div>
                <span className="font-bold text-lg">{client.compras}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Deuda Pendiente</span>
                </div>
                <span className={`font-bold text-lg ${client.deuda > 0 ? "text-amber-500" : "text-green-500"}`}>
                  ${Number(client.deuda).toFixed(2)}
                </span>
              </div>
              {client.ultimaCompra && (
                <>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-muted-foreground text-sm">Última Compra</span>
                    <span className="text-sm">
                      {new Intl.DateTimeFormat("es-ES", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric"
                      }).format(new Date(client.ultimaCompra))}
                    </span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      <Toaster />
    </div>
  )
}
