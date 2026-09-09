import { useState } from "react"
import { Link } from "react-router-dom"
import { PageHeader } from "@/components/shared/PageHeader"
import { ModuleTabs } from "@/components/shared/ModuleTabs"
import { LoadingState } from "@/components/shared/LoadingState"
import { ErrorState } from "@/components/shared/ErrorState"
import { EmptyState } from "@/components/shared/EmptyState"
import { Pagination } from "@/components/shared/Pagination"
import { StatusPill } from "@/components/shared/StatusPill"
import { Select } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { usePagedList } from "@/hooks/usePagedList"
import { useAsyncData } from "@/hooks/useAsyncData"
import { fiveSApi } from "@/api/fiveS"
import { masterDataApi } from "@/api/masterData"
import { formatDate } from "@/lib/utils"
import { AUDIT_INSTANCE_STATUSES } from "@/types/fiveS"

export function AuditInstanceListPage() {
  const [lineId, setLineId] = useState<number | "">("")
  const [status, setStatus] = useState("")
  const { data: lines } = useAsyncData(() => masterDataApi.getLines(), [])

  const { result, isLoading, error, setPage } = usePagedList(
    (paging) => fiveSApi.getAuditInstances(paging, null, lineId || null, null, null, null, null),
    [lineId],
  )

  const filteredItems = status ? result?.items.filter((item) => item.status === status) : result?.items

  return (
    <div>
      <PageHeader title="5S Audit" description="Every audit run, in progress, submitted, or reviewed." />

      <ModuleTabs
        items={[
          { to: "/five-s", label: "Questionnaires", end: true },
          { to: "/five-s/audits", label: "Audits" },
          { to: "/five-s/dashboard", label: "Dashboard" },
        ]}
      />

      <div className="mb-4 flex flex-wrap gap-3">
        <div className="w-48">
          <Select value={lineId} onChange={(event) => setLineId(event.target.value ? Number(event.target.value) : "")}>
            <option value="">All lines</option>
            {lines?.map((line) => (
              <option key={line.id} value={line.id}>
                {line.name}
              </option>
            ))}
          </Select>
        </div>
        <div className="w-48">
          <Select value={status} onChange={(event) => setStatus(event.target.value)}>
            <option value="">All statuses</option>
            {AUDIT_INSTANCE_STATUSES.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {isLoading && <LoadingState label="Loading audits…" />}
      {error && <ErrorState message={error} />}

      {filteredItems && filteredItems.length === 0 && (
        <EmptyState title="No audits found" description="Start an audit from the Questionnaires tab to see it here." />
      )}

      {filteredItems && filteredItems.length > 0 && (
        <div className="rounded-md border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Questionnaire</TableHead>
                <TableHead>Line</TableHead>
                <TableHead>Area</TableHead>
                <TableHead>Answered by</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead className="text-right">Avg rating</TableHead>
                <TableHead className="text-right">Flagged</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredItems.map((instance) => (
                <TableRow key={instance.auditInstanceId}>
                  <TableCell className="font-medium">
                    <Link to={`/five-s/audits/${instance.auditInstanceId}`} className="hover:underline">
                      {instance.questionnaireName}
                    </Link>
                  </TableCell>
                  <TableCell>{instance.lineName ?? "—"}</TableCell>
                  <TableCell>{instance.areaName ?? "—"}</TableCell>
                  <TableCell>{instance.answeredByName}</TableCell>
                  <TableCell>
                    <StatusPill status={instance.status} />
                  </TableCell>
                  <TableCell>{formatDate(instance.submittedDate)}</TableCell>
                  <TableCell className="text-right tabular-nums">
                    {instance.averageRating !== null ? instance.averageRating.toFixed(1) : "—"}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{instance.flaggedAnswerCount}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {!status && result && <Pagination result={result} onPageChange={setPage} />}
        </div>
      )}
    </div>
  )
}
