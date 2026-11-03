export const objectKeys = {
  all: ['objects'] as const,
  list: () => [...objectKeys.all, 'list'] as const,
  detail: (objectId: string) => [...objectKeys.all, 'detail', objectId] as const,
}
