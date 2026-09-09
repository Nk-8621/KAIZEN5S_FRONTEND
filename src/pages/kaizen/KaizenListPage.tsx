import { useState } from "react"
import { Link } from "react-router-dom"
import { Plus } from "lucide-react"
import { PageHeader } from "@/components/shared/PageHeader"
import { LoadingState } from "@/components/shared/LoadingState"
import { ErrorState } from "@/components/shared/ErrorState"
import { EmptyState } from "@/components/shared/EmptyState"
import { Pagination } from "@/components/shared/Pagination"
import { StatusPill } from "@/components/shared/StatusPill"
import { Button } from "@/components/ui/button"
import { Select } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { usePagedList } from "@/hooks/usePagedList"
import { kaizenApi } from "@/api/kaizen"
import { KAIZEN_STATUSES, type KaizenListFilter } from "@/types/kaizen"
import { formatCurrency, formatDate, humanizeStatus } from "@/lib/utils"

export function KaizenListPage() {
  const [filter, setFilter] = useState<KaizenListFilter>({})

  const { result, isLoading, error, setPage } = usePagedList(
    (paging) => kaizenApi.getList(paging, filter),
    [filter.status, filter.pillarId, filter.lineId],
  )

  return (
    <div>
      <PageHeader
        title="Quick Kaizens"
        description="Continuous-improvement suggestions, from submission through approval and cost/savings tracking."
        actions={
          <Button asChild>
            <Link to="/kaizen/new">
              <Plus className="h-4 w-4" />
              New Kaizen
            </Link>
          </Button>
        }
      />

      <div className="mb-4 flex flex-wrap gap-3">
        <div className="w-48">
          <Select
            value={filter.status ?? ""}
            onChange={(event) => setFilter((previous) => ({ ...previous, status: event.target.value || null }))}
          >
            <option value="">All statuses</option>
            {KAIZEN_STATUSES.map((status) => (
              <option key={status} value={status}>
                {humanizeStatus(status)}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {isLoading && <LoadingState label="Loading Kaizens…" />}
      {error && <ErrorState message={error} />}

      {result && result.items.length === 0 && (
        <EmptyState title="No Kaizens yet" description="Create the first Kaizen suggestion to get started." />
      )}

      {result && result.items.length > 0 && (
        <div className="rounded-md border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Pillar</TableHead>
                <TableHead>Line</TableHead>
                <TableHead>Created by</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Hard saving</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {result.items.map((kaizen) => (
                <TableRow key={kaizen.kaizenId} className="cursor-pointer">
                  <TableCell className="font-medium">
                    <Link to={`/kaizen/${kaizen.kaizenId}`} className="hover:underline">
                      {kaizen.title}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <StatusPill status={kaizen.status} />
                  </TableCell>
                  <TableCell>{kaizen.pillarName ?? "—"}</TableCell>
                  <TableCell>{kaizen.lineName ?? "—"}</TableCell>
                  <TableCell>{kaizen.createdByName}</TableCell>
                  <TableCell>{formatDate(kaizen.createdDate)}</TableCell>
                  <TableCell className="text-right tabular-nums">{formatCurrency(kaizen.totalHardSaving)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Pagination result={result} onPageChange={setPage} />
        </div>
      )}
    </div>
  )
}
