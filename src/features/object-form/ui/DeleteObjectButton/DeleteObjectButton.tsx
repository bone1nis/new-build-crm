import { Trash2 } from 'lucide-react'
import { useState } from 'react'
import type { MouseEvent } from 'react'
import type { ObjectItem } from '@/entities/object'
import { getErrorMessage } from '@/shared/lib'
import {
  Alert,
  AlertDescription,
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
import { useDeleteObject } from '../../model/useDeleteObject'

export interface DeleteObjectButtonProps {
  object: ObjectItem
  onDeleted?: () => void
}

export const DeleteObjectButton = ({ object, onDeleted }: DeleteObjectButtonProps) => {
  const [open, setOpen] = useState(false)
  const remove = useDeleteObject()

  const handleOpenChange = (next: boolean) => {
    setOpen(next)
    if (next) remove.reset()
  }

  const handleConfirm = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    remove.mutate(object.id, {
      onSuccess: () => {
        setOpen(false)
        onDeleted?.()
      },
    })
  }

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
          <AlertDialogTitle>Удалить объект «{object.name}»?</AlertDialogTitle>
          <AlertDialogDescription>
            Объект «{object.name}» и все его задачи будут удалены. История изменений задач
            сохранится в системе.
          </AlertDialogDescription>
        </AlertDialogHeader>
        {remove.isError && (
          <Alert variant="destructive">
            <AlertDescription>{getErrorMessage(remove.error)}</AlertDescription>
          </Alert>
        )}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={remove.isPending}>Отмена</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={remove.isPending}
            onClick={handleConfirm}
          >
            {remove.isPending ? 'Удаляем…' : 'Удалить'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
