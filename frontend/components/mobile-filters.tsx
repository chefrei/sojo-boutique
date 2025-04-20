"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { SlidersHorizontal } from "lucide-react"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"

interface MobileFiltersProps {
  title: string
  description: string
  children: React.ReactNode
}

export function MobileFilters({ title, description, children }: MobileFiltersProps) {
  const [open, setOpen] = useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="md:hidden">
          <SlidersHorizontal className="h-5 w-5" />
          <span className="sr-only">Filtros</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[85%] sm:w-[350px]">
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
          <SheetDescription>{description}</SheetDescription>
        </SheetHeader>
        <div className="py-6 space-y-6">
          {children}
          <div className="flex gap-2 pt-4">
            <Button className="flex-1" onClick={() => setOpen(false)}>
              Aplicar Filtros
            </Button>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cerrar
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
