import { useId } from 'react'
import type { ComponentProps } from 'react'
import { Input } from '../input'
import { Label } from '../label'

export interface TextFieldProps extends Omit<ComponentProps<typeof Input>, 'id'> {
  label: string
  error?: string
}

export const TextField = ({ label, error, ...rest }: TextFieldProps) => {
  const id = useId()
  const errorId = `${id}-error`

  return (
    <div className="grid gap-2">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        {...rest}
      />
      {error && (
        <p id={errorId} role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  )
}
