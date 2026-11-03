import { describe, expect, it } from 'vitest'
import type { Task, TaskStatus } from '@/entities/task'
import { sortTasks } from './sortTasks'

const makeTask = (id: string, status: TaskStatus): Task => ({
  id,
  title: id,
  description: '',
  status,
  createdAt: '2026-11-03T10:00:00Z',
  object: { id: 'o1', name: 'Объект' },
  assignee: { id: 'u1', fullName: 'Иван' },
  author: { id: 'm1', fullName: 'Анна' },
})

describe('sortTasks', () => {
  it('ставит принятые задачи в конец', () => {
    const sorted = sortTasks([
      makeTask('a', 'accepted'),
      makeTask('b', 'new'),
      makeTask('c', 'accepted'),
      makeTask('d', 'review'),
    ])
    expect(sorted.map((task) => task.id)).toEqual(['b', 'd', 'a', 'c'])
  })

  it('сохраняет исходный порядок внутри групп', () => {
    const sorted = sortTasks([
      makeTask('1', 'rework'),
      makeTask('2', 'in_progress'),
      makeTask('3', 'new'),
    ])
    expect(sorted.map((task) => task.id)).toEqual(['1', '2', '3'])
  })

  it('не меняет исходный массив', () => {
    const source = [makeTask('a', 'accepted'), makeTask('b', 'new')]
    sortTasks(source)
    expect(source.map((task) => task.id)).toEqual(['a', 'b'])
  })

  it('возвращает пустой массив для пустого списка', () => {
    expect(sortTasks([])).toEqual([])
  })
})
