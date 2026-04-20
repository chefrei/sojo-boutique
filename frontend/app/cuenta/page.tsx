"use client"

import { useAuth } from "@/contexts/auth-context"
import { SiteHeader } from "@/components/site-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ShoppingBag, Heart, Settings, User, Loader2 } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { apiFetch } from "@/lib/api"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"

export default function CuentaPage() {
  const { user, mutate } = useAuth() as any
  const [isSaving, setIsSaving] = useState(false)
  
  // States corresponding to user's fields
  const [name, setName] = useState(user?.name || "")
  const [phone, setPhone] = useState(user?.phone || "")
  const [birthdate, setBirthdate] = useState(user?.birthdate || "")

  if (!user) {
    return null // Esto no debería ocurrir debido al middleware, pero por si acaso
  }

  const handleSaveProfile = async () => {
    try {
      setIsSaving(true)
      await apiFetch("/auth/me", {
        method: "PATCH",
        body: JSON.stringify({
          name: name,
          phone: phone,
          birthdate: birthdate
        })
      })
      toast({ title: "Perfil actualizado", description: "Tus datos han sido guardados exitosamente." })
      if(mutate) mutate(); // Pide a auth-context que actualice o recargue la sesion, opcional.
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "No se pudieron guardar los cambios.", variant: "destructive" })
    } finally {
      setIsSaving(false)
    }
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
                        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Correo electrónico</Label>
                        <Input id="email" type="email" value={user.email} disabled className="bg-muted text-muted-foreground" />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="phone">Teléfono</Label>
                        <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Tu número de teléfono" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="birthday">Fecha de nacimiento</Label>
                        <Input id="birthday" type="date" value={birthdate} onChange={(e) => setBirthdate(e.target.value)} />
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button onClick={handleSaveProfile} disabled={isSaving}>
                      {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Guardar Cambios
                    </Button>
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
      <Toaster />
    </div>
  )
}
