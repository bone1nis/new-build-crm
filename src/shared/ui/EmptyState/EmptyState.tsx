import type { ReactNode } from 'react'

export interface EmptyStateProps {
  title: string
  description: string
  icon?: ReactNode
}

export const EmptyState = ({ title, description, icon }: EmptyStateProps) => (
  <div className="flex flex-col items-center gap-2 px-4 py-10 text-center">
    {icon && (
      <div
        aria-hidden="true"
        className="mb-1 grid size-13 place-items-center rounded-full bg-muted text-muted-foreground [&_svg]:size-6"
      >
        {icon}
      </div>
    )}
    <h2 className="text-lg font-semibold">{title}</h2>
    <p className="text-sm text-muted-foreground">{description}</p>
  </div>
)
