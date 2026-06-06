import type { Habit } from '@/types/habit.type'
import type { HabitCompletion } from '@/types/habitCompletion.type'
import type { MomentumStatus } from '@/types/momentum.type'
import type { BreakRisk } from '@/types/breakRisk.type.ts'
import { isDueOn } from './recurrence'
import { parseDate, toDateString, getDateRange } from './dateUtils'
import { DAY_NAMES } from '@/const/dayLabels'

const doneSet = (
  habitId: string,
  completions: HabitCompletion[]
): Set<string> => {
  return new Set(
    completions.filter((c) => c.habitId === habitId).map((c) => c.date)
  )
}

const completionRate = (
  habit: Habit,
  completions: HabitCompletion[],
  dates: Date[]
): number => {
  const done = doneSet(habit.id, completions)
  const due = dates.filter((d) => isDueOn(habit, d))
  if (due.length === 0) return 0
  return due.filter((d) => done.has(toDateString(d))).length / due.length
}

export const calculateStreak = (
  habit: Habit,
  completions: HabitCompletion[],
  today: Date
): { current: number; longest: number } => {
  const done = doneSet(habit.id, completions)
  const start = parseDate(habit.createdAt.slice(0, 10))
  const allDue = getDateRange(start, today).filter((d) => isDueOn(habit, d))

  let current = 0
  for (let i = allDue.length - 1; i >= 0; i--) {
    if (done.has(toDateString(allDue[i]))) current++
    else break
  }

  let longest = 0
  let run = 0
  for (const d of allDue) {
    if (done.has(toDateString(d))) {
      run++
      longest = Math.max(longest, run)
    } else run = 0
  }

  return { current, longest }
}

export const calculateConsistencyScore = (
  habit: Habit,
  completions: HabitCompletion[],
  today: Date
): number => {
  const done = doneSet(habit.id, completions)

  // Collect due dates in last 30 calendar days, oldest → newest
  const dueDates: Date[] = []
  for (let i = 29; i >= 0; i--) {
    const d = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() - i
    )
    if (isDueOn(habit, d)) dueDates.push(d)
  }

  if (dueDates.length === 0) return 0

  // Weight by position in due-date list: oldest = weight 1, newest = weight N
  let weightedDone = 0
  let weightedTotal = 0
  dueDates.forEach((d, idx) => {
    const weight = idx + 1
    weightedTotal += weight
    if (done.has(toDateString(d))) weightedDone += weight
  })

  return Math.round((weightedDone / weightedTotal) * 100)
}

export const calculateMomentum = (
  habit: Habit,
  completions: HabitCompletion[],
  today: Date
): MomentumStatus => {
  const daysAgo = (n: number) =>
    new Date(today.getFullYear(), today.getMonth(), today.getDate() - n)

  // recent: yesterday (1) to 7 days ago
  const recentDates = Array.from({ length: 7 }, (_, i) => daysAgo(i + 1))
  // prev: 8 to 14 days ago
  const prevDates = Array.from({ length: 7 }, (_, i) => daysAgo(i + 8))

  const recentRate = completionRate(habit, completions, recentDates)
  const prevRate = completionRate(habit, completions, prevDates)

  if (recentRate > prevRate + 0.1) return 'rising'
  if (recentRate < prevRate - 0.1) return 'falling'
  return 'steady'
}

export const calculateBreakRisk = (
  habit: Habit,
  completions: HabitCompletion[],
  today: Date
): BreakRisk => {
  const done = doneSet(habit.id, completions)
  const todayStr = toDateString(today)

  // Factor 1: today done (reduces risk)
  const todayDone = isDueOn(habit, today) && done.has(todayStr) ? 1 : 0

  // Factor 2: completion rate last 7 days (excluding today)
  const last7 = Array.from(
    { length: 7 },
    (_, i) =>
      new Date(today.getFullYear(), today.getMonth(), today.getDate() - i - 1)
  )
  const rate7 = completionRate(habit, completions, last7)

  // Factor 3: historical rate for same day-of-week as tomorrow
  const tomorrow = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate() + 1
  )
  const tomorrowDow = tomorrow.getDay()
  const start = parseDate(habit.createdAt.slice(0, 10))
  const allDates = getDateRange(start, today)
  const sameDow = allDates.filter(
    (d) => d.getDay() === tomorrowDow && isDueOn(habit, d)
  )
  const dowRate =
    sameDow.length === 0
      ? 0.5
      : sameDow.filter((d) => done.has(toDateString(d))).length / sameDow.length

  // Combine: higher score = higher risk
  const score =
    (1 - rate7) * 0.5 + (1 - dowRate) * 0.35 + (todayDone ? -0.15 : 0.15)
  const clamped = Math.max(0, Math.min(1, score))

  if (clamped < 0.35) return 'low'
  if (clamped < 0.65) return 'medium'
  return 'high'
}

export const getBestDayOfWeek = (
  habit: Habit,
  completions: HabitCompletion[]
): string | null => {
  const done = doneSet(habit.id, completions)
  const start = parseDate(habit.createdAt.slice(0, 10))
  const allDates = getDateRange(start, new Date())

  const dueCounts = new Array(7).fill(0)
  const doneCounts = new Array(7).fill(0)

  for (const d of allDates) {
    if (!isDueOn(habit, d)) continue
    const dow = d.getDay()
    dueCounts[dow]++
    if (done.has(toDateString(d))) doneCounts[dow]++
  }

  let bestDow = -1
  let bestRate = -1
  for (let i = 0; i < 7; i++) {
    if (dueCounts[i] < 3) continue
    const rate = doneCounts[i] / dueCounts[i]
    if (rate > bestRate) {
      bestRate = rate
      bestDow = i
    }
  }

  return bestDow === -1 ? null : DAY_NAMES[bestDow]
}

export const calculateHabitCorrelation = (
  habitA: Habit,
  habitB: Habit,
  completions: HabitCompletion[]
): number => {
  const doneA = doneSet(habitA.id, completions)
  const doneB = doneSet(habitB.id, completions)

  const union = new Set([...doneA, ...doneB])
  if (union.size === 0) return 0

  let intersection = 0
  for (const d of doneA) if (doneB.has(d)) intersection++

  return intersection / union.size
}

export const getCorrelatedHabits = (
  habit: Habit,
  allHabits: Habit[],
  completions: HabitCompletion[]
): { habit: Habit; score: number }[] => {
  return allHabits
    .filter((h) => h.id !== habit.id && !h.archivedAt)
    .map((h) => ({
      habit: h,
      score: calculateHabitCorrelation(habit, h, completions),
    }))
    .filter(({ score }) => score > 0.4)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
}

export const generateWeeklyInsight = (
  habit: Habit,
  completions: HabitCompletion[],
  today: Date
): string => {
  const { current: streak } = calculateStreak(habit, completions, today)
  const momentum = calculateMomentum(habit, completions, today)
  const score = calculateConsistencyScore(habit, completions, today)
  const bestDay = getBestDayOfWeek(habit, completions)

  if (streak > 7 && momentum === 'rising')
    return `You're on a ${streak}-day streak and getting stronger!`
  if (streak > 7 && momentum === 'steady')
    return `Strong ${streak}-day streak — keep the consistency.`
  if (momentum === 'rising' && score > 70)
    return `Great momentum this week with ${score}% consistency.`
  if (momentum === 'falling' && score < 40)
    return `Consistency dipped to ${score}% — time to refocus.`
  if (bestDay) return `You tend to do best on ${bestDay}s.`
  return `Complete today's habit to build your streak.`
}
