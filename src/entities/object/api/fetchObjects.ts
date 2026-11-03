import { supabase } from '@/shared/api'
import type { ObjectItem } from '../model/types'

export const OBJECT_SELECT = 'id, name, address, created_at'

interface ObjectRow {
  id: string
  name: string
  address: string
  created_at: string
}

export const toObjectItem = (row: ObjectRow): ObjectItem => ({
  id: row.id,
  name: row.name,
  address: row.address,
  createdAt: row.created_at,
})

export const fetchObjects = async (): Promise<ObjectItem[]> => {
  const { data, error } = await supabase
    .from('objects')
    .select(OBJECT_SELECT)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data.map(toObjectItem)
}

export const fetchObject = async (objectId: string): Promise<ObjectItem | null> => {
  const { data, error } = await supabase
    .from('objects')
    .select(OBJECT_SELECT)
    .eq('id', objectId)
    .maybeSingle()

  if (error) throw error
  return data ? toObjectItem(data) : null
}
