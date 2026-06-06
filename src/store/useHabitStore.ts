import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { nanoid } from 'nanoid'
import type { Habit } from '@/types/habit.type'
import type { HabitCompletion } from '@/types/habitCompletion.type'

interface HabitStore {
  habits: Habit[]
  completions: HabitCompletion[]
  addHabit: (habit: Omit<Habit, 'id' | 'createdAt'>) => void
  updateHabit: (id: string, updates: Partial<Omit<Habit, 'id'>>) => void
  archiveHabit: (id: string) => void
  deleteHabit: (id: string) => void
  toggleCompletion: (habitId: string, date: string) => void
  updateCompletionNote: (habitId: string, date: string, note: string) => void
}

export const useHabitStore = create<HabitStore>()(
  persist(
    (set, get) => ({
      habits: [],
      completions: [],

      addHabit: (habit) =>
        set((s) => ({
          habits: [
            ...s.habits,
            { ...habit, id: nanoid(), createdAt: new Date().toISOString() },
          ],
        })),

      updateHabit: (id, updates) =>
        set((s) => ({
          habits: s.habits.map((h) => (h.id === id ? { ...h, ...updates } : h)),
        })),

      archiveHabit: (id) =>
        set((s) => ({
          habits: s.habits.map((h) =>
            h.id === id ? { ...h, archivedAt: new Date().toISOString() } : h
          ),
        })),

      deleteHabit: (id) =>
        set((s) => ({
          habits: s.habits.filter((h) => h.id !== id),
          completions: s.completions.filter((c) => c.habitId !== id),
        })),

      toggleCompletion: (habitId, date) => {
        const existing = get().completions.find(
          (c) => c.habitId === habitId && c.date === date
        )
        set((s) => ({
          completions: existing
            ? s.completions.filter((c) => c.id !== existing.id)
            : [...s.completions, { id: nanoid(), habitId, date }],
        }))
      },

      updateCompletionNote: (habitId, date, note) =>
        set((s) => ({
          completions: s.completions.map((c) =>
            c.habitId === habitId && c.date === date ? { ...c, note } : c
          ),
        })),
    }),
    { name: 'ignite-habits' }
  )
)
