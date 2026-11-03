export const taskKeys = {
  all: ['tasks'] as const,
  list: (objectId: string | null) => [...taskKeys.all, 'list', objectId] as const,
  detail: (taskId: string) => [...taskKeys.all, 'detail', taskId] as const,
  history: (taskId: string) => [...taskKeys.all, 'history', taskId] as const,
}
