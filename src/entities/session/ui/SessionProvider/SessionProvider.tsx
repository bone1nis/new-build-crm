import { skipToken, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { supabase } from '@/shared/api'
import { fetchProfile } from '../../api/fetchProfile'
import { sessionKeys } from '../../api/keys'
import { SessionContext } from '../../model/context'
import { resolveSession } from '../../model/resolveSession'
import type { AuthUser } from '../../model/resolveSession'

interface AuthState {
  ready: boolean
  user: AuthUser | null
}

export const SessionProvider = ({ children }: { children: ReactNode }) => {
  const queryClient = useQueryClient()
  const [auth, setAuth] = useState<AuthState>({ ready: false, user: null })

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') queryClient.clear()

      const user = session ? { id: session.user.id, email: session.user.email ?? '' } : null
      setAuth((prev) =>
        prev.ready && prev.user?.id === user?.id && prev.user?.email === user?.email
          ? prev
          : { ready: true, user },
      )
    })
    return () => data.subscription.unsubscribe()
  }, [queryClient])

  const userId = auth.user?.id
  const profile = useQuery({
    queryKey: sessionKeys.profile(userId ?? ''),
    queryFn: userId ? () => fetchProfile(userId) : skipToken,
  })

  const state = useMemo(
    () =>
      resolveSession({
        ready: auth.ready,
        user: auth.user,
        profile: { isPending: profile.isPending, isError: profile.isError, data: profile.data },
      }),
    [auth, profile.isPending, profile.isError, profile.data],
  )

  return <SessionContext.Provider value={state}>{children}</SessionContext.Provider>
}
