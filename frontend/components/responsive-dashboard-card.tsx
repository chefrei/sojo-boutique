import type { ReactNode } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface ResponsiveDashboardCardProps {
  title: string
  icon?: ReactNode
  value: string | number
  trend?: {
    value: number
    label: string
  }
  className?: string
}

export function ResponsiveDashboardCard({ title, icon, value, trend, className }: ResponsiveDashboardCardProps) {
  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon && <div className="text-muted-foreground">{icon}</div>}
      </CardHeader>
      <CardContent>
        <div className="text-xl sm:text-2xl font-bold">{value}</div>
        {trend && (
          <p className="text-xs text-muted-foreground">
            <span className={trend.value > 0 ? "text-green-500" : "text-red-500"}>
              {trend.value > 0 ? "+" : ""}
              {trend.value}%
            </span>{" "}
            {trend.label}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
