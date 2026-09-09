import { AlertTriangle } from "lucide-react"

export function ErrorState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-md border border-destructive/30 bg-destructive/5 py-12 text-center text-sm">
      <AlertTriangle className="h-5 w-5 text-destructive" />
      <p className="text-destructive">{message}</p>
    </div>
  )
}
