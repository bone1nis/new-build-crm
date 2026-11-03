import { Loader2 } from 'lucide-react'

export const FullscreenSpinner = () => (
  <div className="grid min-h-screen place-items-center" role="status" aria-label="Загрузка">
    <Loader2 className="size-7 animate-spin text-muted-foreground" />
  </div>
)
