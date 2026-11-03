import { useMutation, useQueryClient } from '@tanstack/react-query'
import { taskKeys } from '@/entities/task'
import { supabase } from '@/shared/api'
import { assertAffected } from '@/shared/lib'
import type { TaskValues } from './validation'

export interface SaveTaskInput {
  values: TaskValues
  taskId?: string
}

export const useSaveTask = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ values, taskId }: SaveTaskInput) => {
      const fields = {
        title: values.title,
        description: values.description,
        object_id: values.objectId,
        assignee_id: values.assigneeId,
      }

      if (taskId) {
        const { data, error } = await supabase
          .from('tasks')
          .update(fields)
          .eq('id', taskId)
          .select('id')
        if (error) throw error
        assertAffected(data)
        return
      }

      const { data, error } = await supabase.from('tasks').insert(fields).select('id')
      if (error) throw error
      assertAffected(data)
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: taskKeys.all })
    },
  })
}
