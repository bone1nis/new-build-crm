import { ArrowRight } from 'lucide-react'
import { TaskStatusBadge, useTaskHistory } from '@/entities/task'
import { formatDateTime, getErrorMessage } from '@/shared/lib'
import {
  Alert,
  AlertDescription,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Skeleton,
} from '@/shared/ui'

export const TaskHistory = ({ taskId }: { taskId: string }) => {
  const history = useTaskHistory(taskId)

  return (
    <Card>
      <CardHeader>
        <CardTitle>История</CardTitle>
      </CardHeader>
      <CardContent>
        {history.isPending && (
          <div className="grid gap-4" role="status" aria-label="Загрузка истории">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        )}
        {history.isError && (
          <Alert variant="destructive">
            <AlertDescription className="flex items-center justify-between gap-3">
              {getErrorMessage(history.error)}
              <Button variant="outline" size="sm" onClick={() => history.refetch()}>
                Повторить
              </Button>
            </AlertDescription>
          </Alert>
        )}
        {history.data && (
          <ol className="grid gap-5 border-l pl-5">
            {history.data.map((entry) => (
              <li key={entry.id} className="relative grid gap-2">
                <span
                  aria-hidden="true"
                  className="absolute top-1.5 -left-[25px] size-2 rounded-full bg-primary"
                />
                <div className="flex flex-wrap items-center gap-2">
                  {entry.fromStatus ? (
                    <>
                      <TaskStatusBadge status={entry.fromStatus} />
                      <ArrowRight className="size-4 text-muted-foreground" aria-label="перешла в" />
                    </>
                  ) : (
                    <span className="text-sm font-medium">Создана</span>
                  )}
                  <TaskStatusBadge status={entry.toStatus} />
                </div>
                <p className="text-sm text-muted-foreground">
                  {entry.changedBy.fullName} · {formatDateTime(entry.createdAt)}
                </p>
                {entry.comment && (
                  <blockquote className="rounded-md border bg-muted px-3 py-2 text-sm whitespace-pre-wrap">
                    {entry.comment}
                  </blockquote>
                )}
              </li>
            ))}
          </ol>
        )}
      </CardContent>
    </Card>
  )
}
