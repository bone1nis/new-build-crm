import { useMutation, useQueryClient } from '@tanstack/react-query'
import { objectKeys } from '@/entities/object'
import { taskKeys } from '@/entities/task'
import { supabase } from '@/shared/api'
import { assertAffected } from '@/shared/lib'

export const useDeleteObject = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (objectId: string): Promise<void> => {
      const { data, error } = await supabase
        .from('objects')
        .delete()
        .eq('id', objectId)
        .select('id')
      if (error) throw error
      assertAffected(data)
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: objectKeys.all }),
        queryClient.invalidateQueries({ queryKey: taskKeys.all }),
      ])
    },
  })
}
