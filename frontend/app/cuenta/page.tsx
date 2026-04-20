"use client"

import { useAuth } from "@/contexts/auth-context"
import { SiteHeader } from "@/components/site-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ShoppingBag, Heart, User, Loader2, MapPin, Save } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { apiFetch } from "@/lib/api"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"

export default function CuentaPage() {
  const { user, refreshUser } = useAuth()
  const [isSaving, setIsSaving] = useState(false)
  
  // States corresponding to user's fields
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [birthdate, setBirthdate] = useState("")
  
  // Address states
  const [address, setAddress] = useState("")
  const [city, setCity] = useState("")
  const [state, setState] = useState("")
  const [postalCode, setPostalCode] = useState("")

  // Sync local state when user data is available or changes
  useEffect(() => {
    if (user) {
      setName(user.name || user.full_name || "")
      setPhone(user.phone || "")
      setBirthdate(user.birthdate || "")
      setAddress(user.address || "")
      setCity(user.city || "")
      setState(user.state || "")
      setPostalCode(user.postal_code || "")
    }
  }, [user])

  if (!user) {
    return (
      <div className="flex min-h-screen flex-col">
        <SiteHeader />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    )
  }

  const handleSaveProfile = async () => {
    try {
      setIsSaving(true)
      await apiFetch("/auth/me", {
        method: "PATCH",
        body: JSON.stringify({
          name: name,
          phone: phone,
          birthdate: birthdate,
          address: address,
          city: city,
          state: state,
          postal_code: postalCode
        })
      })
      
      toast({ title: "Perfil actualizado", description: "Tus datos han sido guardados exitosamente." })
      
      // Refresh global user state
      if (refreshUser) {
        await refreshUser()
      }
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
            <Card className="border-none shadow-md bg-muted/30">
              <CardHeader>
                <CardTitle className="font-heading">Mi Cuenta</CardTitle>
                <CardDescription>Gestiona tu información personal</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <nav className="flex flex-col">
                  <Link href="/cuenta" className="flex items-center gap-3 p-4 hover:bg-background transition-colors text-primary font-medium border-l-4 border-primary">
                    <User className="h-4 w-4" />
                    Perfil
                  </Link>
                  <Link href="/pedidos" className="flex items-center gap-3 p-4 hover:bg-background transition-colors text-muted-foreground border-l-4 border-transparent">
                    <ShoppingBag className="h-4 w-4" />
                    Mis Pedidos
                  </Link>
                  <Link href="/favoritos" className="flex items-center gap-3 p-4 hover:bg-background transition-colors text-muted-foreground border-l-4 border-transparent">
                    <Heart className="h-4 w-4" />
                    Favoritos
                  </Link>
                </nav>
              </CardContent>
            </Card>
          </div>
          
          <div className="flex-1">
            <Tabs defaultValue="perfil" className="space-y-6">
              <TabsList className="bg-muted/50 p-1">
                <TabsTrigger value="perfil" className="px-6">Información Personal</TabsTrigger>
                <TabsTrigger value="direcciones" className="px-6">Direcciones</TabsTrigger>
              </TabsList>
              
              <TabsContent value="perfil">
                <Card className="shadow-lg border-none">
                  <CardHeader className="border-b bg-muted/10">
                    <CardTitle className="font-heading text-2xl flex items-center gap-2">
                      <User className="h-6 w-6 text-primary" />
                      Información Personal
                    </CardTitle>
                    <CardDescription>Manten tus datos actualizados para una mejor experiencia</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Nombre completo</Label>
                        <Input 
                          id="name" 
                          value={name} 
                          onChange={(e) => setName(e.target.value)} 
                          className="h-11 focus-visible:ring-primary"
                          placeholder="Tu nombre completo"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Correo electrónico</Label>
                        <Input 
                          id="email" 
                          type="email" 
                          value={user.email} 
                          disabled 
                          className="h-11 bg-muted/50 text-muted-foreground cursor-not-allowed italic" 
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="phone" className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Teléfono</Label>
                        <Input 
                          id="phone" 
                          value={phone} 
                          onChange={(e) => setPhone(e.target.value)} 
                          className="h-11 focus-visible:ring-primary"
                          placeholder="Ej: +58 412 1234567" 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="birthday" className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Fecha de nacimiento</Label>
                        <Input 
                          id="birthday" 
                          type="date" 
                          value={birthdate} 
                          onChange={(e) => setBirthdate(e.target.value)} 
                          className="h-11 focus-visible:ring-primary"
                        />
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="border-t bg-muted/5 pt-6">
                    <Button onClick={handleSaveProfile} disabled={isSaving} className="h-11 px-8 rounded-full shadow-md hover:shadow-lg transition-all gap-2">
                      {isSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                      Guardar Cambios
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
              
              <TabsContent value="direcciones">
                <Card className="shadow-lg border-none">
                  <CardHeader className="border-b bg-muted/10">
                    <CardTitle className="font-heading text-2xl flex items-center gap-2">
                      <MapPin className="h-6 w-6 text-primary" />
                      Dirección de Envío
                    </CardTitle>
                    <CardDescription>Configura dónde quieres recibir tus pedidos</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6 space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="address" className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Calle / Avenida / Edificio</Label>
                      <Input 
                        id="address" 
                        value={address} 
                        onChange={(e) => setAddress(e.target.value)} 
                        className="h-11 focus-visible:ring-primary"
                        placeholder="Ej: Avenida Francisco de Miranda, Edif. Centro, Apto 4"
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="city" className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Ciudad</Label>
                        <Input 
                          id="city" 
                          value={city} 
                          onChange={(e) => setCity(e.target.value)} 
                          className="h-11 focus-visible:ring-primary"
                          placeholder="Ej: Caracas"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="state" className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Estado</Label>
                        <Input 
                          id="state" 
                          value={state} 
                          onChange={(e) => setState(e.target.value)} 
                          className="h-11 focus-visible:ring-primary"
                          placeholder="Ej: Miranda"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="postalCode" className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Código Postal</Label>
                        <Input 
                          id="postalCode" 
                          value={postalCode} 
                          onChange={(e) => setPostalCode(e.target.value)} 
                          className="h-11 focus-visible:ring-primary"
                          placeholder="Ej: 1010"
                        />
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="border-t bg-muted/5 pt-6">
                    <Button onClick={handleSaveProfile} disabled={isSaving} className="h-11 px-8 rounded-full shadow-md hover:shadow-lg transition-all gap-2">
                      {isSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                      Guardar Dirección
                    </Button>
                  </CardFooter>
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
