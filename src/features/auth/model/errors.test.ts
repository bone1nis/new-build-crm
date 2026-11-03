import { describe, expect, it } from 'vitest'
import { getAuthErrorMessage } from './errors'

describe('getAuthErrorMessage', () => {
  it('переводит неверные учётные данные', () => {
    expect(getAuthErrorMessage({ code: 'invalid_credentials' })).toBe('Неверный email или пароль')
  })

  it('переводит ограничение по числу попыток', () => {
    expect(getAuthErrorMessage({ code: 'over_request_rate_limit' })).toBe(
      'Слишком много попыток, попробуйте позже',
    )
  })

  it('распознаёт проблемы с сетью', () => {
    expect(getAuthErrorMessage({ name: 'AuthRetryableFetchError' })).toBe(
      'Нет соединения с сервером',
    )
    expect(getAuthErrorMessage(new TypeError('Failed to fetch'))).toBe('Нет соединения с сервером')
  })

  it('не показывает сырой текст неизвестной ошибки', () => {
    expect(getAuthErrorMessage({ message: 'internal db failure' })).toBe(
      'Не удалось войти. Попробуйте ещё раз',
    )
    expect(getAuthErrorMessage(null)).toBe('Не удалось войти. Попробуйте ещё раз')
  })
})
