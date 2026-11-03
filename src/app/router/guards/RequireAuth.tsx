import { Navigate, Outlet } from 'react-router'
import { useSession } from '@/entities/session'
import { LogoutButton } from '@/features/auth'
import { FullscreenSpinner } from './FullscreenSpinner'

export const RequireAuth = () => {
  const session = useSession()

  if (session.status === 'loading') return <FullscreenSpinner />
  if (session.status === 'anonymous') return <Navigate to="/login" replace />
  if (session.status === 'error') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-4 text-center">
        <p>Не удалось загрузить профиль. Выйдите и войдите снова.</p>
        <LogoutButton />
      </div>
    )
  }
  return <Outlet />
}
