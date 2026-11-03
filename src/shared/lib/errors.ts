export class AccessDeniedError extends Error {
  constructor() {
    super('access_denied')
    this.name = 'AccessDeniedError'
  }
}

const readString = (source: unknown, key: string): string => {
  if (typeof source !== 'object' || source === null || !(key in source)) return ''
  const value: unknown = Reflect.get(source, key)
  return typeof value === 'string' ? value : ''
}

const MESSAGE_BY_CODE: Record<string, string> = {
  transition_not_allowed: 'Такой переход статуса недоступен',
  comment_required: 'Укажите комментарий',
  forbidden: 'Это действие вам недоступно',
  task_not_found: 'Задача не найдена или недоступна',
  auth_required: 'Нужно войти заново',
  assignee_must_be_executor: 'Исполнителем может быть только пользователь с ролью исполнителя',
}

export const getErrorMessage = (error: unknown): string => {
  if (error instanceof AccessDeniedError) return 'Нет доступа или запись уже изменена'

  const message = readString(error, 'message')
  const known = Object.keys(MESSAGE_BY_CODE).find((code) => message.includes(code))
  if (known) return MESSAGE_BY_CODE[known]

  const code = readString(error, 'code')
  if (code === '42501') return 'Недостаточно прав для этого действия'
  if (code === '23503') return 'Связанная запись не найдена'
  if (/failed to fetch|network/i.test(message)) return 'Нет соединения с сервером'

  return 'Не удалось выполнить действие. Попробуйте ещё раз'
}

export const assertAffected = <T>(rows: T[] | null): T[] => {
  if (!rows || rows.length === 0) throw new AccessDeniedError()
  return rows
}
