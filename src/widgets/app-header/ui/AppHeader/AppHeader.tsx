import { NavLink } from 'react-router'
import { LogoutButton } from '@/features/auth'
import { ThemeToggle } from '@/features/toggle-theme'
import { ROLE_LABEL, useSession } from '@/entities/session'
import { Badge } from '@/shared/ui'
import { cn } from '@/shared/lib'

const HeaderLink = ({ to, end, label }: { to: string; end?: boolean; label: string }) => (
  <NavLink
    to={to}
    end={end}
    className={({ isActive }) =>
      cn(
        'rounded-md px-3 py-1.5 text-sm font-semibold text-muted-foreground transition-colors hover:bg-accent hover:text-foreground',
        isActive && 'bg-accent text-foreground',
      )
    }
  >
    {label}
  </NavLink>
)

export const AppHeader = () => {
  const session = useSession()
  const viewer = session.status === 'authenticated' ? session.viewer : null

  return (
    <header className="border-b bg-card">
      <div className="mx-auto flex max-w-4xl flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3">
        <span className="text-lg font-bold">Мини-CRM</span>
        <nav aria-label="Основная навигация" className="flex flex-1 gap-1">
          <HeaderLink to="/" end label="Объекты" />
          {viewer?.role === 'executor' && <HeaderLink to="/my-tasks" label="Мои задачи" />}
        </nav>
        <div className="flex items-center gap-2">
          {viewer && (
            <>
              <span className="hidden text-sm sm:inline">{viewer.fullName}</span>
              <Badge variant="secondary">{ROLE_LABEL[viewer.role]}</Badge>
            </>
          )}
          <ThemeToggle />
          <LogoutButton />
        </div>
      </div>
    </header>
  )
}
