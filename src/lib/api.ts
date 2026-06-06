/**
 * API client — thin wrapper around fetch that handles base URL, auth headers,
 * and JSON parsing. All methods throw on non-2xx responses.
 */

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api'

function getToken(): string | null {
    return localStorage.getItem('ignite_token')
}

async function request<T>(
    path: string,
    options: RequestInit = {}
): Promise<T> {
    const token = getToken()

    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string>),
    }

    if (token) {
        headers['Authorization'] = `Bearer ${token}`
    }

    const res = await fetch(`${BASE_URL}${path}`, {
        ...options,
        headers,
    })

    const data = await res.json().catch(() => ({}))

    if (!res.ok) {
        const message =
            (data as { message?: string }).message ?? `Request failed: ${res.status}`
        throw new Error(message)
    }

    return data as T
}

// ── Auth ──────────────────────────────────────────────────────────────────────
export interface AuthResponse {
    message: string
    token: string
    user: UserPublic
}

export interface UserPublic {
    id: string
    name: string
    email: string
    createdAt: string
}

export const authApi = {
    register: (name: string, email: string, password: string) =>
        request<AuthResponse>('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ name, email, password }),
        }),

    login: (email: string, password: string) =>
        request<AuthResponse>('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        }),

    me: () => request<UserPublic>('/auth/me'),

    updateProfile: (data: {
        name?: string
        email?: string
        currentPassword?: string
        newPassword?: string
    }) =>
        request<{ message: string; user: UserPublic }>('/auth/profile', {
            method: 'PUT',
            body: JSON.stringify(data),
        }),
}

// ── Habits ────────────────────────────────────────────────────────────────────
import type { Habit } from '@/types/habit.type'

export const habitsApi = {
    getAll: () => request<Habit[]>('/habits'),

    create: (habit: Omit<Habit, 'id' | 'createdAt' | 'userId'>) =>
        request<Habit>('/habits', {
            method: 'POST',
            body: JSON.stringify(habit),
        }),

    update: (id: string, updates: Partial<Omit<Habit, 'id'>>) =>
        request<Habit>(`/habits/${id}`, {
            method: 'PUT',
            body: JSON.stringify(updates),
        }),

    archive: (id: string) =>
        request<Habit>(`/habits/${id}/archive`, { method: 'PATCH' }),

    unarchive: (id: string) =>
        request<Habit>(`/habits/${id}/unarchive`, { method: 'PATCH' }),

    delete: (id: string) =>
        request<{ message: string }>(`/habits/${id}`, { method: 'DELETE' }),
}

// ── Completions ───────────────────────────────────────────────────────────────
import type { HabitCompletion } from '@/types/habitCompletion.type'

export const completionsApi = {
    getAll: () => request<HabitCompletion[]>('/completions'),

    toggle: (habitId: string, date: string) =>
        request<{ action: 'added' | 'removed'; completion?: HabitCompletion; date?: string; habitId?: string }>(
            '/completions/toggle',
            {
                method: 'POST',
                body: JSON.stringify({ habitId, date }),
            }
        ),

    updateNote: (habitId: string, date: string, note: string) =>
        request<HabitCompletion>('/completions/note', {
            method: 'PUT',
            body: JSON.stringify({ habitId, date, note }),
        }),
}
