import { MapPin } from 'lucide-react'
import { Link } from 'react-router'
import type { ObjectItem } from '../../model/types'

export const ObjectCard = ({ object }: { object: ObjectItem }) => (
  <Link
    to={`/objects/${object.id}`}
    className="block rounded-lg border bg-card px-4 py-3 transition-colors hover:bg-accent focus-visible:bg-accent focus-visible:outline-none"
  >
    <p className="truncate font-semibold">{object.name}</p>
    <p className="mt-1 flex items-center gap-1.5 truncate text-sm text-muted-foreground">
      <MapPin className="size-3.5 shrink-0" aria-hidden="true" />
      {object.address}
    </p>
  </Link>
)
