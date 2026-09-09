import { useParams } from "react-router-dom"
import { PageHeader } from "@/components/shared/PageHeader"
import { LoadingState } from "@/components/shared/LoadingState"
import { ErrorState } from "@/components/shared/ErrorState"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useAsyncData } from "@/hooks/useAsyncData"
import { assessmentApi } from "@/api/assessment"
import { formatDateTime } from "@/lib/utils"

export function AssessmentSubmissionDetailPage() {
  const { id } = useParams<{ id: string }>()
  const submissionId = Number(id)

  const { data: submission, isLoading, error } = useAsyncData(() => assessmentApi.getSubmissionById(submissionId), [submissionId])

  if (isLoading) {
    return <LoadingState label="Loading submission…" />
  }
  if (error) {
    return <ErrorState message={error} />
  }
  if (!submission) {
    return null
  }

  return (
    <div>
      <PageHeader
        title={submission.formTitle}
        description={`Submitted by ${submission.submittedByName} on ${formatDateTime(submission.submittedDate)}`}
      />

      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Location</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-3">
          <Field label="Area" value={submission.areaName} />
          <Field label="Location" value={submission.location} />
          <Field label="Sub-location" value={submission.subLocation} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Answers</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Question</TableHead>
                <TableHead>Answer</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {submission.answers.map((answer) => (
                <TableRow key={answer.assessmentQuestionId}>
                  <TableCell>{answer.questionText}</TableCell>
                  <TableCell className="font-medium">{answer.answerValue}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

function Field({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="whitespace-pre-wrap">{value || "—"}</p>
    </div>
  )
}
