import { Outlet } from 'react-router'
import { AppHeader } from '@/widgets/app-header'

export const AppLayout = () => (
  <div className="min-h-screen">
    <AppHeader />
    <main className="mx-auto max-w-4xl px-4 py-6">
      <Outlet />
    </main>
  </div>
)
