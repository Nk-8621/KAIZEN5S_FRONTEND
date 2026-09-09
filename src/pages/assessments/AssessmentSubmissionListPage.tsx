import { Link } from "react-router-dom"
import { PageHeader } from "@/components/shared/PageHeader"
import { ModuleTabs } from "@/components/shared/ModuleTabs"
import { LoadingState } from "@/components/shared/LoadingState"
import { ErrorState } from "@/components/shared/ErrorState"
import { EmptyState } from "@/components/shared/EmptyState"
import { Pagination } from "@/components/shared/Pagination"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { usePagedList } from "@/hooks/usePagedList"
import { assessmentApi } from "@/api/assessment"
import { formatDateTime } from "@/lib/utils"

export function AssessmentSubmissionListPage() {
  const { result, isLoading, error, setPage } = usePagedList((paging) => assessmentApi.getSubmissions(paging, null, null, null, null), [])

  return (
    <div>
      <PageHeader title="Safety Assessment" description="Every completed assessment submission." />

      <ModuleTabs
        items={[
          { to: "/assessments", label: "Forms", end: true },
          { to: "/assessments/submissions", label: "Submissions" },
          { to: "/assessments/dashboard", label: "Dashboard" },
        ]}
      />

      {isLoading && <LoadingState label="Loading submissions…" />}
      {error && <ErrorState message={error} />}

      {result && result.items.length === 0 && (
        <EmptyState title="No submissions yet" description="Submit an assessment from the Forms tab to see it here." />
      )}

      {result && result.items.length > 0 && (
        <div className="rounded-md border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Form</TableHead>
                <TableHead>Area</TableHead>
                <TableHead>Submitted by</TableHead>
                <TableHead>Submitted</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {result.items.map((submission) => (
                <TableRow key={submission.assessmentSubmissionId}>
                  <TableCell className="font-medium">
                    <Link to={`/assessments/submissions/${submission.assessmentSubmissionId}`} className="hover:underline">
                      {submission.formTitle}
                    </Link>
                  </TableCell>
                  <TableCell>{submission.areaName ?? "—"}</TableCell>
                  <TableCell>{submission.submittedByName}</TableCell>
                  <TableCell>{formatDateTime(submission.submittedDate)}</TableCell>
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
