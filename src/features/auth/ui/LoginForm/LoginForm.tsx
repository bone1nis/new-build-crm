import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Alert, AlertDescription, Button, TextField } from '@/shared/ui'
import { getAuthErrorMessage } from '../../model/errors'
import { useLogin } from '../../model/useLogin'
import { loginSchema } from '../../model/validation'
import type { LoginValues } from '../../model/validation'

export const LoginForm = () => {
  const login = useLogin()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  return (
    <form
      className="grid gap-4"
      onSubmit={handleSubmit((values) => login.mutate(values))}
      noValidate
    >
      <TextField
        label="Email"
        type="email"
        autoComplete="username"
        error={errors.email?.message}
        {...register('email')}
      />
      <TextField
        label="Пароль"
        type="password"
        autoComplete="current-password"
        error={errors.password?.message}
        {...register('password')}
      />
      {login.isError && (
        <Alert variant="destructive">
          <AlertDescription>{getAuthErrorMessage(login.error)}</AlertDescription>
        </Alert>
      )}
      <Button type="submit" size="lg" disabled={login.isPending}>
        {login.isPending ? 'Входим…' : 'Войти'}
      </Button>
    </form>
  )
}
