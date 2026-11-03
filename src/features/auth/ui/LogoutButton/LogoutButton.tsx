import { Button } from '@/shared/ui'
import { useLogout } from '../../model/useLogout'

export const LogoutButton = () => {
  const logout = useLogout()

  return (
    <Button variant="outline" size="sm" disabled={logout.isPending} onClick={() => logout.mutate()}>
      Выйти
    </Button>
  )
}
