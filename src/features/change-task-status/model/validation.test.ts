import { describe, expect, it } from 'vitest'
import { reworkSchema } from './validation'

describe('reworkSchema', () => {
  it('принимает непустой комментарий и обрезает пробелы', () => {
    const result = reworkSchema.parse({ comment: '  Исправить кладку  ' })
    expect(result.comment).toBe('Исправить кладку')
  })

  it('отклоняет пустой комментарий', () => {
    const result = reworkSchema.safeParse({ comment: '' })
    expect(result.success).toBe(false)
    if (!result.success) expect(result.error.issues[0].message).toBe('Укажите, что нужно исправить')
  })

  it('отклоняет комментарий из одних пробелов', () => {
    expect(reworkSchema.safeParse({ comment: '    ' }).success).toBe(false)
  })
})
