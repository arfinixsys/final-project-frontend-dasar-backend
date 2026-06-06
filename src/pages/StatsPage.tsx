import React, { useMemo, useState } from 'react'
import { useHabitStore } from '@/store/useHabitStore'
import {
  calculateStreak,
  calculateConsistencyScore,
  calculateMomentum,
  generateWeeklyInsight,
} from '@/lib/analytics'
import { isDueOn } from '@/lib/recurrence'
import { cn } from '@/lib/utils'
import Heatmap from '@/components/Heatmap'
import FilterSortBar from '@/components/FilterSortBar'
import { MOMENTUM_META } from '@/const/momentum'

const RECURRENCE_FILTERS = [
  { value: 'all' as const, label: 'All types' },
  { value: 'daily' as const, label: 'Daily' },
  { value: 'weekdays' as const, label: 'Weekdays' },
  { value: 'weekends' as const, label: 'Weekends' },
  { value: 'specific_days' as const, label: 'Specific days' },
  { value: 'every_n_days' as const, label: 'Every N days' },
  { value: 'monthly' as const, label: 'Monthly' },
]

type FilterType = (typeof RECURRENCE_FILTERS)[number]['value']

const SORT_OPTIONS = [
  { value: 'consistency' as const, label: 'Consistency' },
  { value: 'streak' as const, label: 'Streak' },
  { value: 'name' as const, label: 'Name' },
]

type SortBy = (typeof SORT_OPTIONS)[number]['value']

export default function StatsPage() {
  const habits = useHabitStore((s) => s.habits)
  const completions = useHabitStore((s) => s.completions)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [filterType, setFilterType] = useState<FilterType>('all')
  const [sortBy, setSortBy] = useState<SortBy>('consistency')

  const today = new Date()
  const activeHabits = habits.filter((h) => !h.archivedAt)

  const overallRate = useMemo(() => {
    let totalDue = 0
    let totalDone = 0
    const doneSet = new Set(completions.map((c) => `${c.habitId}|${c.date}`))

    for (let i = 0; i < 30; i++) {
      const d = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate() - i
      )
      for (const habit of activeHabits) {
        if (isDueOn(habit, d)) {
          totalDue++
          const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
          if (doneSet.has(`${habit.id}|${dateStr}`)) totalDone++
        }
      }
    }

    if (totalDue === 0) return null
    return Math.round((totalDone / totalDue) * 100)
  }, [activeHabits, completions])

  const habitStats = useMemo(() => {
    let list = activeHabits.map((habit) => {
      const { current: streak } = calculateStreak(habit, completions, today)
      const consistency = calculateConsistencyScore(habit, completions, today)
      const momentum = calculateMomentum(habit, completions, today)
      const insight = generateWeeklyInsight(habit, completions, today)
      return { habit, streak, consistency, momentum, insight }
    })

    if (filterType !== 'all') {
      list = list.filter((s) => s.habit.recurrence.type === filterType)
    }

    list.sort((a, b) => {
      switch (sortBy) {
        case 'consistency':
          return b.consistency - a.consistency
        case 'streak':
          return b.streak - a.streak
        case 'name':
          return a.habit.name.localeCompare(b.habit.name)
        default:
          return 0
      }
    })

    return list
  }, [activeHabits, completions, filterType, sortBy])

  return (
    <div className="p-5 pb-24">
      <h1 className="text-2xl md:text-3xl font-bold mb-6">Stats</h1>

      {/* Empty state */}
      {activeHabits.length === 0 ? (
        <p className="text-center text-muted-foreground py-16">
          No habits yet. Add one to see your stats.
        </p>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Overall rate badge */}
            <div className="rounded-2xl bg-card border border-border shadow-sm p-5 flex items-center gap-5">
              <div>
                <div className="text-5xl font-bold leading-none">
                  {overallRate !== null ? `${overallRate}%` : '—'}
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  overall (last 30 days)
                </div>
              </div>
              <div className="flex-1">
                {overallRate !== null && (
                  <div className="h-3 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500 bg-primary"
                      style={{ width: `${overallRate}%` }}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Heatmap */}
            <div className="rounded-2xl bg-card border border-border shadow-sm p-4">
              <p className="text-sm font-semibold mb-3">Activity</p>
              <Heatmap habits={activeHabits} completions={completions} />
            </div>
          </div>

          {/* Per-habit list */}
          <p className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wide text-xs">
            Habits
          </p>
          <FilterSortBar
            filters={RECURRENCE_FILTERS}
            activeFilter={filterType}
            onFilterChange={setFilterType}
            sorts={SORT_OPTIONS}
            activeSort={sortBy}
            onSortChange={setSortBy}
          />
          {habitStats.length === 0 ? (
            <p className="text-center text-muted-foreground py-16">
              No habits match this filter.
            </p>
          ) : (
            <ul className="grid grid-cols-1 gap-3">
              {habitStats.map(
                ({ habit, streak, consistency, momentum, insight }) => {
                  const momentumMeta = MOMENTUM_META[momentum]
                  const isExpanded = expandedId === habit.id

                  return (
                    <li
                      key={habit.id}
                      className="rounded-xl bg-card border border-border shadow-sm overflow-hidden"
                      style={{ borderLeft: `4px solid ${habit.color}` }}
                    >
                      {/* Main row */}
                      <button
                        type="button"
                        className="w-full flex items-center gap-3 p-4 text-left"
                        onClick={() =>
                          setExpandedId(isExpanded ? null : habit.id)
                        }
                        aria-expanded={isExpanded}
                        aria-label={`Toggle insight for ${habit.name}`}
                      >
                        {/* Emoji + nama */}
                        <span className="text-xl shrink-0">{habit.emoji}</span>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">
                            {habit.name}
                          </p>
                          {/* Consistency progress bar */}
                          <div className="mt-1.5 flex items-center gap-2">
                            <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                              <div
                                className="h-full rounded-full transition-all duration-500"
                                style={{
                                  width: `${consistency}%`,
                                  backgroundColor: habit.color,
                                }}
                              />
                            </div>
                            <span className="text-xs text-muted-foreground shrink-0 w-8 text-right">
                              {consistency}%
                            </span>
                          </div>
                        </div>

                        {/* Badges */}
                        <div className="flex items-center gap-2 shrink-0">
                          {streak > 0 && (
                            <span className="text-xs font-semibold">
                              🔥{streak}
                            </span>
                          )}
                          <span
                            className={cn(
                              'text-xs px-2 py-0.5 rounded-full font-medium flex items-center gap-1',
                              momentumMeta.className
                            )}
                          >
                            {momentumMeta.label}{' '}
                            {React.createElement(momentumMeta.arrow, {
                              size: 16,
                            })}
                          </span>
                          {/* Chevron toggle */}
                          <span
                            className={cn(
                              'text-muted-foreground text-xs transition-transform duration-200',
                              isExpanded ? 'rotate-180' : ''
                            )}
                          >
                            ▾
                          </span>
                        </div>
                      </button>

                      {/* Collapsible insight */}
                      {isExpanded && (
                        <div className="px-4 pb-4 pt-0">
                          <p className="text-xs italic text-muted-foreground border-t border-border pt-3">
                            {insight}
                          </p>
                        </div>
                      )}
                    </li>
                  )
                }
              )}
            </ul>
          )}
        </>
      )}
    </div>
  )
}
