import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { UserPublic } from '@/lib/api'

interface AuthStore {
    token: string | null
    user: UserPublic | null
    isAuthenticated: boolean

    setAuth: (token: string, user: UserPublic) => void
    clearAuth: () => void
    updateUser: (user: UserPublic) => void
}

export const useAuthStore = create<AuthStore>()(
    persist(
        (set) => ({
            token: null,
            user: null,
            isAuthenticated: false,

            setAuth: (token, user) => {
                localStorage.setItem('ignite_token', token)
                set({ token, user, isAuthenticated: true })
            },

            clearAuth: () => {
                localStorage.removeItem('ignite_token')
                set({ token: null, user: null, isAuthenticated: false })
            },

            updateUser: (user) => set({ user }),
        }),
        {
            name: 'ignite-auth',
            // Only persist token + user, not functions
            partialize: (state) => ({
                token: state.token,
                user: state.user,
                isAuthenticated: state.isAuthenticated,
            }),
        }
    )
)
