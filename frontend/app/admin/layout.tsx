"use client"

import type { ReactNode } from "react"
import Link from "next/link"
import {
  BarChart3,
  Box,
  CreditCard,
  DollarSign,
  Home,
  Menu,
  Package,
  Settings,
  ShoppingBag,
  Users,
  X,
  LogOut,
} from "lucide-react"

import { Logo } from "@/components/ui/logo"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import { usePathname, useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useSettings } from "@/contexts/settings-context"

interface AdminLayoutProps {
  children: ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { user, logout } = useAuth()
  const { settings } = useSettings()
  const router = useRouter()
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Versión simplificada para desarrollo - sin redirecciones automáticas
  // Esto evita los ciclos de redirección

  const routes = [
    {
      label: "Dashboard",
      icon: Home,
      href: "/admin",
    },
    {
      label: "Productos",
      icon: Package,
      href: "/admin/productos",
    },
    {
      label: "Pedidos",
      icon: ShoppingBag,
      href: "/admin/pedidos",
    },
    {
      label: "Clientes",
      icon: Users,
      href: "/admin/clientes",
    },
    {
      label: "Ventas",
      icon: DollarSign,
      href: "/admin/ventas",
    },
    {
      label: "Deudas",
      icon: CreditCard,
      href: "/admin/deudas",
    },
    {
      label: "Reportes",
      icon: BarChart3,
      href: "/admin/reportes",
    },
    {
      label: "Configuración",
      icon: Settings,
      href: "/admin/configuracion",
    },
  ]

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  // Cerrar el menú móvil cuando cambia la ruta
  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [pathname])

  return (
    <div className="flex min-h-screen flex-col">
      <MobileAdminNav
        routes={routes}
        onLogout={handleLogout}
        user={user}
        settings={settings}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
        pathname={pathname}
      />
      <div className="flex flex-1">
        <DesktopSidebar routes={routes} onLogout={handleLogout} settings={settings} pathname={pathname} />
        <div className="flex flex-col flex-1">
          <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 md:px-6 shadow-sm">
            <div className="flex-1 flex items-center gap-4">
              <h1 className="text-lg font-semibold md:text-xl">Panel de Administración</h1>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/placeholder-user.jpg" alt={user?.full_name || "Admin"} />
                    <AvatarFallback>{user?.full_name?.substring(0, 2).toUpperCase() || "AD"}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
                <DropdownMenuLabel className="font-normal text-xs text-muted-foreground truncate">
                  {user?.email || "admin@ejemplo.com"}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/">Ver Tienda</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/admin/configuracion">Configuración</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Cerrar Sesión</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </header>
          <main className="flex-1 p-4 md:p-6 overflow-auto">{children}</main>
        </div>
      </div>
    </div>
  )
}

function MobileAdminNav({
  routes,
  onLogout,
  user,
  settings,
  isMobileMenuOpen,
  setIsMobileMenuOpen,
  pathname,
}: {
  routes: any[]
  onLogout: () => void
  user: any
  settings: any
  isMobileMenuOpen: boolean
  setIsMobileMenuOpen: (open: boolean) => void
  pathname: string
}) {
  return (
    <div className="md:hidden sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center px-4">
        <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="mr-2">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Abrir menú</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[80%] max-w-[300px] p-0">
            <div className="flex h-14 items-center border-b px-4">
              <Logo size="sm" />
              <span className="ml-2 text-lg font-heading truncate">{settings?.business_name || "Admin"}</span>
              <Button variant="ghost" size="icon" className="ml-auto" onClick={() => setIsMobileMenuOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            <nav className="grid gap-1 p-2 overflow-y-auto max-h-[calc(100vh-3.5rem)]">
              {routes.map((route) => (
                <Link
                  key={route.href}
                  href={route.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                    route.href === pathname ? "bg-primary text-primary-foreground" : "hover:bg-muted",
                  )}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <route.icon className="h-4 w-4" />
                  {route.label}
                </Link>
              ))}
              <div className="mt-4 pt-4 border-t">
                <Button variant="ghost" className="w-full justify-start text-destructive" onClick={onLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Cerrar Sesión
                </Button>
              </div>
            </nav>
          </SheetContent>
        </Sheet>
        <Logo size="sm" />
        <span className="ml-2 text-lg font-heading truncate">{settings?.business_name || "Admin"}</span>
        <div className="ml-auto flex items-center gap-2">
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
            Ver Tienda
          </Link>
          <Avatar className="h-8 w-8">
            <AvatarImage src="/placeholder-user.jpg" alt={user?.full_name || "Admin"} />
            <AvatarFallback>{user?.full_name?.substring(0, 2).toUpperCase() || "AD"}</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </div>
  )
}

function DesktopSidebar({ routes, onLogout, settings, pathname }: { routes: any[]; onLogout: () => void; settings: any; pathname: string }) {
  return (
    <aside className="hidden md:block border-r bg-muted/40 w-64 flex-shrink-0 overflow-y-auto">
      <div className="flex h-16 items-center border-b px-4">
        <Logo size="sm" />
        <span className="ml-2 text-lg font-heading truncate">{settings?.business_name || "Admin"}</span>
      </div>
      <nav className="grid gap-1 p-2">
        {routes.map((route) => (
          <Link
            key={route.href}
            href={route.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
              pathname === route.href ? "bg-primary text-primary-foreground" : "hover:bg-muted",
            )}
          >
            <route.icon className="h-4 w-4" />
            {route.label}
          </Link>
        ))}
        <div className="mt-4 pt-4 border-t">
          <Button variant="ghost" className="w-full justify-start text-destructive" onClick={onLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Cerrar Sesión
          </Button>
        </div>
      </nav>
    </aside>
  )
}
