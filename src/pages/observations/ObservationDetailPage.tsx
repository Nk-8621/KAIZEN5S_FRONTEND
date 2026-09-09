import { useParams } from "react-router-dom"
import { PageHeader } from "@/components/shared/PageHeader"
import { LoadingState } from "@/components/shared/LoadingState"
import { ErrorState } from "@/components/shared/ErrorState"
import { StatusPill } from "@/components/shared/StatusPill"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAsyncData } from "@/hooks/useAsyncData"
import { observationsApi } from "@/api/safety"
import { formatDate } from "@/lib/utils"
import { ObservationWorkflowActions } from "@/pages/observations/components/ObservationWorkflowActions"

export function ObservationDetailPage() {
  const { id } = useParams<{ id: string }>()
  const observationId = Number(id)

  const { data: observation, isLoading, error, reload } = useAsyncData(() => observationsApi.getById(observationId), [observationId])

  if (isLoading) {
    return <LoadingState label="Loading observation…" />
  }
  if (error) {
    return <ErrorState message={error} />
  }
  if (!observation) {
    return null
  }

  return (
    <div>
      <PageHeader
        title={`Observation OBS-${observation.observationId}`}
        description={`Reported by ${observation.reportedByName} on ${formatDate(observation.createdDate)}`}
        actions={
          <>
            <StatusPill status={observation.severity} />
            <StatusPill status={observation.status} />
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
        <div className="flex flex-col gap-4 lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
              <Field label="Area" value={observation.areaName} />
              <Field label="Responsible person" value={observation.responsibleName} />
              <Field label="Shift" value={observation.shift} />
              <Field label="PPE type observed" value={observation.ppeType} />
              <Field label="Procedure issue" value={observation.procedureIssue} />
              <Field label="Work-environment issue" value={observation.environmentIssue} />
              <Field label="Person's initial reaction" value={observation.personReaction} />
            </CardContent>
          </Card>

          {observation.comments && (
            <Card>
              <CardHeader>
                <CardTitle>Reviewer comments</CardTitle>
              </CardHeader>
              <CardContent className="whitespace-pre-wrap text-sm">{observation.comments}</CardContent>
            </Card>
          )}
        </div>

        <div>
          <ObservationWorkflowActions observation={observation} onChanged={reload} />
        </div>
      </div>
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
