import { Link } from 'react-router'
import { EmptyState } from '@/shared/ui'
import type { Task } from '../../model/types'
import { TaskStatusBadge } from '../TaskStatusBadge'

export interface TaskListProps {
  tasks: Task[]
  showObject?: boolean
  emptyTitle?: string
  emptyDescription?: string
}

export const TaskList = ({
  tasks,
  showObject = false,
  emptyTitle = 'Задач нет',
  emptyDescription = 'Здесь пока пусто.',
}: TaskListProps) => {
  if (tasks.length === 0) return <EmptyState title={emptyTitle} description={emptyDescription} />

  return (
    <ul className="divide-y rounded-lg border bg-card">
      {tasks.map((task) => (
        <li key={task.id}>
          <Link
            to={`/tasks/${task.id}`}
            className="flex items-center justify-between gap-3 px-4 py-3 transition-colors hover:bg-accent focus-visible:bg-accent focus-visible:outline-none"
          >
            <div className="min-w-0">
              <p className="truncate font-medium">{task.title}</p>
              <p className="truncate text-sm text-muted-foreground">
                {showObject ? `${task.object.name} · ` : ''}
                {task.assignee.fullName}
              </p>
            </div>
            <TaskStatusBadge status={task.status} />
          </Link>
        </li>
      ))}
    </ul>
  )
}
