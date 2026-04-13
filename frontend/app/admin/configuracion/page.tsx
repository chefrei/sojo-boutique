"use client"

import { useState, useEffect } from "react"
import { useSettings } from "@/contexts/settings-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/components/ui/use-toast"
import { Loader2, Save, Upload, Palette, Building2, Type, Image as LucideImage } from "lucide-react"
import { apiFetch } from "@/lib/api"
import Image from "next/image"

// --- Helper Functions for Color Conversion ---

function hexToHsl(hex: string): string {
  let r = parseInt(hex.slice(1, 3), 16) / 255
  let g = parseInt(hex.slice(3, 5), 16) / 255
  let b = parseInt(hex.slice(5, 7), 16) / 255

  const max = Math.max(r, g, b), min = Math.min(r, g, b)
  let h = 0, s, l = (max + min) / 2

  if (max === min) {
    h = s = 0 
  } else {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break
      case g: h = (b - r) / d + 2; break
      case b: h = (r - g) / d + 4; break
    }
    h /= 6
  }

  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`
}

function hslToHex(hslStr: string): string {
  if (!hslStr) return "#000000"
  
  // Clean up and extract numbers
  const parts = hslStr.replace(/%/g, '').split(' ')
  if (parts.length < 3) return "#000000"
  
  let h = parseInt(parts[0]) / 360
  let s = parseInt(parts[1]) / 100
  let l = parseInt(parts[2]) / 100

  let r, g, b
  if (s === 0) {
    r = g = b = l
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1
      if (t > 1) t -= 1
      if (t < 1/6) return p + (q - p) * 6 * t
      if (t < 1/2) return q
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6
      return p
    }
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s
    const p = 2 * l - q
    r = hue2rgb(p, q, h + 1/3)
    g = hue2rgb(p, q, h)
    b = hue2rgb(p, q, h - 1/3)
  }

  const toHex = (x: number) => {
    const hex = Math.round(x * 255).toString(16)
    return hex.length === 1 ? '0' + hex : hex
  }
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

export default function ConfiguracionPage() {
  const { settings, updateSettings, refreshSettings } = useSettings()
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  
  // Local state for the form
  const [formData, setFormData] = useState({
    business_name: "",
    slogan: "",
    rif: "",
    phone: "",
    address: "",
    email: "",
    primary_color: "",
    accent_color: "",
    heading_font: "",
    body_font: "",
    logo_url: ""
  })

  useEffect(() => {
    if (settings) {
      setFormData({
        business_name: settings.business_name || "",
        slogan: settings.slogan || "",
        rif: settings.rif || "",
        phone: settings.phone || "",
        address: settings.address || "",
        email: settings.email || "",
        primary_color: settings.primary_color || "",
        accent_color: settings.accent_color || "",
        heading_font: settings.heading_font || "",
        body_font: settings.body_font || "",
        logo_url: settings.logo_url || ""
      })
    }
  }, [settings])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSave = async () => {
    try {
      setLoading(true)
      await updateSettings(formData)
      toast({ title: "Configuración guardada", description: "Los cambios se han aplicado correctamente." })
    } catch (error) {
      toast({ title: "Error", description: "No se pudieron guardar los cambios.", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setUploading(true)
      const uploadFormData = new FormData()
      uploadFormData.append("file", file)

      const response = await apiFetch<{ image_url: string }>("/upload", {
        method: "POST",
        body: uploadFormData
      })

      setFormData(prev => ({ ...prev, logo_url: response.image_url }))
      toast({ title: "Logo cargado", description: "Imagen subida exitosamente. Haz clic en guardar para aplicar." })
    } catch (error) {
      toast({ title: "Error de carga", description: "No se pudo subir el logo.", variant: "destructive" })
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-heading">Configuración del Sistema</h2>
          <p className="text-muted-foreground">Personaliza la identidad visual y datos de tu boutique</p>
        </div>
        <Button onClick={handleSave} disabled={loading}>
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          Guardar Cambios
        </Button>
      </div>

      <Tabs defaultValue="negocio" className="w-full">
        <TabsList className="grid w-full grid-cols-3 md:w-[400px]">
          <TabsTrigger value="negocio">
            <Building2 className="w-4 h-4 mr-2" />
            Negocio
          </TabsTrigger>
          <TabsTrigger value="apariencia">
            <Palette className="w-4 h-4 mr-2" />
            Apariencia
          </TabsTrigger>
          <TabsTrigger value="logo">
            <LucideImage className="w-4 h-4 mr-2" />
            Identidad
          </TabsTrigger>
        </TabsList>

        <TabsContent value="negocio" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Información Corporativa</CardTitle>
              <CardDescription>Estos datos aparecerán en tus reportes PDF y correos.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="business_name">Nombre del Negocio</Label>
                  <Input 
                    id="business_name" 
                    name="business_name" 
                    value={formData.business_name} 
                    onChange={handleChange} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rif">RIF / Identificación Fiscal</Label>
                  <Input 
                    id="rif" 
                    name="rif" 
                    value={formData.rif} 
                    onChange={handleChange} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Teléfono de Contacto</Label>
                  <Input 
                    id="phone" 
                    name="phone" 
                    value={formData.phone} 
                    onChange={handleChange} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Correo Electrónico</Label>
                  <Input 
                    id="email" 
                    name="email" 
                    type="email"
                    value={formData.email} 
                    onChange={handleChange} 
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="address">Dirección Física</Label>
                  <Input 
                    id="address" 
                    name="address" 
                    value={formData.address} 
                    onChange={handleChange} 
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="slogan">Slogan o Red Social</Label>
                  <Input 
                    id="slogan" 
                    name="slogan" 
                    value={formData.slogan} 
                    onChange={handleChange} 
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="apariencia" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Personalización Visual</CardTitle>
              <CardDescription>Define los colores y las fuentes que rigen el sistema.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold flex items-center">
                    <Palette className="w-4 h-4 mr-2" /> Colores (Formato HSL)
                  </h3>
                  <div className="space-y-2">
                    <Label htmlFor="primary_color">Color Primario (Botones, Títulos)</Label>
                    <div className="flex gap-2">
                      <div 
                        className="w-10 h-10 rounded border relative overflow-hidden flex-shrink-0" 
                        style={{ backgroundColor: `hsl(${formData.primary_color})` }}
                      >
                        <Input 
                          type="color"
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          value={hslToHex(formData.primary_color)}
                          onChange={(e) => {
                             const hsl = hexToHsl(e.target.value)
                             setFormData(prev => ({ ...prev, primary_color: hsl }))
                          }}
                        />
                      </div>
                      <Input 
                        id="primary_color" 
                        name="primary_color" 
                        value={formData.primary_color} 
                        onChange={handleChange} 
                        placeholder="350 65% 65%"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="accent_color">Color de Acento (Hover, Badges)</Label>
                    <div className="flex gap-2">
                      <div 
                        className="w-10 h-10 rounded border relative overflow-hidden flex-shrink-0" 
                        style={{ backgroundColor: `hsl(${formData.accent_color})` }}
                      >
                         <Input 
                          type="color"
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          value={hslToHex(formData.accent_color)}
                          onChange={(e) => {
                             const hsl = hexToHsl(e.target.value)
                             setFormData(prev => ({ ...prev, accent_color: hsl }))
                          }}
                        />
                      </div>
                      <Input 
                        id="accent_color" 
                        name="accent_color" 
                        value={formData.accent_color} 
                        onChange={handleChange} 
                        placeholder="15 75% 75%"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-semibold flex items-center">
                    <Type className="w-4 h-4 mr-2" /> Tipografía (Google Fonts)
                  </h3>
                  <div className="space-y-2">
                    <Label htmlFor="heading_font">Fuente de Títulos</Label>
                    <Input 
                      id="heading_font" 
                      name="heading_font" 
                      value={formData.heading_font} 
                      onChange={handleChange} 
                      placeholder="Great Vibes"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="body_font">Fuente de Cuerpo</Label>
                    <Input 
                      id="body_font" 
                      name="body_font" 
                      value={formData.body_font} 
                      onChange={handleChange} 
                      placeholder="Mona Sans"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="bg-muted/50 p-4 text-xs text-muted-foreground italic">
              * El formato de color debe ser H o H S% L% (ej: 350 65% 65%). Las fuentes deben ser nombres válidos de Google Fonts.
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="logo" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Logo del Negocio</CardTitle>
              <CardDescription>
                Esta imagen aparecerá en el menú principal y en los encabezados de tus PDF.
                Las imágenes se guardan con un identificador único para evitar que se borren reportes anteriores.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 flex flex-col items-center">
              <div className="relative w-48 h-48 border-2 border-dashed rounded-lg flex items-center justify-center bg-muted overflow-hidden">
                {formData.logo_url ? (
                  <img 
                    src={formData.logo_url} 
                    alt="Logo Vista Previa" 
                    className="object-contain w-full h-full p-2"
                  />
                ) : (
                  <LucideImage className="w-12 h-12 text-muted-foreground" />
                )}
                {uploading && (
                  <div className="absolute inset-0 bg-background/50 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin" />
                  </div>
                )}
              </div>

              <div className="flex items-center gap-4">
                <Button variant="outline" className="relative cursor-pointer">
                  <Upload className="w-4 h-4 mr-2" />
                  Subir Nuevo Logo
                  <Input 
                    type="file" 
                    className="absolute inset-0 opacity-0 cursor-pointer text-[0px]" 
                    onChange={handleLogoUpload}
                    accept="image/*"
                  />
                </Button>
                {formData.logo_url && (
                  <Button variant="ghost" className="text-destructive" onClick={() => setFormData(p => ({ ...p, logo_url: "" }))}>
                    Eliminar
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
