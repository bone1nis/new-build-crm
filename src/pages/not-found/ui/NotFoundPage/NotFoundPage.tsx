import { Link } from 'react-router'
import { Button, EmptyState } from '@/shared/ui'

export const NotFoundPage = () => (
  <main className="flex flex-col items-center px-4 py-12">
    <EmptyState
      title="Страница не найдена"
      description="Такого адреса нет. Вернитесь к списку объектов."
    />
    <Button asChild variant="link">
      <Link to="/">К объектам</Link>
    </Button>
  </main>
)
