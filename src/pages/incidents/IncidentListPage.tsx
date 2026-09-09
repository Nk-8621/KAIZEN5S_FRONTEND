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
import { incidentsApi } from "@/api/safety"
import { formatDate, humanizeStatus } from "@/lib/utils"
import { SEVERITY_LEVELS } from "@/types/safety"

export function IncidentListPage() {
  const [status, setStatus] = useState("")
  const [severity, setSeverity] = useState("")

  const { result, isLoading, error, setPage } = usePagedList(
    (paging) => incidentsApi.getList(paging, status || null, severity || null, null, null, null),
    [status, severity],
  )

  return (
    <div>
      <PageHeader
        title="Safety Incidents"
        description="Reported incidents, from initial report through review and closure."
        actions={
          <Button asChild>
            <Link to="/incidents/new">
              <Plus className="h-4 w-4" />
              Report incident
            </Link>
          </Button>
        }
      />

      <ModuleTabs items={[{ to: "/incidents", label: "Incidents", end: true }, { to: "/incidents/dashboard", label: "Dashboard" }]} />

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

      {isLoading && <LoadingState label="Loading incidents…" />}
      {error && <ErrorState message={error} />}

      {result && result.items.length === 0 && (
        <EmptyState title="No incidents yet" description="Report the first safety incident to get started." />
      )}

      {result && result.items.length > 0 && (
        <div className="rounded-md border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Area</TableHead>
                <TableHead>Reported by</TableHead>
                <TableHead>Responsible</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {result.items.map((incident) => (
                <TableRow key={incident.incidentId}>
                  <TableCell className="font-medium">
                    <Link to={`/incidents/${incident.incidentId}`} className="hover:underline">
                      {humanizeStatus(incident.incidentType)}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <StatusPill status={incident.severity} />
                  </TableCell>
                  <TableCell>
                    <StatusPill status={incident.status} />
                  </TableCell>
                  <TableCell>{incident.areaName ?? "—"}</TableCell>
                  <TableCell>{incident.reportedByName}</TableCell>
                  <TableCell>{incident.responsibleName ?? "—"}</TableCell>
                  <TableCell>{formatDate(incident.createdDate)}</TableCell>
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
