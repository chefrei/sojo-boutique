import Link from "next/link"
import { BarChart, DollarSign, Package, ShoppingBag, Users } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"

export default function AdminDashboardPage() {
  // Datos de ejemplo para el dashboard
  const stats = {
    ventas: {
      total: 12850.75,
      porcentaje: 12.5,
      periodo: "vs. mes anterior",
    },
    pedidos: {
      total: 42,
      porcentaje: 8.2,
      periodo: "vs. mes anterior",
    },
    clientes: {
      total: 18,
      porcentaje: 5.3,
      periodo: "vs. mes anterior",
    },
    productos: {
      total: 153,
      porcentaje: -2.5,
      periodo: "vs. mes anterior",
    },
  }

  // Datos de ejemplo para ventas recientes
  const recentSales = [
    {
      id: 1,
      cliente: "María González",
      fecha: "2023-05-01",
      monto: 250.0,
      estado: "Completado",
    },
    {
      id: 2,
      cliente: "Laura Martínez",
      fecha: "2023-05-02",
      monto: 120.5,
      estado: "Completado",
    },
    {
      id: 3,
      cliente: "Carolina Pérez",
      fecha: "2023-05-03",
      monto: 350.75,
      estado: "Pendiente",
    },
    {
      id: 4,
      cliente: "Sofía Rodríguez",
      fecha: "2023-05-04",
      monto: 180.25,
      estado: "Completado",
    },
    {
      id: 5,
      cliente: "Valentina López",
      fecha: "2023-05-05",
      monto: 95.0,
      estado: "Completado",
    },
  ]

  // Datos de ejemplo para productos populares
  const popularProducts = [
    {
      id: 1,
      nombre: "Vestido Floral Primavera",
      categoria: "Prendas",
      ventas: 24,
      stock: 15,
    },
    {
      id: 2,
      nombre: "Collar Perlas Elegance",
      categoria: "Accesorios",
      ventas: 18,
      stock: 8,
    },
    {
      id: 3,
      nombre: "Perfume Rosa Silvestre",
      categoria: "Perfumes",
      ventas: 15,
      stock: 12,
    },
    {
      id: 4,
      nombre: "Blusa Seda Premium",
      categoria: "Prendas",
      ventas: 12,
      stock: 5,
    },
    {
      id: 5,
      nombre: "Aretes Cristal Dorado",
      categoria: "Accesorios",
      ventas: 10,
      stock: 7,
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-heading">Dashboard</h2>
        <p className="text-muted-foreground">Resumen general de tu negocio</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ventas Totales</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.ventas.total.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <span className={stats.ventas.porcentaje > 0 ? "text-green-500" : "text-red-500"}>
                {stats.ventas.porcentaje > 0 ? "+" : ""}
                {stats.ventas.porcentaje}%
              </span>{" "}
              {stats.ventas.periodo}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pedidos</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pedidos.total}</div>
            <p className="text-xs text-muted-foreground">
              <span className={stats.pedidos.porcentaje > 0 ? "text-green-500" : "text-red-500"}>
                {stats.pedidos.porcentaje > 0 ? "+" : ""}
                {stats.pedidos.porcentaje}%
              </span>{" "}
              {stats.pedidos.periodo}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Nuevos Clientes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.clientes.total}</div>
            <p className="text-xs text-muted-foreground">
              <span className={stats.clientes.porcentaje > 0 ? "text-green-500" : "text-red-500"}>
                {stats.clientes.porcentaje > 0 ? "+" : ""}
                {stats.clientes.porcentaje}%
              </span>{" "}
              {stats.clientes.periodo}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Productos Activos</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.productos.total}</div>
            <p className="text-xs text-muted-foreground">
              <span className={stats.productos.porcentaje > 0 ? "text-green-500" : "text-red-500"}>
                {stats.productos.porcentaje > 0 ? "+" : ""}
                {stats.productos.porcentaje}%
              </span>{" "}
              {stats.productos.periodo}
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="analytics">Análisis</TabsTrigger>
          <TabsTrigger value="reports">Reportes</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="lg:col-span-4">
              <CardHeader>
                <CardTitle>Ventas Recientes</CardTitle>
                <CardDescription>Has recibido {recentSales.length} ventas este mes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentSales.map((sale) => (
                    <div key={sale.id} className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-none">{sale.cliente}</p>
                        <p className="text-sm text-muted-foreground">{formatDate(sale.fecha)}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm font-medium">${sale.monto.toFixed(2)}</p>
                          <p
                            className={`text-xs ${sale.estado === "Completado" ? "text-green-500" : "text-amber-500"}`}
                          >
                            {sale.estado}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex justify-center">
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/admin/ventas">Ver todas las ventas</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
            <Card className="lg:col-span-3">
              <CardHeader>
                <CardTitle>Productos Populares</CardTitle>
                <CardDescription>Los productos más vendidos este mes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {popularProducts.map((product) => (
                    <div key={product.id} className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-none">{product.nombre}</p>
                        <p className="text-sm text-muted-foreground">{product.categoria}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm font-medium">{product.ventas} vendidos</p>
                          <p className="text-xs text-muted-foreground">Stock: {product.stock}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex justify-center">
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/admin/productos">Ver todos los productos</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Análisis de Ventas</CardTitle>
              <CardDescription>Visualiza el rendimiento de tu negocio</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px] flex items-center justify-center">
              <p className="text-muted-foreground">Los gráficos de análisis estarán disponibles próximamente</p>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Reportes Disponibles</CardTitle>
              <CardDescription>Genera reportes detallados de tu negocio</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Button variant="outline" className="h-auto flex flex-col items-center p-4 space-y-2">
                  <BarChart className="h-6 w-6 mb-2" />
                  <span className="text-sm font-medium">Ventas por Período</span>
                  <span className="text-xs text-muted-foreground text-center">
                    Reporte detallado de ventas por rango de fechas
                  </span>
                </Button>
                <Button variant="outline" className="h-auto flex flex-col items-center p-4 space-y-2">
                  <Users className="h-6 w-6 mb-2" />
                  <span className="text-sm font-medium">Clientes</span>
                  <span className="text-xs text-muted-foreground text-center">Listado de clientes y sus compras</span>
                </Button>
                <Button variant="outline" className="h-auto flex flex-col items-center p-4 space-y-2">
                  <DollarSign className="h-6 w-6 mb-2" />
                  <span className="text-sm font-medium">Deudas Totales</span>
                  <span className="text-xs text-muted-foreground text-center">
                    Reporte de deudas pendientes y vencidas
                  </span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Función para formatear fechas
function formatDate(dateString: string) {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date)
}
