import { zodResolver } from '@hookform/resolvers/zod'
import { useId } from 'react'
import { useForm } from 'react-hook-form'
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
  Label,
  Textarea,
} from '@/shared/ui'
import { reworkSchema } from '../../model/validation'
import type { ReworkValues } from '../../model/validation'

export interface ReworkDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  label: string
  isPending: boolean
  error: unknown
  onSubmit: (comment: string) => void
}

export const ReworkDialog = ({
  open,
  onOpenChange,
  label,
  isPending,
  error,
  onSubmit,
}: ReworkDialogProps) => {
  const fieldId = useId()
  const errorId = `${fieldId}-error`
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ReworkValues>({
    resolver: zodResolver(reworkSchema),
    defaultValues: { comment: '' },
  })

  const handleOpenChange = (next: boolean) => {
    if (next) reset({ comment: '' })
    onOpenChange(next)
  }

  const message = errors.comment?.message

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{label}</DialogTitle>
          <DialogDescription>
            Комментарий увидит исполнитель и он попадёт в историю.
          </DialogDescription>
        </DialogHeader>
        <form
          className="grid gap-4"
          onSubmit={handleSubmit((values) => onSubmit(values.comment))}
          noValidate
        >
          <div className="grid gap-2">
            <Label htmlFor={fieldId}>Что нужно исправить</Label>
            <Textarea
              id={fieldId}
              rows={4}
              aria-invalid={Boolean(message)}
              aria-describedby={message ? errorId : undefined}
              {...register('comment')}
            />
            {message && (
              <p id={errorId} role="alert" className="text-sm text-destructive">
                {message}
              </p>
            )}
          </div>
          {error !== null && error !== undefined && (
            <Alert variant="destructive">
              <AlertDescription>{getErrorMessage(error)}</AlertDescription>
            </Alert>
          )}
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Отмена
              </Button>
            </DialogClose>
            <Button type="submit" variant="destructive" disabled={isPending}>
              {isPending ? 'Отправляем…' : label}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
