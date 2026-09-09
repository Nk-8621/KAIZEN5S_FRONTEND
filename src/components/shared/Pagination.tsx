import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { PagedResult } from "@/types/common"

interface PaginationProps {
  result: Pick<PagedResult<unknown>, "page" | "totalPages" | "totalCount">
  onPageChange: (page: number) => void
}

export function Pagination({ result, onPageChange }: PaginationProps) {
  if (result.totalPages <= 1) {
    return null
  }

  const isFirstPage = result.page <= 1
  const isLastPage = result.page >= result.totalPages

  return (
    <div className="flex items-center justify-between border-t border-border px-4 py-3 text-sm text-muted-foreground">
      <span>
        Page {result.page} of {result.totalPages} — {result.totalCount} total
      </span>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" disabled={isFirstPage} onClick={() => onPageChange(result.page - 1)}>
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>
        <Button variant="outline" size="sm" disabled={isLastPage} onClick={() => onPageChange(result.page + 1)}>
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
