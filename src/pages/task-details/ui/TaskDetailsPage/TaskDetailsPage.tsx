import { ArrowLeft, Pencil } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { useSession } from '@/entities/session'
import { TaskStatusBadge, useTask } from '@/entities/task'
import { TaskStatusActions } from '@/features/change-task-status'
import { DeleteTaskButton, TaskFormDialog } from '@/features/task-form'
import { formatDateTime, getErrorMessage } from '@/shared/lib'
import { TaskHistory } from '@/widgets/task-history'
import {
  Alert,
  AlertDescription,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  EmptyState,
  Skeleton,
} from '@/shared/ui'

const Field = ({ label, children }: { label: string; children: ReactNode }) => (
  <div className="grid gap-1">
    <dt className="text-sm text-muted-foreground">{label}</dt>
    <dd className="font-medium">{children}</dd>
  </div>
)

export const TaskDetailsPage = () => {
  const { taskId = '' } = useParams()
  const navigate = useNavigate()
  const session = useSession()
  const task = useTask(taskId)
  const isManager = session.status === 'authenticated' && session.viewer.role === 'manager'

  if (task.isPending) {
    return (
      <div className="grid gap-4" role="status" aria-label="Загрузка">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (task.isError) {
    return (
      <Alert variant="destructive">
        <AlertDescription className="flex items-center justify-between gap-3">
          {getErrorMessage(task.error)}
          <Button variant="outline" size="sm" onClick={() => task.refetch()}>
            Повторить
          </Button>
        </AlertDescription>
      </Alert>
    )
  }

  if (!task.data) {
    return (
      <div className="flex flex-col items-center">
        <EmptyState
          title="Задача не найдена"
          description="Возможно, она удалена или у вас нет к ней доступа."
        />
        <Button asChild variant="link">
          <Link to="/">К объектам</Link>
        </Button>
      </div>
    )
  }

  const { data } = task
  const objectPath = `/objects/${data.object.id}`

  return (
    <div className="grid gap-4">
      <Button asChild variant="ghost" size="sm" className="w-fit">
        <Link to={objectPath}>
          <ArrowLeft />
          Назад
        </Link>
      </Button>
      <Card>
        <CardHeader className="gap-3">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <CardTitle className="text-2xl break-words">{data.title}</CardTitle>
            <TaskStatusBadge status={data.status} />
          </div>
          {isManager && (
            <div className="flex flex-wrap gap-2">
              <TaskFormDialog
                task={data}
                trigger={
                  <Button variant="outline" size="sm">
                    <Pencil />
                    Редактировать
                  </Button>
                }
              />
              <DeleteTaskButton task={data} onDeleted={() => navigate(objectPath)} />
            </div>
          )}
        </CardHeader>
        <CardContent className="grid gap-6">
          <p className="whitespace-pre-wrap">
            {data.description || <span className="text-muted-foreground">Описание не указано</span>}
          </p>
          <dl className="grid gap-4 sm:grid-cols-2">
            <Field label="Объект">
              <Link to={objectPath} className="underline-offset-4 hover:underline">
                {data.object.name}
              </Link>
            </Field>
            <Field label="Исполнитель">{data.assignee.fullName}</Field>
            <Field label="Автор">{data.author.fullName}</Field>
            <Field label="Создана">{formatDateTime(data.createdAt)}</Field>
          </dl>
        </CardContent>
      </Card>
      <TaskStatusActions task={data} />
      <TaskHistory taskId={data.id} />
    </div>
  )
}
