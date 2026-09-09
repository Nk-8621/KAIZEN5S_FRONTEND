import { PageHeader } from "@/components/shared/PageHeader"
import { ModuleTabs } from "@/components/shared/ModuleTabs"
import { LoadingState } from "@/components/shared/LoadingState"
import { ErrorState } from "@/components/shared/ErrorState"
import { EmptyState } from "@/components/shared/EmptyState"
import { BreakdownBars } from "@/components/shared/BreakdownBars"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAsyncData } from "@/hooks/useAsyncData"
import { assessmentApi } from "@/api/assessment"

/** One % compliance gauge per category (ANALYSIS.md §1.5 — Instrumentation, Condition of
 * Plants, Electrical Equipment, Fire Instruments & Exit, Floor Condition in the wireframe;
 * rendered generically here from whatever categories the backend returns). */
function ComplianceGauge({ category, okCount, notOkCount, compliancePercent }: { category: string; okCount: number; notOkCount: number; compliancePercent: number }) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-3 p-5">
        <p className="text-sm font-medium">{category}</p>
        <div className="h-2.5 w-full rounded-full bg-muted">
          <div className="h-2.5 rounded-full bg-success" style={{ width: `${Math.min(100, Math.max(0, compliancePercent))}%` }} />
        </div>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{compliancePercent.toFixed(0)}% compliant</span>
          <span>
            {okCount} OK / {notOkCount} not OK
          </span>
        </div>
      </CardContent>
    </Card>
  )
}

export function AssessmentDashboardPage() {
  const { data: dashboard, isLoading, error } = useAsyncData(() => assessmentApi.getDashboard(), [])

  const categoryEntries = dashboard ? Object.entries(dashboard.categoryCompliance) : []

  return (
    <div>
      <PageHeader title="Safety Assessment Dashboard" description="Per-category % compliance, top users, and department breakdown." />

      <ModuleTabs
        items={[
          { to: "/assessments", label: "Forms", end: true },
          { to: "/assessments/submissions", label: "Submissions" },
          { to: "/assessments/dashboard", label: "Dashboard" },
        ]}
      />

      {isLoading && <LoadingState label="Loading dashboard…" />}
      {error && <ErrorState message={error} />}

      {dashboard && (
        <>
          <div className="mb-6">
            {categoryEntries.length === 0 ? (
              <EmptyState title="No compliance data yet" description="Submit an assessment to see compliance gauges here." />
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {categoryEntries.map(([category, compliance]) => (
                  <ComplianceGauge
                    key={category}
                    category={category}
                    okCount={compliance.okCount}
                    notOkCount={compliance.notOkCount}
                    compliancePercent={compliance.compliancePercent}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Top users</CardTitle>
              </CardHeader>
              <CardContent>
                <BreakdownBars
                  data={Object.fromEntries(dashboard.topUsers.map((entry) => [entry.userName, entry.count]))}
                  emptyLabel="No submissions yet."
                />
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
          </div>
        </>
      )}
    </div>
  )
}
