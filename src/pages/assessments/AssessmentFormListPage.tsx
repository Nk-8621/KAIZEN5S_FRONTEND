import { Link } from "react-router-dom"
import { Plus, Send } from "lucide-react"
import { PageHeader } from "@/components/shared/PageHeader"
import { ModuleTabs } from "@/components/shared/ModuleTabs"
import { LoadingState } from "@/components/shared/LoadingState"
import { ErrorState } from "@/components/shared/ErrorState"
import { EmptyState } from "@/components/shared/EmptyState"
import { Pagination } from "@/components/shared/Pagination"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { usePagedList } from "@/hooks/usePagedList"
import { assessmentApi } from "@/api/assessment"

export function AssessmentFormListPage() {
  const { result, isLoading, error, setPage } = usePagedList((paging) => assessmentApi.getForms(paging, null, null), [])

  return (
    <div>
      <PageHeader
        title="Safety Assessment"
        description="Configurable checklist forms for fixed-installation safety conditions."
        actions={
          <Button asChild>
            <Link to="/assessments/forms/new">
              <Plus className="h-4 w-4" />
              New form
            </Link>
          </Button>
        }
      />

      <ModuleTabs
        items={[
          { to: "/assessments", label: "Forms", end: true },
          { to: "/assessments/submissions", label: "Submissions" },
          { to: "/assessments/dashboard", label: "Dashboard" },
        ]}
      />

      {isLoading && <LoadingState label="Loading assessment forms…" />}
      {error && <ErrorState message={error} />}

      {result && result.items.length === 0 && (
        <EmptyState title="No assessment forms yet" description="Build the first assessment form to get started." />
      )}

      {result && result.items.length > 0 && (
        <div className="rounded-md border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Group</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Questions</TableHead>
                <TableHead className="text-right">Submissions</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {result.items.map((form) => (
                <TableRow key={form.assessmentFormId}>
                  <TableCell>{form.groupName}</TableCell>
                  <TableCell className="font-medium">{form.title}</TableCell>
                  <TableCell>
                    <Badge variant={form.isActive ? "success" : "muted"}>{form.isActive ? "Active" : "Inactive"}</Badge>
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{form.questionCount}</TableCell>
                  <TableCell className="text-right tabular-nums">{form.submissionCount}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm" asChild>
                      <Link to={`/assessments/forms/${form.assessmentFormId}/submit`}>
                        <Send className="h-4 w-4" />
                        Submit
                      </Link>
                    </Button>
                  </TableCell>
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
