import { ArrowLeft, MapPin, Pencil, Plus } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router'
import { useObject } from '@/entities/object'
import { useSession } from '@/entities/session'
import { TaskList, useTasks } from '@/entities/task'
import { DeleteObjectButton, ObjectFormDialog } from '@/features/object-form'
import { TaskFormDialog } from '@/features/task-form'
import { getErrorMessage } from '@/shared/lib'
import { Alert, AlertDescription, Button, EmptyState, Skeleton } from '@/shared/ui'

const BackLink = () => (
  <Link
    to="/"
    className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
  >
    <ArrowLeft className="size-4" aria-hidden="true" />
    Назад к объектам
  </Link>
)

export const ObjectDetailsPage = () => {
  const { objectId = '' } = useParams()
  const navigate = useNavigate()
  const session = useSession()
  const isManager = session.status === 'authenticated' && session.viewer.role === 'manager'
  const object = useObject(objectId)
  const tasks = useTasks(objectId)

  if (object.isPending) {
    return (
      <div className="grid gap-4" role="status" aria-label="Загрузка">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-9 w-2/3" />
        <Skeleton className="h-24 w-full" />
      </div>
    )
  }

  if (object.isError) {
    return (
      <div className="grid gap-4">
        <BackLink />
        <Alert variant="destructive">
          <AlertDescription>{getErrorMessage(object.error)}</AlertDescription>
        </Alert>
      </div>
    )
  }

  if (!object.data) {
    return (
      <div className="grid gap-2">
        <BackLink />
        <EmptyState
          title="Объект не найден"
          description="Возможно, он удалён или у вас нет к нему доступа."
        />
      </div>
    )
  }

  const current = object.data

  return (
    <section className="grid gap-6">
      <div className="grid gap-3">
        <BackLink />
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-2xl font-bold">{current.name}</h1>
            <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
              <MapPin className="size-4 shrink-0" aria-hidden="true" />
              {current.address}
            </p>
          </div>
          {isManager && (
            <div className="flex items-center gap-2">
              <ObjectFormDialog
                object={current}
                trigger={
                  <Button variant="outline" size="sm">
                    <Pencil />
                    Изменить
                  </Button>
                }
              />
              <DeleteObjectButton object={current} onDeleted={() => navigate('/')} />
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">Задачи</h2>
            {!isManager && (
              <p className="text-sm text-muted-foreground">Показаны только ваши задачи.</p>
            )}
          </div>
          {isManager && (
            <TaskFormDialog
              objectId={current.id}
              trigger={
                <Button size="sm">
                  <Plus />
                  Новая задача
                </Button>
              }
            />
          )}
        </div>

        {tasks.isPending && (
          <div className="grid gap-2" role="status" aria-label="Загрузка задач">
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
          </div>
        )}

        {tasks.isError && (
          <Alert variant="destructive">
            <AlertDescription>{getErrorMessage(tasks.error)}</AlertDescription>
          </Alert>
        )}

        {tasks.data && (
          <TaskList
            tasks={tasks.data}
            emptyTitle="Задач пока нет"
            emptyDescription={
              isManager
                ? 'Создайте первую задачу по этому объекту.'
                : 'По этому объекту у вас нет задач.'
            }
          />
        )}
      </div>
    </section>
  )
}
