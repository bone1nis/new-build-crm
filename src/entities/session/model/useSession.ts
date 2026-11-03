import { useContext } from 'react'
import { SessionContext } from './context'
import type { SessionState } from './types'

export const useSession = (): SessionState => {
  const state = useContext(SessionContext)
  if (!state) throw new Error('useSession должен вызываться внутри SessionProvider')
  return state
}
