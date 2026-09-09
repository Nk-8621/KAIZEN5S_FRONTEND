import * as React from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

export type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement>

/**
 * A styled native <select> rather than a full Radix Select tree — this app's dropdowns are
 * plain single-choice lookups (Site/Line/Area/status/etc.), so a native element keeps keyboard
 * and mobile behavior correct for free without needing the extra portal/trigger/content wiring
 * a custom listbox would require for the same result (Rule 7 — avoid over-engineering).
 */
const Select = React.forwardRef<HTMLSelectElement, SelectProps>(({ className, children, ...props }, ref) => {
  const combinedClassName = cn(
    "flex h-10 w-full appearance-none rounded-md border border-input bg-background px-3 py-2 pr-9 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
    className,
  )
  return (
    <div className="relative">
      <select ref={ref} className={combinedClassName} {...props}>
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
    </div>
  )
})
Select.displayName = "Select"

export { Select }
