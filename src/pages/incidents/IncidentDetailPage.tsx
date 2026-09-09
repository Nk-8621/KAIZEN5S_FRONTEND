import { useParams } from "react-router-dom"
import { PageHeader } from "@/components/shared/PageHeader"
import { LoadingState } from "@/components/shared/LoadingState"
import { ErrorState } from "@/components/shared/ErrorState"
import { StatusPill } from "@/components/shared/StatusPill"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAsyncData } from "@/hooks/useAsyncData"
import { incidentsApi } from "@/api/safety"
import { formatDate, humanizeStatus } from "@/lib/utils"
import { IncidentWorkflowActions } from "@/pages/incidents/components/IncidentWorkflowActions"

export function IncidentDetailPage() {
  const { id } = useParams<{ id: string }>()
  const incidentId = Number(id)

  const { data: incident, isLoading, error, reload } = useAsyncData(() => incidentsApi.getById(incidentId), [incidentId])

  if (isLoading) {
    return <LoadingState label="Loading incident…" />
  }
  if (error) {
    return <ErrorState message={error} />
  }
  if (!incident) {
    return null
  }

  return (
    <div>
      <PageHeader
        title={humanizeStatus(incident.incidentType)}
        description={`Reported by ${incident.reportedByName} on ${formatDate(incident.createdDate)}`}
        actions={
          <>
            <StatusPill status={incident.severity} />
            <StatusPill status={incident.status} />
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
              <Field label="Area" value={incident.areaName} />
              <Field label="Factory area" value={incident.factoryArea} />
              <Field label="Production area" value={incident.productionArea} />
              <Field label="Responsible person" value={incident.responsibleName} />
              <Field label="Target date" value={incident.targetDate ? formatDate(incident.targetDate) : null} />
              <Field label="Analysis rating" value={incident.analysisRatingStars ? `${incident.analysisRatingStars}/5` : null} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>5W1H</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
              <Field label="What" value={incident.what} />
              <Field label="Why" value={incident.why} />
              <Field label="Where" value={incident.where} />
              <Field label="When" value={incident.when} />
              <Field label="Whom" value={incident.whom} />
              <Field label="How" value={incident.how} />
            </CardContent>
          </Card>

          {incident.approverComments && (
            <Card>
              <CardHeader>
                <CardTitle>Approver comments</CardTitle>
              </CardHeader>
              <CardContent className="whitespace-pre-wrap text-sm">{incident.approverComments}</CardContent>
            </Card>
          )}
        </div>

        <div>
          <IncidentWorkflowActions incident={incident} onChanged={reload} />
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
