import type { ReactNode } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface Column {
  header: string
  accessorKey: string
  cell?: (value: any) => ReactNode
  className?: string
  hideOnMobile?: boolean
}

interface ResponsiveTableProps {
  columns: Column[]
  data: any[]
  emptyMessage?: string
}

export function ResponsiveTable({ columns, data, emptyMessage = "No hay datos disponibles" }: ResponsiveTableProps) {
  return (
    <div className="w-full overflow-auto">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column, index) => (
              <TableHead
                key={index}
                className={`${column.className || ""} ${column.hideOnMobile ? "hidden sm:table-cell" : ""}`}
              >
                {column.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length} className="text-center py-8 text-muted-foreground">
                {emptyMessage}
              </TableCell>
            </TableRow>
          ) : (
            data.map((row, rowIndex) => (
              <TableRow key={rowIndex}>
                {columns.map((column, colIndex) => (
                  <TableCell
                    key={colIndex}
                    className={`${column.className || ""} ${column.hideOnMobile ? "hidden sm:table-cell" : ""}`}
                  >
                    {column.cell ? column.cell(row[column.accessorKey]) : row[column.accessorKey]}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
