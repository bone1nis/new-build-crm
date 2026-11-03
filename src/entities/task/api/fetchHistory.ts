import { supabase } from '@/shared/api'
import type { TaskHistoryEntry } from '../model/types'

export const fetchTaskHistory = async (taskId: string): Promise<TaskHistoryEntry[]> => {
  const { data, error } = await supabase
    .from('task_status_history')
    .select(
      'id, from_status, to_status, comment, created_at, changed_by:profiles!task_status_history_changed_by_fkey(id, full_name)',
    )
    .eq('task_id', taskId)
    .order('created_at', { ascending: true })
    .order('id', { ascending: true })

  if (error) throw error
  return data.map((row) => ({
    id: row.id,
    fromStatus: row.from_status,
    toStatus: row.to_status,
    comment: row.comment,
    createdAt: row.created_at,
    changedBy: { id: row.changed_by.id, fullName: row.changed_by.full_name },
  }))
}
