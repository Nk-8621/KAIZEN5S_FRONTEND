/**
 * Horizontal bar breakdown for a Record<string, number> — the shape every dashboard's
 * "count by X" data comes back as (status funnel, per-pillar, per-line, severity, etc).
 * Categorical color is assigned in the fixed --chart-1..--chart-8 order (never reassigned by
 * rank), values are direct-labeled so no separate legend is needed, and anything past 8
 * categories folds into "Other" rather than generating a 9th hue.
 */
const CHART_COLOR_VARS = [
  "--chart-1",
  "--chart-2",
  "--chart-3",
  "--chart-4",
  "--chart-5",
  "--chart-6",
  "--chart-7",
  "--chart-8",
]

interface BreakdownBarsProps {
  data: Record<string, number>
  emptyLabel?: string
  formatLabel?: (key: string) => string
}

export function BreakdownBars({ data, emptyLabel = "No data yet.", formatLabel }: BreakdownBarsProps) {
  const entries = Object.entries(data).filter(([, value]) => value > 0)

  if (entries.length === 0) {
    return <p className="py-6 text-center text-sm text-muted-foreground">{emptyLabel}</p>
  }

  const sortedEntries = [...entries].sort((a, b) => b[1] - a[1])
  const visibleEntries = sortedEntries.slice(0, 8)
  const otherEntries = sortedEntries.slice(8)
  const otherTotal = otherEntries.reduce((sum, [, value]) => sum + value, 0)

  const displayEntries: [string, number][] = otherTotal > 0 ? [...visibleEntries, ["Other", otherTotal]] : visibleEntries
  const maxValue = Math.max(...displayEntries.map(([, value]) => value))

  return (
    <div className="flex flex-col gap-3">
      {displayEntries.map(([key, value], index) => {
        const label = formatLabel ? formatLabel(key) : key
        const widthPercent = maxValue === 0 ? 0 : (value / maxValue) * 100
        const colorVar = key === "Other" ? "--muted-foreground" : CHART_COLOR_VARS[index % CHART_COLOR_VARS.length]

        return (
          <div key={key} className="flex items-center gap-3">
            <span className="w-32 shrink-0 truncate text-sm text-muted-foreground" title={label}>
              {label}
            </span>
            <div className="h-2.5 flex-1 rounded-full bg-muted">
              <div
                className="h-2.5 rounded-full"
                style={{ width: `${widthPercent}%`, backgroundColor: `hsl(var(${colorVar}))` }}
              />
            </div>
            <span className="w-10 shrink-0 text-right text-sm font-medium tabular-nums">{value}</span>
          </div>
        )
      })}
    </div>
  )
}
