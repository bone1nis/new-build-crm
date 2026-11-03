import { useState } from 'react'
import { getAvailableTransitions } from '@/entities/task'
import type { Task, TaskTransition } from '@/entities/task'
import { useSession } from '@/entities/session'
import { getErrorMessage } from '@/shared/lib'
import { Alert, AlertDescription, Button } from '@/shared/ui'
import { useChangeTaskStatus } from '../../model/useChangeTaskStatus'
import { ReworkDialog } from '../ReworkDialog'

export const TaskStatusActions = ({ task }: { task: Task }) => {
  const session = useSession()
  const change = useChangeTaskStatus()
  const [pending, setPending] = useState<TaskTransition | null>(null)

  if (session.status !== 'authenticated') return null

  const transitions = getAvailableTransitions(task, {
    id: session.viewer.id,
    role: session.viewer.role,
  })
  if (transitions.length === 0) return null

  const run = (transition: TaskTransition, comment?: string) =>
    change.mutate(
      { taskId: task.id, toStatus: transition.to, comment },
      { onSuccess: () => setPending(null) },
    )

  const handleClick = (transition: TaskTransition) => {
    change.reset()
    if (transition.requiresComment) setPending(transition)
    else run(transition)
  }

  const showInlineError = change.isError && pending === null

  return (
    <div className="grid gap-3">
      <div className="flex flex-wrap gap-2">
        {transitions.map((transition) => (
          <Button
            key={transition.to}
            variant={transition.variant}
            disabled={change.isPending}
            onClick={() => handleClick(transition)}
          >
            {transition.label}
          </Button>
        ))}
      </div>
      {showInlineError && (
        <Alert variant="destructive">
          <AlertDescription>{getErrorMessage(change.error)}</AlertDescription>
        </Alert>
      )}
      <ReworkDialog
        open={pending !== null}
        onOpenChange={(open) => {
          if (!open) setPending(null)
        }}
        label={pending?.label ?? ''}
        isPending={change.isPending}
        error={change.error}
        onSubmit={(comment) => pending && run(pending, comment)}
      />
    </div>
  )
}
