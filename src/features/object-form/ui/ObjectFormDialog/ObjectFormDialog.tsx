import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import type { ReactNode } from 'react'
import { useForm } from 'react-hook-form'
import type { ObjectItem } from '@/entities/object'
import { getErrorMessage } from '@/shared/lib'
import {
  Alert,
  AlertDescription,
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  TextField,
} from '@/shared/ui'
import { useSaveObject } from '../../model/useSaveObject'
import { objectSchema } from '../../model/validation'
import type { ObjectValues } from '../../model/validation'

export interface ObjectFormDialogProps {
  object?: ObjectItem
  trigger: ReactNode
}

export const ObjectFormDialog = ({ object, trigger }: ObjectFormDialogProps) => {
  const [open, setOpen] = useState(false)
  const save = useSaveObject(object)
  const initialValues: ObjectValues = { name: object?.name ?? '', address: object?.address ?? '' }
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ObjectValues>({ resolver: zodResolver(objectSchema), defaultValues: initialValues })

  const handleOpenChange = (next: boolean) => {
    setOpen(next)
    if (next) {
      reset(initialValues)
      save.reset()
    }
  }

  const onSubmit = handleSubmit((values) =>
    save.mutate(values, { onSuccess: () => setOpen(false) }),
  )

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{object ? 'Редактирование объекта' : 'Новый объект'}</DialogTitle>
          <DialogDescription>Название и адрес стройки.</DialogDescription>
        </DialogHeader>
        <form className="grid gap-4" onSubmit={onSubmit} noValidate>
          <TextField label="Название" error={errors.name?.message} {...register('name')} />
          <TextField label="Адрес" error={errors.address?.message} {...register('address')} />
          {save.isError && (
            <Alert variant="destructive">
              <AlertDescription>{getErrorMessage(save.error)}</AlertDescription>
            </Alert>
          )}
          <DialogFooter>
            <Button type="submit" disabled={save.isPending}>
              {save.isPending ? 'Сохраняем…' : 'Сохранить'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
