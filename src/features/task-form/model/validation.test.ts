import { describe, expect, it } from 'vitest'
import { taskSchema } from './validation'

const OBJECT_ID = '3f2504e0-4f89-41d3-9a0c-0305e82c3301'
const ASSIGNEE_ID = '9b2f6a7e-1c3d-4e5f-8a9b-0c1d2e3f4a5b'

const issues = (input: Record<string, string>): Record<string, string> => {
  const result = taskSchema.safeParse(input)
  if (result.success) return {}
  return Object.fromEntries(
    result.error.issues.map((issue) => [String(issue.path[0]), issue.message]),
  )
}

describe('taskSchema', () => {
  it('принимает задачу с пустым описанием', () => {
    const result = taskSchema.safeParse({
      title: 'Залить фундамент',
      description: '',
      objectId: OBJECT_ID,
      assigneeId: ASSIGNEE_ID,
    })
    expect(result.success).toBe(true)
  })

  it('обрезает пробелы в названии и описании', () => {
    const result = taskSchema.parse({
      title: '  Закупка  ',
      description: '  текст ',
      objectId: OBJECT_ID,
      assigneeId: ASSIGNEE_ID,
    })
    expect(result.title).toBe('Закупка')
    expect(result.description).toBe('текст')
  })

  it('требует название', () => {
    expect(
      issues({ title: '   ', description: '', objectId: OBJECT_ID, assigneeId: ASSIGNEE_ID }).title,
    ).toBe('Введите название')
  })

  it('требует выбрать исполнителя', () => {
    expect(
      issues({ title: 'x', description: '', objectId: OBJECT_ID, assigneeId: '' }).assigneeId,
    ).toBe('Выберите исполнителя')
  })

  it('требует объект', () => {
    expect(
      issues({ title: 'x', description: '', objectId: '', assigneeId: ASSIGNEE_ID }).objectId,
    ).toBe('Не выбран объект')
  })
})
