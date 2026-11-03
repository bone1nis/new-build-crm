const readString = (source: unknown, key: string): string | undefined => {
  if (typeof source !== 'object' || source === null || !(key in source)) return undefined
  const value: unknown = Reflect.get(source, key)
  return typeof value === 'string' ? value : undefined
}

export const getAuthErrorMessage = (error: unknown): string => {
  const code = readString(error, 'code')
  const name = readString(error, 'name')
  const message = readString(error, 'message') ?? ''

  if (code === 'invalid_credentials') return 'Неверный email или пароль'
  if (code === 'over_request_rate_limit') return 'Слишком много попыток, попробуйте позже'
  if (name === 'AuthRetryableFetchError' || /failed to fetch|network/i.test(message)) {
    return 'Нет соединения с сервером'
  }
  return 'Не удалось войти. Попробуйте ещё раз'
}
