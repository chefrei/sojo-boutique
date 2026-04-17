import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getCleanImageUrl(url: string | null | undefined): string {
  if (!url) return "/placeholder.svg"
  
  // Si la URL apunta a localhost, intentar usar la ruta relativa
  if (url.includes("127.0.0.1:8000") || url.includes("localhost:8000")) {
    const parts = url.split("/images/")
    if (parts.length > 1) {
      return "/images/" + parts[1]
    }
    return "/placeholder.svg"
  }
  
  return url
}
