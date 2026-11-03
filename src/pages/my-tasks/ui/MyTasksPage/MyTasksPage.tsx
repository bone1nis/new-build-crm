import { TaskList, useTasks } from '@/entities/task'
import { getErrorMessage } from '@/shared/lib'
import { Alert, AlertDescription, Button, Skeleton } from '@/shared/ui'
import { sortTasks } from '../../model/sortTasks'

export const MyTasksPage = () => {
  const tasks = useTasks()

  return (
    <section className="grid gap-4">
      <h1 className="text-2xl font-bold">Мои задачи</h1>
      {tasks.isPending && (
        <div className="grid gap-2" role="status" aria-label="Загрузка">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      )}
      {tasks.isError && (
        <Alert variant="destructive">
          <AlertDescription className="flex items-center justify-between gap-3">
            {getErrorMessage(tasks.error)}
            <Button variant="outline" size="sm" onClick={() => tasks.refetch()}>
              Повторить
            </Button>
          </AlertDescription>
        </Alert>
      )}
      {tasks.isSuccess && (
        <TaskList
          tasks={sortTasks(tasks.data)}
          showObject
          emptyTitle="У вас пока нет задач"
          emptyDescription="Когда постановщик назначит вам задачу, она появится здесь."
        />
      )}
    </section>
  )
}
