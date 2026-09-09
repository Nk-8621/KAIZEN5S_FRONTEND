import { useState } from "react"
import { Link } from "react-router-dom"
import { Plus } from "lucide-react"
import { PageHeader } from "@/components/shared/PageHeader"
import { ModuleTabs } from "@/components/shared/ModuleTabs"
import { LoadingState } from "@/components/shared/LoadingState"
import { ErrorState } from "@/components/shared/ErrorState"
import { EmptyState } from "@/components/shared/EmptyState"
import { Pagination } from "@/components/shared/Pagination"
import { StatusPill } from "@/components/shared/StatusPill"
import { Button } from "@/components/ui/button"
import { Select } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { usePagedList } from "@/hooks/usePagedList"
import { observationsApi } from "@/api/safety"
import { formatDate, humanizeStatus } from "@/lib/utils"
import { SEVERITY_LEVELS } from "@/types/safety"

/** One consolidated Observation list — ANALYSIS.md §1.4 folds the wireframe's separate
 * "Safety Violation Observation" and "Safety Observation List" screens into this single screen. */
export function ObservationListPage() {
  const [status, setStatus] = useState("")
  const [severity, setSeverity] = useState("")

  const { result, isLoading, error, setPage } = usePagedList(
    (paging) => observationsApi.getList(paging, status || null, severity || null, null, null, null),
    [status, severity],
  )

  return (
    <div>
      <PageHeader
        title="Safety Observations"
        description="Logged PPE, procedure, and environment observations."
        actions={
          <Button asChild>
            <Link to="/observations/new">
              <Plus className="h-4 w-4" />
              Log observation
            </Link>
          </Button>
        }
      />

      <ModuleTabs items={[{ to: "/observations", label: "Observations", end: true }, { to: "/observations/dashboard", label: "Dashboard" }]} />

      <div className="mb-4 flex flex-wrap gap-3">
        <div className="w-48">
          <Select value={status} onChange={(event) => setStatus(event.target.value)}>
            <option value="">All statuses</option>
            {["Open", "InReview", "Closed", "Rejected", "Reopened"].map((value) => (
              <option key={value} value={value}>
                {humanizeStatus(value)}
              </option>
            ))}
          </Select>
        </div>
        <div className="w-48">
          <Select value={severity} onChange={(event) => setSeverity(event.target.value)}>
            <option value="">All severities</option>
            {SEVERITY_LEVELS.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {isLoading && <LoadingState label="Loading observations…" />}
      {error && <ErrorState message={error} />}

      {result && result.items.length === 0 && (
        <EmptyState title="No observations yet" description="Log the first safety observation to get started." />
      )}

      {result && result.items.length > 0 && (
        <div className="rounded-md border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Observation</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Area</TableHead>
                <TableHead>Reported by</TableHead>
                <TableHead>Responsible</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {result.items.map((observation) => (
                <TableRow key={observation.observationId}>
                  <TableCell className="font-medium">
                    <Link to={`/observations/${observation.observationId}`} className="hover:underline">
                      OBS-{observation.observationId}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <StatusPill status={observation.severity} />
                  </TableCell>
                  <TableCell>
                    <StatusPill status={observation.status} />
                  </TableCell>
                  <TableCell>{observation.areaName ?? "—"}</TableCell>
                  <TableCell>{observation.reportedByName}</TableCell>
                  <TableCell>{observation.responsibleName ?? "—"}</TableCell>
                  <TableCell>{formatDate(observation.createdDate)}</TableCell>
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
