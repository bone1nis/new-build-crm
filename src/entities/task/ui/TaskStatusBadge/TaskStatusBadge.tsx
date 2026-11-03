import { Badge } from '@/shared/ui'
import { cn } from '@/shared/lib'
import { STATUS_LABEL } from '../../config/constants'
import type { TaskStatus } from '../../model/types'

const STATUS_STYLE: Record<
  TaskStatus,
  { variant: 'default' | 'secondary' | 'destructive' | 'outline'; className?: string }
> = {
  new: { variant: 'outline' },
  in_progress: { variant: 'default' },
  review: { variant: 'secondary' },
  rework: { variant: 'destructive' },
  accepted: {
    variant: 'secondary',
    className: 'bg-emerald-600/15 text-emerald-700 dark:text-emerald-300',
  },
}

export const TaskStatusBadge = ({ status }: { status: TaskStatus }) => {
  const { variant, className } = STATUS_STYLE[status]
  return (
    <Badge variant={variant} className={cn('whitespace-nowrap', className)}>
      {STATUS_LABEL[status]}
    </Badge>
  )
}
