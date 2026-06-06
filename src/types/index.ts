// ── User ──────────────────────────────────────────────────────────────────────
export interface User {
    id: string
    name: string
    email: string
    passwordHash: string
    createdAt: string
}

export interface UserPublic {
    id: string
    name: string
    email: string
    createdAt: string
}

// ── Auth ──────────────────────────────────────────────────────────────────────
export interface AuthTokenPayload {
    userId: string
    email: string
}

// ── Recurrence ────────────────────────────────────────────────────────────────
export type RecurrenceConfig =
    | { type: 'daily' }
    | { type: 'weekdays' }
    | { type: 'weekends' }
    | { type: 'specific_days'; days: number[] }
    | { type: 'every_n_days'; n: number }
    | { type: 'monthly'; dayOfMonth: number }

// ── Habit ─────────────────────────────────────────────────────────────────────
export interface Habit {
    id: string
    userId: string
    name: string
    emoji: string
    color: string
    category: string
    recurrence: RecurrenceConfig
    reminderTime?: string // HH:mm
    createdAt: string
    archivedAt?: string
}

// ── Habit Completion ──────────────────────────────────────────────────────────
export interface HabitCompletion {
    id: string
    habitId: string
    userId: string
    date: string // YYYY-MM-DD
    note?: string
}

// ── Express Request augment ───────────────────────────────────────────────────
import { Request } from 'express'

export interface AuthRequest extends Request {
    userId?: string
    userEmail?: string
}
