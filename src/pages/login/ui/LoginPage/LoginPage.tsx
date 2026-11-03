import { LoginForm } from '@/features/auth'
import { ThemeToggle } from '@/features/toggle-theme'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui'

export const LoginPage = () => (
  <main className="relative grid min-h-screen place-items-center p-4">
    <div className="absolute top-4 right-4">
      <ThemeToggle />
    </div>
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl">Вход</CardTitle>
        <CardDescription>Мини-CRM: объекты и задачи</CardDescription>
      </CardHeader>
      <CardContent>
        <LoginForm />
      </CardContent>
    </Card>
  </main>
)
