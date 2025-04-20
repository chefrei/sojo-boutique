import { Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

export default function ConfiguracionPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-heading">Configuración</h2>
        <p className="text-muted-foreground">Administra la configuración de tu tienda</p>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="notificaciones">Notificaciones</TabsTrigger>
          <TabsTrigger value="pagos">Pagos</TabsTrigger>
          <TabsTrigger value="usuarios">Usuarios</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Información de la Tienda</CardTitle>
              <CardDescription>
                Configura la información básica de tu tienda
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="nombre">Nombre de la Tienda</Label>
                  <Input id="nombre" placeholder="Sojo Boutique" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="telefono">Teléfono</Label>
                  <Input id="telefono" placeholder="+51 999 888 777" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Correo Electrónico</Label>
                  <Input id="email" type="email" placeholder="contacto@sojoboutique.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="moneda">Moneda</Label>
                  <Select defaultValue="pen">
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona una moneda" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pen">Soles (PEN)</SelectItem>
                      <SelectItem value="usd">Dólares (USD)</SelectItem>
                      <SelectItem value="eur">Euros (EUR)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="direccion">Dirección</Label>
                <Textarea id="direccion" placeholder="Av. Principal 123, Ciudad" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Preferencias</CardTitle>
              <CardDescription>
                Personaliza el comportamiento de tu tienda
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="stock">Control de Stock</Label>
                <Switch id="stock" />
              </div>
              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="notificaciones-stock">Notificaciones de Stock Bajo</Label>
                <Switch id="notificaciones-stock" />
              </div>
              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="impuestos">Mostrar Precios con Impuestos</Label>
                <Switch id="impuestos" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notificaciones" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configuración de Notificaciones</CardTitle>
              <CardDescription>
                Administra las notificaciones del sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="email-pedidos">Notificaciones por Email de Nuevos Pedidos</Label>
                <Switch id="email-pedidos" />
              </div>
              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="email-pagos">Notificaciones por Email de Pagos</Label>
                <Switch id="email-pagos" />
              </div>
              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="recordatorios">Recordatorios de Pagos Pendientes</Label>
                <Switch id="recordatorios" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pagos" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Métodos de Pago</CardTitle>
              <CardDescription>
                Configura los métodos de pago aceptados
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="efectivo">Pago en Efectivo</Label>
                <Switch id="efectivo" defaultChecked />
              </div>
              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="transferencia">Transferencia Bancaria</Label>
                <Switch id="transferencia" defaultChecked />
              </div>
              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="tarjeta">Tarjeta de Crédito/Débito</Label>
                <Switch id="tarjeta" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cuenta">Cuenta Bancaria</Label>
                <Input id="cuenta" placeholder="Número de cuenta para transferencias" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="usuarios" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Gestión de Usuarios</CardTitle>
              <CardDescription>
                Configura los permisos y accesos de usuarios
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="registro">Permitir Registro de Usuarios</Label>
                <Switch id="registro" />
              </div>
              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="aprobacion">Requerir Aprobación de Nuevos Usuarios</Label>
                <Switch id="aprobacion" defaultChecked />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rol-defecto">Rol por Defecto</Label>
                <Select defaultValue="cliente">
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un rol" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cliente">Cliente</SelectItem>
                    <SelectItem value="vendedor">Vendedor</SelectItem>
                    <SelectItem value="admin">Administrador</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end">
        <Button>
          <Save className="mr-2 h-4 w-4" />
          Guardar Cambios
        </Button>
      </div>
    </div>
  )
}
