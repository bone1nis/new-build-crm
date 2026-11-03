export const sessionKeys = {
  all: ['session'] as const,
  profile: (userId: string) => [...sessionKeys.all, 'profile', userId] as const,
}
