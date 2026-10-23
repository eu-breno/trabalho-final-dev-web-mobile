"use client"

import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight } from "lucide-react"

export function TablePagination({
  page,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
}: {
  page: number
  pageSize: number
  totalItems: number
  onPageChange: (nextPage: number) => void
  onPageSizeChange: (nextPageSize: number) => void
}) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))
  const currentPage = Math.min(page, totalPages)

  return (
    <div className="flex flex-col gap-3 border-t border-border bg-card/50 px-3 py-3 sm:flex-row sm:items-center sm:justify-end sm:px-4">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span>Linhas por página</span>
        <Select value={String(pageSize)} onValueChange={(value) => onPageSizeChange(Number(value))}>
          <SelectTrigger aria-label="Linhas por página" size="sm" className="w-20">
            <SelectValue placeholder="10" />
          </SelectTrigger>
          <SelectContent>
            {[10, 20, 50].map((option) => (
              <SelectItem key={option} value={String(option)}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-1">
        <Button
          aria-label="Primeira página"
          disabled={currentPage <= 1 || totalItems === 0}
          onClick={() => onPageChange(1)}
          size="icon-sm"
          type="button"
          variant="outline"
        >
          <ChevronsLeft className="size-4" />
        </Button>
        <Button
          aria-label="Página anterior"
          disabled={currentPage <= 1 || totalItems === 0}
          onClick={() => onPageChange(currentPage - 1)}
          size="icon-sm"
          type="button"
          variant="outline"
        >
          <ChevronLeft className="size-4" />
        </Button>
        <span className="min-w-20 text-center text-sm text-muted-foreground">
          Página {totalItems === 0 ? 0 : currentPage} de {totalPages}
        </span>
        <Button
          aria-label="Próxima página"
          disabled={currentPage >= totalPages || totalItems === 0}
          onClick={() => onPageChange(currentPage + 1)}
          size="icon-sm"
          type="button"
          variant="outline"
        >
          <ChevronRight className="size-4" />
        </Button>
        <Button
          aria-label="Última página"
          disabled={currentPage >= totalPages || totalItems === 0}
          onClick={() => onPageChange(totalPages)}
          size="icon-sm"
          type="button"
          variant="outline"
        >
          <ChevronsRight className="size-4" />
        </Button>
      </div>
    </div>
  )
}
