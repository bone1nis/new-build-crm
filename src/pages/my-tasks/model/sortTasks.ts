import type { Task } from '@/entities/task'

export const sortTasks = (tasks: Task[]): Task[] => {
  const active = tasks.filter((task) => task.status !== 'accepted')
  const accepted = tasks.filter((task) => task.status === 'accepted')
  return [...active, ...accepted]
}
