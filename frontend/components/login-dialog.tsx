import * as React from "react"
import { useRouter, usePathname } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ShoppingBag } from "lucide-react"

interface LoginDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  message?: string
}

export function LoginDialog({ open, onOpenChange, message = "Inicia sesión para usar el carrito." }: LoginDialogProps) {
  const router = useRouter()
  const pathname = usePathname()

  const handleLoginClick = () => {
    onOpenChange(false)
    router.push(`/login?redirect=${encodeURIComponent(pathname)}`)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md text-center border-none shadow-2xl bg-gradient-to-b from-white to-pink-50/30 rounded-2xl">
        <DialogHeader>
          <div className="mx-auto bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-4">
            <ShoppingBag className="h-6 w-6 text-primary" />
          </div>
          <DialogTitle className="text-2xl font-serif text-slate-800">Soho Boutique</DialogTitle>
          <DialogDescription className="text-base text-slate-600 mt-2">
            {message}
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3 mt-6">
          <Button onClick={handleLoginClick} className="w-full rounded-full shadow-md font-medium text-md py-6">
            Iniciar Sesión
          </Button>
          <div className="text-sm text-muted-foreground mt-2">
            ¿No tienes cuenta? <button onClick={handleLoginClick} className="text-primary hover:underline font-medium">Regístrate</button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
