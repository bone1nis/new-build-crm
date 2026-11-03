import { describe, expect, it } from 'vitest'
import { resolveSession } from './resolveSession'

const user = { id: 'u1', email: 'a@b.co' }
const loaded = {
  isPending: false,
  isError: false,
  data: { fullName: 'Анна', role: 'manager' as const },
}

describe('resolveSession', () => {
  it('пока неизвестно, вошёл ли пользователь, - загрузка', () => {
    expect(resolveSession({ ready: false, user: null, profile: loaded }).status).toBe('loading')
  })

  it('без пользователя - анонимный доступ', () => {
    expect(resolveSession({ ready: true, user: null, profile: loaded }).status).toBe('anonymous')
  })

  it('пока грузится профиль - загрузка', () => {
    const profile = { isPending: true, isError: false, data: undefined }
    expect(resolveSession({ ready: true, user, profile }).status).toBe('loading')
  })

  it('вошедший без профиля - ошибка сессии', () => {
    const profile = { isPending: false, isError: false, data: null }
    expect(resolveSession({ ready: true, user, profile }).status).toBe('error')
  })

  it('собирает viewer из пользователя и профиля', () => {
    expect(resolveSession({ ready: true, user, profile: loaded })).toEqual({
      status: 'authenticated',
      viewer: { id: 'u1', email: 'a@b.co', fullName: 'Анна', role: 'manager' },
    })
  })
})
