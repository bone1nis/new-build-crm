import type { QueryData } from '@supabase/supabase-js'
import { supabase } from '@/shared/api'
import type { Task } from '../model/types'

const TASK_SELECT = `
  id, title, description, status, created_at,
  object:objects!tasks_object_id_fkey(id, name),
  assignee:profiles!tasks_assignee_id_fkey(id, full_name),
  author:profiles!tasks_author_id_fkey(id, full_name)
`

const tasksQuery = () => supabase.from('tasks').select(TASK_SELECT)

type TaskRow = QueryData<ReturnType<typeof tasksQuery>>[number]

const toTask = (row: TaskRow): Task => ({
  id: row.id,
  title: row.title,
  description: row.description,
  status: row.status,
  createdAt: row.created_at,
  object: { id: row.object.id, name: row.object.name },
  assignee: { id: row.assignee.id, fullName: row.assignee.full_name },
  author: { id: row.author.id, fullName: row.author.full_name },
})

export const fetchTasks = async (objectId: string | null): Promise<Task[]> => {
  const query = tasksQuery().order('created_at', { ascending: false })
  const { data, error } = await (objectId ? query.eq('object_id', objectId) : query)

  if (error) throw error
  return data.map(toTask)
}

export const fetchTask = async (taskId: string): Promise<Task | null> => {
  const { data, error } = await tasksQuery().eq('id', taskId).maybeSingle()

  if (error) throw error
  return data ? toTask(data) : null
}
