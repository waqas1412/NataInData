import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase } from '@/lib/supabase'
import { User } from '@supabase/supabase-js'

interface AuthState {
  user: User | null
  isLoading: boolean
  signIn: (email: string, password: string, provider?: string) => Promise<void>
  signUp: (email: string, password: string, provider?: string) => Promise<void>
  signOut: () => Promise<void>
  setUser: (user: User | null) => void
}

const getRedirectUrl = () => {
  // Try to get URL from environment variables
  const redirectUrl = process.env.NEXT_PUBLIC_REDIRECT_URL || window.location.origin
  return `${redirectUrl}/new-chat`
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isLoading: true,
      setUser: (user) => set({ user }),
      signIn: async (email: string, password: string, provider?: string) => {
        try {
          if (provider === 'google') {
            const { error } = await supabase.auth.signInWithOAuth({
              provider: 'google',
              options: {
                redirectTo: getRedirectUrl(),
                queryParams: {
                  access_type: 'offline',
                  prompt: 'consent',
                },
              },
            })
            if (error) throw error
            return
          }

          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          })
          if (error) throw error
          set({ user: data.user })
          window.location.href = '/new-chat'
        } catch (error) {
          throw error
        }
      },
      signUp: async (email: string, password: string, provider?: string) => {
        try {
          if (provider === 'google') {
            const { error } = await supabase.auth.signInWithOAuth({
              provider: 'google',
              options: {
                redirectTo: getRedirectUrl(),
                queryParams: {
                  access_type: 'offline',
                  prompt: 'consent',
                },
              },
            })
            if (error) throw error
            return
          }

          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              emailRedirectTo: getRedirectUrl(),
            },
          })
          if (error) throw error
          set({ user: data.user })
          window.location.href = '/sign-in'
        } catch (error) {
          throw error
        }
      },
      signOut: async () => {
        try {
          const { error } = await supabase.auth.signOut()
          if (error) throw error
          set({ user: null })
          window.location.href = '/sign-in'
        } catch (error) {
          throw error
        }
      },
    }),
    {
      name: 'auth-storage',
    }
  )
) 