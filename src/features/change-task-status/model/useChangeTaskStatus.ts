import { useMutation, useQueryClient } from '@tanstack/react-query'
import { taskKeys } from '@/entities/task'
import type { TaskStatus } from '@/entities/task'
import { supabase } from '@/shared/api'

export interface ChangeTaskStatusInput {
  taskId: string
  toStatus: TaskStatus
  comment?: string
}

export const useChangeTaskStatus = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ taskId, toStatus, comment }: ChangeTaskStatusInput) => {
      const { error } = await supabase.rpc('change_task_status', {
        p_task_id: taskId,
        p_to_status: toStatus,
        p_comment: comment,
      })
      if (error) throw error
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: taskKeys.all })
    },
  })
}
