import { useMutation, useQueryClient } from '@tanstack/react-query'
import { OBJECT_SELECT, objectKeys, toObjectItem } from '@/entities/object'
import type { ObjectItem } from '@/entities/object'
import { taskKeys } from '@/entities/task'
import { supabase } from '@/shared/api'
import { assertAffected } from '@/shared/lib'
import type { ObjectValues } from './validation'

export const useSaveObject = (object?: ObjectItem) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (values: ObjectValues): Promise<ObjectItem> => {
      const request = object
        ? supabase.from('objects').update(values).eq('id', object.id).select(OBJECT_SELECT)
        : supabase.from('objects').insert(values).select(OBJECT_SELECT)

      const { data, error } = await request
      if (error) throw error
      return toObjectItem(assertAffected(data)[0])
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: objectKeys.all }),
        queryClient.invalidateQueries({ queryKey: taskKeys.all }),
      ])
    },
  })
}
