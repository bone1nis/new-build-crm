import { supabase } from '@/shared/api'
import type { Executor } from '../model/types'

export const fetchExecutors = async (): Promise<Executor[]> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name')
    .eq('role', 'executor')
    .order('full_name')

  if (error) throw error
  return data.map((row) => ({ id: row.id, fullName: row.full_name }))
}
