import { useMutation } from '@tanstack/react-query'
import { supabase } from '@/shared/api'
import type { LoginValues } from './validation'

export const useLogin = () =>
  useMutation({
    mutationFn: async ({ email, password }: LoginValues) => {
      const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
      if (error) throw error
    },
  })
