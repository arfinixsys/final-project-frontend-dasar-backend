import { useEffect, useRef } from 'react'
import { useHabitStore } from '@/store/useHabitStore'
import { isDueOn } from '@/lib/recurrence'
import { toDateString } from '@/lib/dateUtils'

const NOTIFIED_KEY = 'ignite-notified-today'

function getNotified(): Set<string> {
  const raw = sessionStorage.getItem(NOTIFIED_KEY)
  return new Set(raw ? JSON.parse(raw) : [])
}

function markNotified(id: string) {
  const set = getNotified()
  set.add(id)
  sessionStorage.setItem(NOTIFIED_KEY, JSON.stringify([...set]))
}

export function useReminder() {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (!('Notification' in window)) return
    if (Notification.permission === 'default') {
      Notification.requestPermission()
    }

    intervalRef.current = setInterval(() => {
      if (Notification.permission !== 'granted') return

      const today = new Date()
      const todayStr = toDateString(today)
      const nowStr = `${String(today.getHours()).padStart(2, '0')}:${String(today.getMinutes()).padStart(2, '0')}`

      const state = useHabitStore.getState()
      const doneIds = new Set(
        state.completions
          .filter((c) => c.date === todayStr)
          .map((c) => c.habitId)
      )
      const notified = getNotified()

      for (const habit of state.habits) {
        if (habit.archivedAt) continue
        if (!habit.reminderTime) continue
        if (habit.reminderTime !== nowStr) continue
        if (doneIds.has(habit.id)) continue
        if (notified.has(habit.id)) continue
        if (!isDueOn(habit, today)) continue

        new Notification('Ignite', {
          body: `${habit.emoji} Time to ${habit.name}`,
        })
        markNotified(habit.id)
      }
    }, 30000)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [])
}
