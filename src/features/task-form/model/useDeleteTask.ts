import { useMutation, useQueryClient } from '@tanstack/react-query'
import { taskKeys } from '@/entities/task'
import { supabase } from '@/shared/api'

export const useDeleteTask = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (taskId: string) => {
      const { error } = await supabase.rpc('delete_task', { p_task_id: taskId })
      if (error) throw error
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: taskKeys.all })
    },
  })
}
