import { useQuery } from '@tanstack/react-query'
import { fetchTaskHistory } from '../api/fetchHistory'
import { fetchTask, fetchTasks } from '../api/fetchTasks'
import { taskKeys } from '../api/keys'

export const useTasks = (objectId: string | null = null) =>
  useQuery({ queryKey: taskKeys.list(objectId), queryFn: () => fetchTasks(objectId) })

export const useTask = (taskId: string) =>
  useQuery({ queryKey: taskKeys.detail(taskId), queryFn: () => fetchTask(taskId) })

export const useTaskHistory = (taskId: string) =>
  useQuery({ queryKey: taskKeys.history(taskId), queryFn: () => fetchTaskHistory(taskId) })
