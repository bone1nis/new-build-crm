import { supabase } from '@/shared/api'
import type { Role } from '../model/types'

export interface ProfileRow {
  fullName: string
  role: Role
}

export const fetchProfile = async (userId: string): Promise<ProfileRow | null> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('full_name, role')
    .eq('id', userId)
    .maybeSingle()

  if (error) throw error
  return data ? { fullName: data.full_name, role: data.role } : null
}
