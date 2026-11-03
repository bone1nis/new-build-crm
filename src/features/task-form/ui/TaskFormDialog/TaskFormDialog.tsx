import { zodResolver } from '@hookform/resolvers/zod'
import { useId, useState } from 'react'
import type { ReactNode } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useExecutors } from '@/entities/profile'
import type { Task } from '@/entities/task'
import { getErrorMessage } from '@/shared/lib'
import {
  Alert,
  AlertDescription,
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Skeleton,
  Textarea,
  TextField,
} from '@/shared/ui'
import { useSaveTask } from '../../model/useSaveTask'
import { taskSchema } from '../../model/validation'
import type { TaskValues } from '../../model/validation'

export interface TaskFormDialogProps {
  objectId?: string
  task?: Task
  trigger: ReactNode
}

const getDefaults = (task: Task | undefined, objectId: string | undefined): TaskValues => ({
  title: task?.title ?? '',
  description: task?.description ?? '',
  objectId: task?.object.id ?? objectId ?? '',
  assigneeId: task?.assignee.id ?? '',
})

export const TaskFormDialog = ({ objectId, task, trigger }: TaskFormDialogProps) => {
  const [open, setOpen] = useState(false)
  const fieldId = useId()
  const save = useSaveTask()
  const executors = useExecutors()
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TaskValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: getDefaults(task, objectId),
  })

  const handleOpenChange = (next: boolean) => {
    if (next) {
      reset(getDefaults(task, objectId))
      save.reset()
    }
    setOpen(next)
  }

  const onSubmit = (values: TaskValues) =>
    save.mutate({ values, taskId: task?.id }, { onSuccess: () => setOpen(false) })

  const isEdit = Boolean(task)
  const hasExecutors = (executors.data?.length ?? 0) > 0

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Редактирование задачи' : 'Новая задача'}</DialogTitle>
          <DialogDescription>
            {isEdit ? 'Измените данные задачи.' : 'Укажите название и назначьте исполнителя.'}
          </DialogDescription>
        </DialogHeader>
        <form className="grid gap-4" onSubmit={handleSubmit(onSubmit)} noValidate>
          <TextField label="Название" error={errors.title?.message} {...register('title')} />
          <div className="grid gap-2">
            <Label htmlFor={`${fieldId}-description`}>Описание</Label>
            <Textarea id={`${fieldId}-description`} rows={4} {...register('description')} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor={`${fieldId}-assignee`}>Исполнитель</Label>
            {executors.isPending && <Skeleton className="h-9 w-full" />}
            {executors.isError && (
              <p role="alert" className="text-sm text-destructive">
                Не удалось загрузить список исполнителей
              </p>
            )}
            {executors.isSuccess && !hasExecutors && (
              <p className="text-sm text-muted-foreground">Нет доступных исполнителей</p>
            )}
            {executors.isSuccess && hasExecutors && (
              <Controller
                control={control}
                name="assigneeId"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger
                      id={`${fieldId}-assignee`}
                      className="w-full"
                      aria-invalid={Boolean(errors.assigneeId)}
                      onBlur={field.onBlur}
                    >
                      <SelectValue placeholder="Выберите исполнителя" />
                    </SelectTrigger>
                    <SelectContent>
                      {executors.data.map((executor) => (
                        <SelectItem key={executor.id} value={executor.id}>
                          {executor.fullName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            )}
            {errors.assigneeId && (
              <p role="alert" className="text-sm text-destructive">
                {errors.assigneeId.message}
              </p>
            )}
          </div>
          {errors.objectId && (
            <p role="alert" className="text-sm text-destructive">
              {errors.objectId.message}
            </p>
          )}
          {save.isError && (
            <Alert variant="destructive">
              <AlertDescription>{getErrorMessage(save.error)}</AlertDescription>
            </Alert>
          )}
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Отмена
              </Button>
            </DialogClose>
            <Button type="submit" disabled={save.isPending}>
              {save.isPending ? 'Сохраняем…' : isEdit ? 'Сохранить' : 'Создать'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
