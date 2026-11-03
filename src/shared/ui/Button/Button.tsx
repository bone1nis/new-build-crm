import './Button.scss'
import type { ButtonHTMLAttributes } from 'react'
import { cn } from '@/shared/lib'

export type ButtonVariant = 'primary' | 'ghost' | 'danger' | 'icon'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
}

export const Button = ({
  variant = 'primary',
  className,
  type = 'button',
  ...rest
}: ButtonProps) => (
  <button type={type} className={cn('btn', `btn--${variant}`, className)} {...rest} />
)
