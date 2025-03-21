import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase } from '@/lib/supabase'
import { User } from '@supabase/supabase-js'

interface AuthState {
  user: User | null
  isLoading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  setUser: (user: User | null) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isLoading: true,
      setUser: (user) => set({ user }),
      signIn: async (email: string, password: string) => {
        try {
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
      signUp: async (email: string, password: string) => {
        try {
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              emailRedirectTo: `${window.location.origin}/new-chat`,
            },
          })
          if (error) throw error
          set({ user: data.user })
          sessionStorage.setItem('fromSignUp', 'true')
          window.location.href = '/confirm-email'
        } catch (error) {
          throw error
        }
      },
      signOut: async () => {
        try {
          const { error } = await supabase.auth.signOut()
          if (error) throw error
          set({ user: null })
          sessionStorage.removeItem('fromSignUp')
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