import { Navigate, Outlet } from 'react-router'
import { useSession } from '@/entities/session'
import { FullscreenSpinner } from './FullscreenSpinner'

export const GuestOnly = () => {
  const session = useSession()

  if (session.status === 'loading') return <FullscreenSpinner />
  if (session.status === 'authenticated') return <Navigate to="/" replace />
  return <Outlet />
}
