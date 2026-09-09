import { PageHeader } from "@/components/shared/PageHeader"
import { LoadingState } from "@/components/shared/LoadingState"
import { ErrorState } from "@/components/shared/ErrorState"
import { StatTile } from "@/components/shared/StatTile"
import { BreakdownBars } from "@/components/shared/BreakdownBars"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAsyncData } from "@/hooks/useAsyncData"
import { kaizenApi } from "@/api/kaizen"
import { formatCurrency, humanizeStatus } from "@/lib/utils"

export function KaizenDashboardPage() {
  const { data: dashboard, isLoading, error } = useAsyncData(() => kaizenApi.getDashboard({}), [])

  if (isLoading) {
    return <LoadingState label="Loading Kaizen dashboard…" />
  }
  if (error) {
    return <ErrorState message={error} />
  }
  if (!dashboard) {
    return null
  }

  return (
    <div>
      <PageHeader title="Kaizen Dashboard" description="Suggestion volume, pending vs. implemented costs and savings." />

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatTile label="Pending hard saving" value={formatCurrency(dashboard.pendingHardSaving)} />
        <StatTile label="Pending virtual saving" value={formatCurrency(dashboard.pendingVirtualSaving)} />
        <StatTile label="Pending costs" value={formatCurrency(dashboard.pendingCosts)} />
        <StatTile label="Implemented hard saving" value={formatCurrency(dashboard.implementedHardSaving)} tone="success" />
        <StatTile label="Implemented virtual saving" value={formatCurrency(dashboard.implementedVirtualSaving)} tone="success" />
        <StatTile label="Implemented costs" value={formatCurrency(dashboard.implementedCosts)} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Status funnel</CardTitle>
          </CardHeader>
          <CardContent>
            <BreakdownBars data={dashboard.statusFunnel} formatLabel={humanizeStatus} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Kaizens per pillar</CardTitle>
          </CardHeader>
          <CardContent>
            <BreakdownBars data={dashboard.kaizensPerPillar} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Kaizens per line</CardTitle>
          </CardHeader>
          <CardContent>
            <BreakdownBars data={dashboard.kaizensPerLine} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
