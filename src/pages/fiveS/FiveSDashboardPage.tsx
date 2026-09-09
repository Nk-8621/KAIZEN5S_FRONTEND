import { PageHeader } from "@/components/shared/PageHeader"
import { ModuleTabs } from "@/components/shared/ModuleTabs"
import { LoadingState } from "@/components/shared/LoadingState"
import { ErrorState } from "@/components/shared/ErrorState"
import { StatTile } from "@/components/shared/StatTile"
import { BreakdownBars } from "@/components/shared/BreakdownBars"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useAsyncData } from "@/hooks/useAsyncData"
import { fiveSApi } from "@/api/fiveS"
import { FIVE_S_CATEGORIES } from "@/types/fiveS"

const RATING_VALUES = [1, 2, 3, 4, 5]

export function FiveSDashboardPage() {
  const { data: dashboard, isLoading, error } = useAsyncData(() => fiveSApi.getDashboard(), [])

  return (
    <div>
      <PageHeader title="5S Dashboard" description="Questionnaire coverage, category completion, and rating distribution." />

      <ModuleTabs
        items={[
          { to: "/five-s", label: "Questionnaires", end: true },
          { to: "/five-s/audits", label: "Audits" },
          { to: "/five-s/dashboard", label: "Dashboard" },
        ]}
      />

      {isLoading && <LoadingState label="Loading 5S dashboard…" />}
      {error && <ErrorState message={error} />}

      {dashboard && (
        <>
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <StatTile label="Questionnaires" value={dashboard.questionnaireCount} />
            <StatTile label="Users who answered" value={dashboard.usersAnsweredCount} />
            <StatTile label="Average rating" value={dashboard.averageRating.toFixed(1)} />
            <StatTile label="Questions with actions" value={dashboard.questionsWithActions} tone="warning" />
            <StatTile label="Questions without actions" value={dashboard.questionsWithoutActions} />
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Category completion</CardTitle>
              </CardHeader>
              <CardContent>
                <BreakdownBars data={dashboard.categoryCompletionPercent} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Rating distribution by category</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Category</TableHead>
                      {RATING_VALUES.map((value) => (
                        <TableHead key={value} className="text-right">
                          {value}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {FIVE_S_CATEGORIES.map((category) => {
                      const distribution = dashboard.ratingDistributionByCategory[category] ?? {}
                      return (
                        <TableRow key={category}>
                          <TableCell className="font-medium">{category}</TableCell>
                          {RATING_VALUES.map((value) => (
                            <TableCell key={value} className="text-right tabular-nums">
                              {distribution[value] ?? 0}
                            </TableCell>
                          ))}
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  )
}
