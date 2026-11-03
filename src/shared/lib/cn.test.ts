import { describe, expect, it } from 'vitest'
import { cn } from './cn'

describe('cn', () => {
  it('склеивает классы и отбрасывает пустые значения', () => {
    expect(cn('a', false, null, undefined, 'b')).toBe('a b')
  })
})
