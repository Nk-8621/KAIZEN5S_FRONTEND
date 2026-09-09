import { PageHeader } from "@/components/shared/PageHeader"
import { ModuleTabs } from "@/components/shared/ModuleTabs"
import { LoadingState } from "@/components/shared/LoadingState"
import { ErrorState } from "@/components/shared/ErrorState"
import { StatTile } from "@/components/shared/StatTile"
import { BreakdownBars } from "@/components/shared/BreakdownBars"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAsyncData } from "@/hooks/useAsyncData"
import { incidentsApi } from "@/api/safety"
import { humanizeStatus } from "@/lib/utils"

export function IncidentDashboardPage() {
  const { data: dashboard, isLoading, error } = useAsyncData(() => incidentsApi.getDashboard({}), [])

  return (
    <div>
      <PageHeader title="Safety Incident Dashboard" description="Status/severity funnel, breakdowns, and the Heinrich's Pyramid ratio." />

      <ModuleTabs items={[{ to: "/incidents", label: "Incidents", end: true }, { to: "/incidents/dashboard", label: "Dashboard" }]} />

      {isLoading && <LoadingState label="Loading dashboard…" />}
      {error && <ErrorState message={error} />}

      {dashboard && (
        <>
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StatTile label="Major injuries" value={dashboard.heinrichPyramid.majorInjuryCount} tone="destructive" />
            <StatTile label="Near misses" value={dashboard.heinrichPyramid.nearMissCount} tone="warning" />
            <StatTile label="Minor incidents" value={dashboard.heinrichPyramid.minorIncidentCount} />
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
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
                <CardTitle>Severity breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <BreakdownBars data={dashboard.severityBreakdown} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Department breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <BreakdownBars data={dashboard.departmentBreakdown} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Area breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <BreakdownBars data={dashboard.areaBreakdown} />
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Top reporters</CardTitle>
              </CardHeader>
              <CardContent>
                <BreakdownBars
                  data={Object.fromEntries(dashboard.topReporters.map((entry) => [entry.userName, entry.count]))}
                  emptyLabel="No reports yet."
                />
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  )
}
