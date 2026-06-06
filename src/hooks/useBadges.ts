import { useMemo } from 'react'
import { useHabitStore } from '@/store/useHabitStore'
import { BADGES, type Badge } from '@/const/badges'
import {
  calculateStreak,
  calculateConsistencyScore,
  calculateMomentum,
} from '@/lib/analytics'
import { isDueOn } from '@/lib/recurrence'
import { toDateString } from '@/lib/dateUtils'

export function useBadges() {
  const habits = useHabitStore((s) => s.habits)
  const completions = useHabitStore((s) => s.completions)

  return useMemo(() => {
    const today = new Date()
    const todayStr = toDateString(today)
    const active = habits.filter((h) => !h.archivedAt)

    let maxStreak = 0
    let maxLongestStreak = 0
    let maxConsistency = 0
    let hasRising = false
    const categories = new Set(active.map((h) => h.category))

    for (const habit of active) {
      const { current, longest } = calculateStreak(habit, completions, today)
      const consistency = calculateConsistencyScore(habit, completions, today)
      const momentum = calculateMomentum(habit, completions, today)

      if (current > maxStreak) maxStreak = current
      if (longest > maxLongestStreak) maxLongestStreak = longest
      if (consistency > maxConsistency) maxConsistency = consistency
      if (momentum === 'rising') hasRising = true
    }

    const dueToday = active.filter((h) => isDueOn(h, today))
    const doneToday = completions.filter((c) => c.date === todayStr)
    const doneIds = new Set(doneToday.map((c) => c.habitId))
    const allDoneToday =
      dueToday.length > 0 && dueToday.every((h) => doneIds.has(h.id))

    const ctx = {
      activeCount: active.length,
      totalCompletions: completions.length,
      maxStreak,
      maxLongestStreak,
      categories,
      maxConsistency,
      hasRising,
      allDoneToday,
    }

    const earned: Badge[] = []
    const locked: Badge[] = []

    for (const badge of BADGES) {
      if (badge.check(ctx)) earned.push(badge)
      else locked.push(badge)
    }

    return { earned, locked, total: BADGES.length, earnedCount: earned.length }
  }, [habits, completions])
}
