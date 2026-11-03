import { Trash2 } from 'lucide-react'
import { useState } from 'react'
import type { Task } from '@/entities/task'
import { getErrorMessage } from '@/shared/lib'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  Button,
} from '@/shared/ui'
import { useDeleteTask } from '../../model/useDeleteTask'

export interface DeleteTaskButtonProps {
  task: Task
  onDeleted?: () => void
}

export const DeleteTaskButton = ({ task, onDeleted }: DeleteTaskButtonProps) => {
  const [open, setOpen] = useState(false)
  const remove = useDeleteTask()

  const handleOpenChange = (next: boolean) => {
    if (next) remove.reset()
    setOpen(next)
  }

  const handleConfirm = () =>
    remove.mutate(task.id, {
      onSuccess: () => {
        setOpen(false)
        onDeleted?.()
      },
    })

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Trash2 />
          Удалить
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Удалить задачу?</AlertDialogTitle>
          <AlertDialogDescription>
            Задача «{task.title}» и вся её история изменений будут удалены без возможности
            восстановления.
          </AlertDialogDescription>
        </AlertDialogHeader>
        {remove.isError && (
          <p role="alert" className="text-sm text-destructive">
            {getErrorMessage(remove.error)}
          </p>
        )}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={remove.isPending}>Отмена</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={remove.isPending}
            onClick={(event) => {
              event.preventDefault()
              handleConfirm()
            }}
          >
            {remove.isPending ? 'Удаляем…' : 'Удалить'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
