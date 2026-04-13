import Image from "next/image"
import Link from "next/link"
import { useSettings } from "@/contexts/settings-context"

export function Logo({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const { settings } = useSettings()
  
  const sizes = {
    sm: 80,
    md: 120,
    lg: 180,
  }

  const logoSrc = settings?.logo_url || "/images/logo.png"
  const businessName = settings?.business_name || "Sojo Boutique"

  return (
    <Link href="/" className="inline-block">
      <Image
        src={logoSrc}
        alt={businessName}
        width={sizes[size]}
        height={sizes[size]}
        className="object-contain max-h-full"
      />
    </Link>
  )
}
