import { PageHeader } from "@/components/shared/PageHeader"
import { ModuleTabs } from "@/components/shared/ModuleTabs"
import { LoadingState } from "@/components/shared/LoadingState"
import { ErrorState } from "@/components/shared/ErrorState"
import { StatTile } from "@/components/shared/StatTile"
import { BreakdownBars } from "@/components/shared/BreakdownBars"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAsyncData } from "@/hooks/useAsyncData"
import { observationsApi } from "@/api/safety"

export function ObservationDashboardPage() {
  const { data: dashboard, isLoading, error } = useAsyncData(() => observationsApi.getDashboard({}), [])

  return (
    <div>
      <PageHeader title="Safety Observation Dashboard" description="PPE, procedure, environment, and compliance breakdowns." />

      <ModuleTabs items={[{ to: "/observations", label: "Observations", end: true }, { to: "/observations/dashboard", label: "Dashboard" }]} />

      {isLoading && <LoadingState label="Loading dashboard…" />}
      {error && <ErrorState message={error} />}

      {dashboard && (
        <>
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StatTile label="Compliance" value={`${dashboard.compliancePercent.toFixed(0)}%`} tone="success" />
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>PPE breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <BreakdownBars data={dashboard.ppeBreakdown} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Procedure breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <BreakdownBars data={dashboard.procedureBreakdown} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Work-environment breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <BreakdownBars data={dashboard.environmentBreakdown} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Shift breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <BreakdownBars data={dashboard.shiftBreakdown} />
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
