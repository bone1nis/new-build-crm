import type { Task, TaskStatus } from './types'

export type TransitionActor = 'assignee' | 'manager'

export interface TaskTransition {
  from: TaskStatus
  to: TaskStatus
  actor: TransitionActor
  requiresComment: boolean
  label: string
  variant: 'default' | 'outline' | 'destructive'
}

export interface TransitionViewer {
  id: string
  role: 'manager' | 'executor'
}

export const TASK_TRANSITIONS: TaskTransition[] = [
  {
    from: 'new',
    to: 'in_progress',
    actor: 'assignee',
    requiresComment: false,
    label: 'Взять в работу',
    variant: 'default',
  },
  {
    from: 'in_progress',
    to: 'review',
    actor: 'assignee',
    requiresComment: false,
    label: 'Отправить на проверку',
    variant: 'default',
  },
  {
    from: 'review',
    to: 'accepted',
    actor: 'manager',
    requiresComment: false,
    label: 'Принять',
    variant: 'default',
  },
  {
    from: 'review',
    to: 'rework',
    actor: 'manager',
    requiresComment: true,
    label: 'Вернуть на доработку',
    variant: 'destructive',
  },
  {
    from: 'rework',
    to: 'in_progress',
    actor: 'assignee',
    requiresComment: false,
    label: 'Вернуть в работу',
    variant: 'default',
  },
]

export const getAvailableTransitions = (
  task: Pick<Task, 'status' | 'assignee'>,
  viewer: TransitionViewer,
): TaskTransition[] =>
  TASK_TRANSITIONS.filter((transition) => {
    if (transition.from !== task.status) return false
    if (transition.actor === 'manager') return viewer.role === 'manager'
    return viewer.role === 'executor' && task.assignee.id === viewer.id
  })
