"use client"

import Link from "next/link"
import { BarChart, DollarSign, Package, ShoppingBag, Users, Loader2 } from "lucide-react"
import { useEffect, useState } from "react"
import { apiFetch } from "@/lib/api"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { 
  ResponsiveContainer, 
  BarChart as ReBarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  PieChart, 
  Pie, 
  Cell 
} from "recharts"

const COLORS = ["#0f172a", "#334155", "#475569", "#64748b", "#94a3b8"]

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<any>(null)
  const [recentSales, setRecentSales] = useState<any[]>([])
  const [popularProducts, setPopularProducts] = useState<any[]>([])
  const [financeStats, setFinanceStats] = useState<any[]>([])
  const [categoryStats, setCategoryStats] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchDashboardData() {
      // Usar Promise.allSettled para que si un endpoint de reportes falla, el resto cargue
      const results = await Promise.allSettled([
        apiFetch<any>("/admin/dashboard"),
        apiFetch<any[]>("/admin/orders?limit=5"),
        apiFetch<any[]>("/products/"),
        apiFetch<any[]>("/reports/finance/stats"),
        apiFetch<any[]>("/reports/categories/stats")
      ])
      
      const [dashRes, ordersRes, productsRes, finRes, catRes] = results

      if (dashRes.status === "fulfilled") {
        const dStats = dashRes.value
        if (productsRes.status === "fulfilled") {
          dStats.productos_activos = productsRes.value.length
        }
        setStats(dStats)
      }

      if (ordersRes.status === "fulfilled") setRecentSales(ordersRes.value)
      if (productsRes.status === "fulfilled") setPopularProducts(productsRes.value.slice(0, 5))
      if (finRes.status === "fulfilled") setFinanceStats(finRes.value)
      if (catRes.status === "fulfilled") setCategoryStats(catRes.value)

      setIsLoading(false)
    }
    fetchDashboardData()
  }, [])

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Cargando métricas...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-heading">Dashboard</h2>
        <p className="text-muted-foreground">Resumen general de tu negocio</p>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ventas Totales</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${Number(stats?.total_sales || 0).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground pt-1">
              Pendiente de cobro: <span className="text-amber-500">${Number(stats?.total_receivable || 0).toLocaleString()}</span>
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pedidos Registrados</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.order_count || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Nuevos Clientes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.customer_count || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Productos Activos</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.productos_activos || 0}</div>
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
          <div className="grid gap-4 grid-cols-1 lg:grid-cols-7">
            <Card className="lg:col-span-4">
              <CardHeader>
                <CardTitle>Ventas Recientes</CardTitle>
                <CardDescription>Has recibido {recentSales.length} ventas este mes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentSales.map((sale) => (
                    <div key={sale.db_id || sale.id} className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-none">Pedido {sale.id}</p>
                        <p className="text-sm text-muted-foreground">{sale.fecha ? formatDate(sale.fecha) : "Fecha no disponible"}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm font-medium">${Number(sale.total || sale.total_price || 0).toFixed(2)}</p>
                          <p
                            className={`text-xs ${sale.estado === "Completado" || sale.payment_status === "paid" ? "text-green-500" : "text-amber-500"}`}
                          >
                            {(sale.estado || sale.payment_status || "PENDIENTE").toUpperCase()}
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
                        <p className="text-sm font-medium leading-none">{product.name}</p>
                        <p className="text-sm text-muted-foreground">{product.category_id}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm font-medium">${Number(product.price).toFixed(2)}</p>
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
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Rendimiento Mensual</CardTitle>
                <CardDescription>Ventas vs Recaudación (últimos 6 meses)</CardDescription>
              </CardHeader>
              <CardContent className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <ReBarChart data={financeStats} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip 
                      contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                      formatter={(value) => [`$${Number(value).toLocaleString()}`, ""]}
                    />
                    <Legend />
                    <Bar dataKey="ventas" name="Ventas" fill="#0f172a" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="recaudado" name="Recaudado" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                  </ReBarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Ventas por Categoría</CardTitle>
                <CardDescription>Distribución del volumen de ventas</CardDescription>
              </CardHeader>
              <CardContent className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryStats}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {categoryStats.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `$${Number(value).toLocaleString()}`} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
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
function formatDate(dateString: string | null | undefined) {
  if (!dateString) return "—"
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return dateString // En caso de que ya venga como formateda ej: 2024-04-10
  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date)
}
