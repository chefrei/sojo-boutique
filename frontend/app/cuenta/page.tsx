"use client"

import { useAuth } from "@/contexts/auth-context"
import { SiteHeader } from "@/components/site-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ShoppingBag, Heart, Settings, User } from "lucide-react"
import Link from "next/link"

export default function CuentaPage() {
  const { user } = useAuth()

  if (!user) {
    return null // Esto no debería ocurrir debido al middleware, pero por si acaso
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1 container py-8">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="md:w-1/4">
            <Card>
              <CardHeader>
                <CardTitle>Mi Cuenta</CardTitle>
                <CardDescription>Gestiona tu información personal y pedidos</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <nav className="flex flex-col">
                  <Link href="/cuenta" className="flex items-center gap-2 p-3 hover:bg-muted text-primary">
                    <User className="h-4 w-4" />
                    Perfil
                  </Link>
                  <Link href="/pedidos" className="flex items-center gap-2 p-3 hover:bg-muted">
                    <ShoppingBag className="h-4 w-4" />
                    Mis Pedidos
                  </Link>
                  <Link href="/favoritos" className="flex items-center gap-2 p-3 hover:bg-muted">
                    <Heart className="h-4 w-4" />
                    Favoritos
                  </Link>
                  <Link href="/cuenta/configuracion" className="flex items-center gap-2 p-3 hover:bg-muted">
                    <Settings className="h-4 w-4" />
                    Configuración
                  </Link>
                </nav>
              </CardContent>
            </Card>
          </div>
          <div className="flex-1">
            <Tabs defaultValue="perfil">
              <TabsList className="mb-4">
                <TabsTrigger value="perfil">Información Personal</TabsTrigger>
                <TabsTrigger value="direcciones">Direcciones</TabsTrigger>
              </TabsList>
              <TabsContent value="perfil">
                <Card>
                  <CardHeader>
                    <CardTitle>Información Personal</CardTitle>
                    <CardDescription>Actualiza tu información personal</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Nombre completo</Label>
                        <Input id="name" defaultValue={user.name} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Correo electrónico</Label>
                        <Input id="email" type="email" defaultValue={user.email} />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="phone">Teléfono</Label>
                        <Input id="phone" placeholder="Tu número de teléfono" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="birthday">Fecha de nacimiento</Label>
                        <Input id="birthday" type="date" />
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button>Guardar Cambios</Button>
                  </CardFooter>
                </Card>
              </TabsContent>
              <TabsContent value="direcciones">
                <Card>
                  <CardHeader>
                    <CardTitle>Direcciones</CardTitle>
                    <CardDescription>Gestiona tus direcciones de envío</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <p className="text-muted-foreground mb-4">No tienes direcciones guardadas</p>
                      <Button>Añadir Nueva Dirección</Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  )
}
