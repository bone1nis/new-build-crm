import { describe, expect, it } from 'vitest'
import { getAvailableTransitions } from './transitions'
import type { TaskStatus } from './types'

const assignee = { id: 'e1', fullName: 'Иван' }
const executor = { id: 'e1', role: 'executor' as const }
const otherExecutor = { id: 'e2', role: 'executor' as const }
const manager = { id: 'm1', role: 'manager' as const }

const targets = (status: TaskStatus, viewer: { id: string; role: 'manager' | 'executor' }) =>
  getAvailableTransitions({ status, assignee }, viewer).map((transition) => transition.to)

describe('getAvailableTransitions', () => {
  it('назначенный исполнитель берёт новую задачу в работу', () => {
    expect(targets('new', executor)).toEqual(['in_progress'])
  })

  it('назначенный исполнитель отправляет задачу на проверку', () => {
    expect(targets('in_progress', executor)).toEqual(['review'])
  })

  it('постановщик принимает или возвращает задачу на доработку', () => {
    expect(targets('review', manager)).toEqual(['accepted', 'rework'])
  })

  it('возврат на доработку требует комментарий', () => {
    const rework = getAvailableTransitions({ status: 'review', assignee }, manager).find(
      (transition) => transition.to === 'rework',
    )
    expect(rework?.requiresComment).toBe(true)
  })

  it('исполнитель возвращает доработанную задачу в работу', () => {
    expect(targets('rework', executor)).toEqual(['in_progress'])
  })

  it('чужой исполнитель не видит действий', () => {
    expect(targets('new', otherExecutor)).toEqual([])
    expect(targets('in_progress', otherExecutor)).toEqual([])
    expect(targets('rework', otherExecutor)).toEqual([])
  })

  it('постановщик не двигает задачу, пока она у исполнителя', () => {
    expect(targets('new', manager)).toEqual([])
    expect(targets('in_progress', manager)).toEqual([])
    expect(targets('rework', manager)).toEqual([])
  })

  it('исполнитель не принимает задачу', () => {
    expect(targets('review', executor)).toEqual([])
  })

  it('у принятой задачи действий нет', () => {
    expect(targets('accepted', manager)).toEqual([])
    expect(targets('accepted', executor)).toEqual([])
  })
})
