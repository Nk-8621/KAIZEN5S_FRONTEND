import { useState } from "react"
import { Link, useParams } from "react-router-dom"
import { Pencil } from "lucide-react"
import { PageHeader } from "@/components/shared/PageHeader"
import { LoadingState } from "@/components/shared/LoadingState"
import { ErrorState } from "@/components/shared/ErrorState"
import { StatusPill } from "@/components/shared/StatusPill"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { useAsyncData } from "@/hooks/useAsyncData"
import { kaizenApi } from "@/api/kaizen"
import { formatCurrency, formatDate } from "@/lib/utils"
import { KaizenWorkflowActions } from "@/pages/kaizen/components/KaizenWorkflowActions"
import { KaizenActionsTab } from "@/pages/kaizen/components/KaizenActionsTab"
import { KaizenCostsSavingsTab } from "@/pages/kaizen/components/KaizenCostsSavingsTab"

export function KaizenDetailPage() {
  const { id } = useParams<{ id: string }>()
  const kaizenId = Number(id)

  const { data: kaizen, isLoading, error, reload } = useAsyncData(() => kaizenApi.getById(kaizenId), [kaizenId])

  const [activeTab, setActiveTab] = useState("overview")

  if (isLoading) {
    return <LoadingState label="Loading Kaizen…" />
  }
  if (error) {
    return <ErrorState message={error} />
  }
  if (!kaizen) {
    return null
  }

  return (
    <div>
      <PageHeader
        title={kaizen.title}
        description={`Submitted by ${kaizen.createdByName} on ${formatDate(kaizen.createdDate)}`}
        actions={
          <>
            <StatusPill status={kaizen.status} />
            <Button variant="outline" size="sm" asChild>
              <Link to={`/kaizen/${kaizen.kaizenId}/edit`}>
                <Pencil className="h-4 w-4" />
                Edit
              </Link>
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
        <div className="lg:col-span-3">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="actions">Actions</TabsTrigger>
              <TabsTrigger value="costs-savings">Costs &amp; Savings</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <Card>
                <CardHeader>
                  <CardTitle>Problem description</CardTitle>
                </CardHeader>
                <CardContent className="whitespace-pre-wrap text-sm">{kaizen.problemDescription}</CardContent>
              </Card>

              <Card className="mt-4">
                <CardHeader>
                  <CardTitle>4G Analysis</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
                  <Field label="Gemba — the real place" value={kaizen.gembaRealPlace} />
                  <Field label="Gembutsu — machine condition" value={kaizen.gembutsuMachineCondition} />
                  <Field label="Genjitsu — parameter adequacy" value={kaizen.genjitsuParameterAdequacy} />
                  <Field label="Genri-Gensoku — principles/standards" value={kaizen.genriGensokuPrinciplesStandards} />
                </CardContent>
              </Card>

              <Card className="mt-4">
                <CardHeader>
                  <CardTitle>5W1H</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-3">
                  <Field label="What" value={kaizen.what} />
                  <Field label="When" value={kaizen.when} />
                  <Field label="Where" value={kaizen.where} />
                  <Field label="Who" value={kaizen.who} />
                  <Field label="Which" value={kaizen.which} />
                  <Field label="How" value={kaizen.how} />
                  <div className="sm:col-span-3">
                    <Field label="Overall description" value={kaizen.overallDescription} />
                  </div>
                </CardContent>
              </Card>

              {(kaizen.rejectReason || kaizen.feasibilityComment) && (
                <Card className="mt-4">
                  <CardHeader>
                    <CardTitle>Review notes</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
                    {kaizen.rejectReason && <Field label="Reject reason" value={`${kaizen.rejectReason} — ${kaizen.rejectComment}`} />}
                    {kaizen.feasibilityComment && <Field label="Feasibility comment" value={kaizen.feasibilityComment} />}
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="actions">
              <KaizenActionsTab kaizenId={kaizen.kaizenId} />
            </TabsContent>

            <TabsContent value="costs-savings">
              <KaizenCostsSavingsTab kaizenId={kaizen.kaizenId} savings={kaizen.savings} costs={kaizen.costs} onChanged={reload} />
            </TabsContent>
          </Tabs>
        </div>

        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Benefit summary</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2 text-sm">
              <SummaryRow label="Hard saving" value={formatCurrency(kaizen.totalHardSaving)} />
              <SummaryRow label="Virtual saving" value={formatCurrency(kaizen.totalVirtualSaving)} />
              <SummaryRow label="Benefit / cost ratio" value={kaizen.benefitCostRatio.toFixed(2)} />
              {kaizen.isBestPractice && <SummaryRow label="Best practice" value="Yes" />}
              {kaizen.isPokaYoke && <SummaryRow label="Poka-yoke" value="Yes" />}
            </CardContent>
          </Card>

          <KaizenWorkflowActions kaizen={kaizen} onChanged={reload} />
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

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium tabular-nums">{value}</span>
    </div>
  )
}
