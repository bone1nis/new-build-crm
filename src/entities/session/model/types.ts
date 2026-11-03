import type { Enums } from '@/shared/api'

export type Role = Enums<'user_role'>

export interface Viewer {
  id: string
  email: string
  fullName: string
  role: Role
}

export type SessionState =
  | { status: 'loading' }
  | { status: 'anonymous' }
  | { status: 'error' }
  | { status: 'authenticated'; viewer: Viewer }
