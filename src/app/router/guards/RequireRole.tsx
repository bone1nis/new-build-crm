import { Navigate, Outlet } from 'react-router'
import { useSession } from '@/entities/session'
import type { Role } from '@/entities/session'

export const RequireRole = ({ role }: { role: Role }) => {
  const session = useSession()

  if (session.status !== 'authenticated' || session.viewer.role !== role) {
    return <Navigate to="/" replace />
  }
  return <Outlet />
}
