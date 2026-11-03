export const profileKeys = {
  all: ['profiles'] as const,
  executors: () => [...profileKeys.all, 'executors'] as const,
}
