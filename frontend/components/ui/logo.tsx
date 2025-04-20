import Image from "next/image"
import Link from "next/link"

export function Logo({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizes = {
    sm: 80,
    md: 120,
    lg: 180,
  }

  return (
    <Link href="/" className="inline-block">
      <Image
        src="/images/logo.png"
        alt="Sojo Boutique"
        width={sizes[size]}
        height={sizes[size]}
        className="object-contain"
      />
    </Link>
  )
}
