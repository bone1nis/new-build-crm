import { Inbox } from 'lucide-react'
import { EmptyState } from '@/shared/ui'

export const ObjectsPage = () => (
  <EmptyState
    icon={<Inbox />}
    title="Объекты"
    description="Список объектов появится на следующем этапе."
  />
)
