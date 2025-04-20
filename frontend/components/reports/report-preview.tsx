"use client"

import type React from "react"
import { useRef } from "react"
import { Button } from "@/components/ui/button"
import { Printer } from "lucide-react"

interface ReportPreviewProps {
  children: React.ReactNode
}

export function ReportPreview({ children }: ReportPreviewProps) {
  const componentRef = useRef<HTMLDivElement>(null)

  const handlePrint = () => {
    // Usar la API nativa de impresión del navegador
    window.print()
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end print:hidden">
        <Button variant="outline" size="sm" onClick={handlePrint}>
          <Printer className="mr-2 h-4 w-4" />
          Imprimir esta vista
        </Button>
      </div>
      <div
        ref={componentRef}
        className="p-6 bg-white rounded-lg border min-h-[500px] print:min-h-0 print:border-none print:p-0"
      >
        {children}
      </div>
    </div>
  )
}
