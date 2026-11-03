import { useMutation, useQueryClient } from '@tanstack/react-query'
import { objectKeys } from '@/entities/object'
import { taskKeys } from '@/entities/task'
import { supabase } from '@/shared/api'

export const useDeleteObject = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (objectId: string): Promise<void> => {
      const { error } = await supabase.rpc('delete_object', { p_object_id: objectId })
      if (error) throw error
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: objectKeys.all }),
        queryClient.invalidateQueries({ queryKey: taskKeys.all }),
      ])
    },
  })
}
