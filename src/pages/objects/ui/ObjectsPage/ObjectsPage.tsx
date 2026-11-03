import { Building2, Plus } from 'lucide-react'
import { ObjectCard, useObjects } from '@/entities/object'
import { useSession } from '@/entities/session'
import { ObjectFormDialog } from '@/features/object-form'
import { getErrorMessage } from '@/shared/lib'
import { Alert, AlertDescription, Button, EmptyState, Skeleton } from '@/shared/ui'

export const ObjectsPage = () => {
  const session = useSession()
  const isManager = session.status === 'authenticated' && session.viewer.role === 'manager'
  const { data, isPending, isError, error } = useObjects()

  return (
    <section className="grid gap-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Объекты</h1>
        {isManager && (
          <ObjectFormDialog
            trigger={
              <Button>
                <Plus />
                Новый объект
              </Button>
            }
          />
        )}
      </div>

      {isPending && (
        <div className="grid gap-3" role="status" aria-label="Загрузка">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      )}

      {isError && (
        <Alert variant="destructive">
          <AlertDescription>{getErrorMessage(error)}</AlertDescription>
        </Alert>
      )}

      {data && data.length === 0 && (
        <EmptyState
          icon={<Building2 />}
          title={isManager ? 'Создайте первый объект' : 'Объектов с вашими задачами пока нет'}
          description={
            isManager
              ? 'Объект — это стройка. К нему привязываются задачи.'
              : 'Когда постановщик назначит вам задачу, объект появится здесь.'
          }
        />
      )}

      {data && data.length > 0 && (
        <ul className="grid gap-3">
          {data.map((object) => (
            <li key={object.id}>
              <ObjectCard object={object} />
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
