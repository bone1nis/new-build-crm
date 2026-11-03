import { useMutation, useQueryClient } from '@tanstack/react-query'
import { taskKeys } from '@/entities/task'
import { supabase } from '@/shared/api'
import { assertAffected } from '@/shared/lib'

export const useDeleteTask = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (taskId: string) => {
      const { data, error } = await supabase.from('tasks').delete().eq('id', taskId).select('id')
      if (error) throw error
      assertAffected(data)
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: taskKeys.all })
    },
  })
}
