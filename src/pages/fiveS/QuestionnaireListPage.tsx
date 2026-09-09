import { useState } from "react"
import { Link } from "react-router-dom"
import { Plus, PlayCircle } from "lucide-react"
import { PageHeader } from "@/components/shared/PageHeader"
import { ModuleTabs } from "@/components/shared/ModuleTabs"
import { LoadingState } from "@/components/shared/LoadingState"
import { ErrorState } from "@/components/shared/ErrorState"
import { EmptyState } from "@/components/shared/EmptyState"
import { Pagination } from "@/components/shared/Pagination"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { usePagedList } from "@/hooks/usePagedList"
import { useAsyncData } from "@/hooks/useAsyncData"
import { fiveSApi } from "@/api/fiveS"
import { masterDataApi } from "@/api/masterData"
import { StartAuditDialog } from "@/pages/fiveS/components/StartAuditDialog"
import type { QuestionnaireListItemDto } from "@/types/fiveS"

export function QuestionnaireListPage() {
  const [lineId, setLineId] = useState<number | "">("")
  const { data: lines } = useAsyncData(() => masterDataApi.getLines(), [])

  const { result, isLoading, error, setPage } = usePagedList(
    (paging) => fiveSApi.getQuestionnaires(paging, lineId || null, null),
    [lineId],
  )

  const [startAuditFor, setStartAuditFor] = useState<QuestionnaireListItemDto | null>(null)

  return (
    <div>
      <PageHeader
        title="5S Audit"
        description="Build questionnaires per Line/Area and review field audit results."
        actions={
          <Button asChild>
            <Link to="/five-s/questionnaires/new">
              <Plus className="h-4 w-4" />
              New questionnaire
            </Link>
          </Button>
        }
      />

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
      </div>

      {isLoading && <LoadingState label="Loading questionnaires…" />}
      {error && <ErrorState message={error} />}

      {result && result.items.length === 0 && (
        <EmptyState title="No questionnaires yet" description="Create the first 5S questionnaire to get started." />
      )}

      {result && result.items.length > 0 && (
        <div className="rounded-md border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Line</TableHead>
                <TableHead>Area</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Frequency</TableHead>
                <TableHead className="text-right">Questions</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {result.items.map((questionnaire) => (
                <TableRow key={questionnaire.questionnaireId}>
                  <TableCell className="font-medium">
                    <Link to={`/five-s/questionnaires/${questionnaire.questionnaireId}`} className="hover:underline">
                      {questionnaire.name}
                    </Link>
                  </TableCell>
                  <TableCell>{questionnaire.lineName ?? "—"}</TableCell>
                  <TableCell>{questionnaire.areaName ?? "—"}</TableCell>
                  <TableCell>
                    <Badge variant={questionnaire.isActive ? "success" : "muted"}>
                      {questionnaire.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {questionnaire.isFrequencyActive && questionnaire.frequencyDays
                      ? `Every ${questionnaire.frequencyDays} day(s)`
                      : "—"}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{questionnaire.questionCount}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm" onClick={() => setStartAuditFor(questionnaire)}>
                      <PlayCircle className="h-4 w-4" />
                      Start audit
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Pagination result={result} onPageChange={setPage} />
        </div>
      )}

      {startAuditFor && (
        <StartAuditDialog
          questionnaire={startAuditFor}
          open={startAuditFor !== null}
          onOpenChange={(open) => !open && setStartAuditFor(null)}
        />
      )}
    </div>
  )
}
