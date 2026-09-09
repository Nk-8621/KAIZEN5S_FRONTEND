import * as React from "react"
import { cn } from "@/lib/utils"

const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => {
  const combinedClassName = cn("rounded-lg border border-border bg-card text-card-foreground shadow-sm", className)
  return <div ref={ref} className={combinedClassName} {...props} />
})
Card.displayName = "Card"

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => {
  const combinedClassName = cn("flex flex-col gap-1.5 p-5", className)
  return <div ref={ref} className={combinedClassName} {...props} />
})
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(({ className, ...props }, ref) => {
  const combinedClassName = cn("text-base font-semibold leading-none tracking-tight", className)
  return <h3 ref={ref} className={combinedClassName} {...props} />
})
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => {
    const combinedClassName = cn("text-sm text-muted-foreground", className)
    return <p ref={ref} className={combinedClassName} {...props} />
  },
)
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => {
  const combinedClassName = cn("p-5 pt-0", className)
  return <div ref={ref} className={combinedClassName} {...props} />
})
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => {
  const combinedClassName = cn("flex items-center p-5 pt-0", className)
  return <div ref={ref} className={combinedClassName} {...props} />
})
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter }
