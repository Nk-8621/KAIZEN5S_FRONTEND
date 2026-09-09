import { useState } from "react"
import { Plus } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { StatusPill } from "@/components/shared/StatusPill"
import { LoadingState } from "@/components/shared/LoadingState"
import { ErrorState } from "@/components/shared/ErrorState"
import { EmptyState } from "@/components/shared/EmptyState"
import { useAsyncData } from "@/hooks/useAsyncData"
import { useAuth } from "@/context/AuthContext"
import { actionsApi } from "@/api/actions"
import { CreateActionDialog } from "@/pages/kaizen/components/CreateActionDialog"
import { ActionRow } from "@/pages/kaizen/components/ActionRow"

export function KaizenActionsTab({ kaizenId }: { kaizenId: number }) {
  const { hasRole } = useAuth()
  const { data: actions, isLoading, error, reload } = useAsyncData(() => actionsApi.getForKaizen(kaizenId), [kaizenId])
  const [isCreateOpen, setIsCreateOpen] = useState(false)

  if (isLoading) {
    return <LoadingState label="Loading actions…" />
  }
  if (error) {
    return <ErrorState message={error} />
  }

  return (
    <div className="flex flex-col gap-3">
      {hasRole("Supervisor", "Admin") && (
        <div className="flex justify-end">
          <Button size="sm" onClick={() => setIsCreateOpen(true)}>
            <Plus className="h-4 w-4" />
            New action
          </Button>
        </div>
      )}

      {actions && actions.length === 0 && <EmptyState title="No actions yet" description="Actions raised against this Kaizen will appear here." />}

      {actions?.map((action) => (
        <Card key={action.actionId}>
          <CardContent className="p-4">
            <div className="mb-2 flex items-center justify-between gap-2">
              <p className="font-medium">{action.description}</p>
              <div className="flex items-center gap-2">
                <StatusPill status={action.priority} />
                <StatusPill status={action.status} />
              </div>
            </div>
            <ActionRow kaizenId={kaizenId} action={action} onChanged={reload} />
          </CardContent>
        </Card>
      ))}

      <CreateActionDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onCreate={(request) => actionsApi.createForKaizen(kaizenId, request)}
        onCreated={reload}
      />
    </div>
  )
}
