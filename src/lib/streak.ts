import type { Habit } from '@/types/habit.type'
import type { HabitCompletion } from '@/types/habitCompletion.type'
import { isDueOn } from './recurrence'
import { toDateString, getDaysAgo } from './dateUtils'

/**
 * Count consecutive due days (going back from today) that were completed.
 */
export function currentStreak(
  habit: Habit,
  completions: HabitCompletion[]
): number {
  const doneSet = new Set(
    completions.filter((c) => c.habitId === habit.id).map((c) => c.date)
  )

  let streak = 0
  let i = 0

  while (true) {
    const date = getDaysAgo(i)
    if (!isDueOn(habit, date)) {
      i++
      continue
    }
    if (!doneSet.has(toDateString(date))) break
    streak++
    i++
    if (i > 365) break
  }

  return streak
}
