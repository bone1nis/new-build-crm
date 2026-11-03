import type { ProfileRow } from '../api/fetchProfile'
import type { SessionState } from './types'

export interface AuthUser {
  id: string
  email: string
}

export interface ResolveInput {
  ready: boolean
  user: AuthUser | null
  profile: { isPending: boolean; isError: boolean; data: ProfileRow | null | undefined }
}

export const resolveSession = ({ ready, user, profile }: ResolveInput): SessionState => {
  if (!ready) return { status: 'loading' }
  if (!user) return { status: 'anonymous' }
  if (profile.isPending) return { status: 'loading' }
  if (profile.isError || !profile.data) return { status: 'error' }

  return {
    status: 'authenticated',
    viewer: {
      id: user.id,
      email: user.email,
      fullName: profile.data.fullName,
      role: profile.data.role,
    },
  }
}
