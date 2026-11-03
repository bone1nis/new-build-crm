import type { Enums } from '@/shared/api'

export type TaskStatus = Enums<'task_status'>

export interface TaskPerson {
  id: string
  fullName: string
}

export interface Task {
  id: string
  title: string
  description: string
  status: TaskStatus
  createdAt: string
  object: { id: string; name: string }
  assignee: TaskPerson
  author: TaskPerson
}
