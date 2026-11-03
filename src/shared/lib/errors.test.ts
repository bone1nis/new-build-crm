import { describe, expect, it } from 'vitest'
import { AccessDeniedError, assertAffected, getErrorMessage } from './errors'

describe('getErrorMessage', () => {
  it('переводит коды RPC', () => {
    expect(getErrorMessage({ message: 'transition_not_allowed' })).toBe(
      'Такой переход статуса недоступен',
    )
    expect(getErrorMessage({ message: 'comment_required' })).toBe('Укажите комментарий')
    expect(getErrorMessage({ message: 'forbidden' })).toBe('Это действие вам недоступно')
    expect(getErrorMessage({ message: 'object_not_found' })).toBe('Объект не найден или уже удалён')
  })

  it('понимает отсутствие прав и пустой результат RLS', () => {
    expect(getErrorMessage({ code: '42501', message: 'permission denied' })).toBe(
      'Недостаточно прав для этого действия',
    )
    expect(getErrorMessage(new AccessDeniedError())).toBe('Нет доступа или запись уже изменена')
  })

  it('не показывает сырой текст неизвестной ошибки', () => {
    expect(getErrorMessage({ message: 'relation "x" does not exist' })).toBe(
      'Не удалось выполнить действие. Попробуйте ещё раз',
    )
    expect(getErrorMessage(undefined)).toBe('Не удалось выполнить действие. Попробуйте ещё раз')
  })
})

describe('assertAffected', () => {
  it('возвращает изменённые строки', () => {
    expect(assertAffected([{ id: 1 }])).toEqual([{ id: 1 }])
  })

  it('считает пустой ответ отсутствием доступа', () => {
    expect(() => assertAffected([])).toThrow(AccessDeniedError)
    expect(() => assertAffected(null)).toThrow(AccessDeniedError)
  })
})
