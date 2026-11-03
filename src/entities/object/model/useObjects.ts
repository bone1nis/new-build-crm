import { useQuery } from '@tanstack/react-query'
import { fetchObject, fetchObjects } from '../api/fetchObjects'
import { objectKeys } from '../api/keys'

export const useObjects = () => useQuery({ queryKey: objectKeys.list(), queryFn: fetchObjects })

export const useObject = (objectId: string) =>
  useQuery({ queryKey: objectKeys.detail(objectId), queryFn: () => fetchObject(objectId) })
