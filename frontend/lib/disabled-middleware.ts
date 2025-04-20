import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Middleware desactivado para desarrollo
export function middleware(request: NextRequest) {
  // Simplemente permite todas las solicitudes sin verificación
  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*", "/pedidos/:path*", "/cuenta/:path*"],
}
