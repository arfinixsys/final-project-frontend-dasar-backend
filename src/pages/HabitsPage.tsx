import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useHabitStore } from '@/store/useHabitStore'
import type { Habit } from '@/types/habit.type'
import HabitForm from '@/components/HabitForm'
import FilterSortBar from '@/components/FilterSortBar'
import { recurrenceSummary } from '@/lib/recurrenceSummary'
import { currentStreak } from '@/lib/streak'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { ArchiveDialog } from '@/components/ArchiveHabitDialog'
import { DeleteHabitDialog } from '@/components/DeleteHabitDialog'

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
  { value: 'streak' as const, label: 'Streak' },
  { value: 'name' as const, label: 'Name' },
  { value: 'newest' as const, label: 'Newest' },
]

type SortBy = (typeof SORT_OPTIONS)[number]['value']

export default function HabitsPage() {
  const navigate = useNavigate()
  const habits = useHabitStore((s) => s.habits)
  const completions = useHabitStore((s) => s.completions)
  const archiveHabit = useHabitStore((s) => s.archiveHabit)
  const deleteHabit = useHabitStore((s) => s.deleteHabit)

  const [habitFormOpen, setHabitFormOpen] = useState(false)
  const [editHabit, setEditHabit] = useState<Habit | undefined>()
  const [archiveHabitTarget, setArchiveHabitTarget] = useState<string | null>(
    null
  )
  const [deleteHabitTarget, setDeleteHabitTarget] = useState<string | null>(
    null
  )
  const [filterType, setFilterType] = useState<FilterType>('all')
  const [sortBy, setSortBy] = useState<SortBy>('streak')

  const hasAnyActive = habits.some((h) => !h.archivedAt)

  const streakCache = useMemo(() => {
    const map = new Map<string, number>()
    for (const h of habits) map.set(h.id, currentStreak(h, completions))
    return map
  }, [habits, completions])

  const active = useMemo(() => {
    let list = habits.filter((h) => !h.archivedAt)

    if (filterType !== 'all') {
      list = list.filter((h) => h.recurrence.type === filterType)
    }

    list.sort((a, b) => {
      switch (sortBy) {
        case 'streak':
          return (streakCache.get(b.id) ?? 0) - (streakCache.get(a.id) ?? 0)
        case 'name':
          return a.name.localeCompare(b.name)
        case 'newest':
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )
        default:
          return 0
      }
    })

    return list
  }, [habits, filterType, sortBy, streakCache])

  function openEditHabitForm(habit: Habit) {
    setEditHabit(habit)
    setHabitFormOpen(true)
  }

  function closeHabitForm() {
    setHabitFormOpen(false)
    setEditHabit(undefined)
  }

  return (
    <div className="p-5 pb-24">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl md:text-3xl font-bold">Habits</h1>
        <Button
          onClick={() => setHabitFormOpen(true)}
          className="hidden md:flex items-center gap-2"
        >
          <span>+</span> Add Habit
        </Button>
      </div>

      <FilterSortBar
        filters={RECURRENCE_FILTERS}
        activeFilter={filterType}
        onFilterChange={setFilterType}
        sorts={SORT_OPTIONS}
        activeSort={sortBy}
        onSortChange={setSortBy}
      />

      {/* Empty state */}
      {active.length === 0 ? (
        <p className="text-center text-muted-foreground py-16">
          {hasAnyActive
            ? 'No habits match this filter.'
            : 'No habits yet. Tap + to add one.'}
        </p>
      ) : (
        <ul className="grid grid-cols-1 gap-3">
          {active.map((habit) => {
            const streak = currentStreak(habit, completions)
            return (
              <li
                key={habit.id}
                className="flex items-center gap-3 rounded-xl p-4 bg-card border border-border shadow-sm cursor-pointer hover:border-primary/50 transition-colors"
                style={{ borderLeft: `4px solid ${habit.color}` }}
                onClick={() => navigate(`/habits/${habit.id}`)}
              >
                {/* Emoji */}
                <span className="text-2xl">{habit.emoji}</span>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{habit.name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-muted-foreground">
                      {recurrenceSummary(habit.recurrence)}
                    </span>
                    <span
                      className="text-xs px-1.5 py-0.5 rounded-full font-medium"
                      style={{
                        backgroundColor: `${habit.color}22`,
                        color: habit.color,
                      }}
                    >
                      {habit.category}
                    </span>
                  </div>
                </div>

                {/* Streak badge */}
                {streak > 0 && (
                  <span className="text-xs font-semibold flex items-center gap-0.5 shrink-0">
                    🔥{streak}
                  </span>
                )}

                {/* Kebab menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger
                    onClick={(e) => e.stopPropagation()}
                    className="p-1 rounded hover:bg-muted text-muted-foreground"
                  >
                    ⋮
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <DropdownMenuItem onSelect={() => openEditHabitForm(habit)}>
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onSelect={() => setArchiveHabitTarget(habit.id)}
                    >
                      Archive
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onSelect={() => setDeleteHabitTarget(habit.id)}
                      className="text-destructive"
                    >
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </li>
            )
          })}
        </ul>
      )}

      {/* FAB */}
      <Button
        onClick={() => setHabitFormOpen(true)}
        className="md:hidden fixed bottom-20 right-5 w-14 h-14 rounded-full bg-primary text-primary-foreground text-3xl shadow-lg flex items-center justify-center"
      >
        +
      </Button>

      {/* HabitForm modal */}
      <HabitForm
        open={habitFormOpen}
        onClose={closeHabitForm}
        habit={editHabit}
      />

      {/* Archive confirm */}
      <ArchiveDialog
        archiveHabitTarget={archiveHabitTarget}
        setArchiveHabitTarget={setArchiveHabitTarget}
        archiveHabit={archiveHabit}
      />

      {/* Delete confirm */}
      <DeleteHabitDialog
        deleteHabitTarget={deleteHabitTarget}
        setDeleteHabitTarget={setDeleteHabitTarget}
        deleteHabit={deleteHabit}
      />
    </div>
  )
}
