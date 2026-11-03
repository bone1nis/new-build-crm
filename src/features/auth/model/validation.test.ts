import { describe, expect, it } from 'vitest'
import { loginSchema } from './validation'

const messages = (input: { email: string; password: string }): Record<string, string> => {
  const result = loginSchema.safeParse(input)
  if (result.success) return {}
  return Object.fromEntries(
    result.error.issues.map((issue) => [String(issue.path[0]), issue.message]),
  )
}

describe('loginSchema', () => {
  it('принимает корректные email и пароль', () => {
    expect(loginSchema.safeParse({ email: 'manager@test.com', password: '123123' }).success).toBe(
      true,
    )
  })

  it('обрезает пробелы в email', () => {
    const result = loginSchema.parse({ email: '  manager@test.com ', password: 'x' })
    expect(result.email).toBe('manager@test.com')
  })

  it('требует email и пароль', () => {
    expect(messages({ email: '  ', password: '' })).toEqual({
      email: 'Введите email',
      password: 'Введите пароль',
    })
  })

  it('отклоняет email без домена', () => {
    expect(messages({ email: 'manager@test', password: 'x' }).email).toBe('Некорректный email')
  })
})
