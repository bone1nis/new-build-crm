import { describe, expect, it } from 'vitest'
import { objectSchema } from './validation'

const messages = (input: { name: string; address: string }): Record<string, string> => {
  const result = objectSchema.safeParse(input)
  if (result.success) return {}
  return Object.fromEntries(
    result.error.issues.map((issue) => [String(issue.path[0]), issue.message]),
  )
}

describe('objectSchema', () => {
  it('принимает название и адрес', () => {
    expect(
      objectSchema.safeParse({ name: 'ЖК «Северный»', address: 'Москва, ул. Ленина, 12' }).success,
    ).toBe(true)
  })

  it('обрезает пробелы', () => {
    expect(objectSchema.parse({ name: '  Склад ', address: ' Казань ' })).toEqual({
      name: 'Склад',
      address: 'Казань',
    })
  })

  it('требует название и адрес', () => {
    expect(messages({ name: '   ', address: '' })).toEqual({
      name: 'Введите название',
      address: 'Введите адрес',
    })
  })

  it('ограничивает длину', () => {
    expect(messages({ name: 'а'.repeat(201), address: 'б'.repeat(301) })).toEqual({
      name: 'Не более 200 символов',
      address: 'Не более 300 символов',
    })
  })
})
