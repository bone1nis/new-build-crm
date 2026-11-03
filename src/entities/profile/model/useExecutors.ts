import { useQuery } from '@tanstack/react-query'
import { fetchExecutors } from '../api/fetchExecutors'
import { profileKeys } from '../api/keys'

export const useExecutors = () =>
  useQuery({ queryKey: profileKeys.executors(), queryFn: fetchExecutors })
