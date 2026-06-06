import { isDueOn } from '@/lib/recurrence'
import { toDateString, isSameDay } from '@/lib/dateUtils'
import { cn } from '@/lib/utils'
import { DAY_LABELS } from '@/const/dayLabels'
import { MONTH_NAMES } from '@/const/months'
import type { Habit } from '@/types/habit.type'
import type { HabitCompletion } from '@/types/habitCompletion.type'
import { Button } from './ui/button'

export default function HabitMiniCalendar({
  habit,
  completions,
  onToggle,
}: {
  habit: Habit
  completions: HabitCompletion[]
  onToggle: (date: string) => void
}) {
  const today = new Date()
  const year = today.getFullYear()
  const month = today.getMonth()
  const todayMid = new Date(year, month, today.getDate())
  const startWeekday = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const doneSet = new Set(
    completions.filter((c) => c.habitId === habit.id).map((c) => c.date)
  )

  const cells: (number | null)[] = []
  for (let i = 0; i < startWeekday; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)

  return (
    <div className="w-full">
      <p className="text-sm font-semibold mb-4">
        {MONTH_NAMES[month]} {year}
      </p>

      <div className="grid grid-cols-7 gap-y-3 gap-8 md:gap-x-0 place-items-center">
        {DAY_LABELS.map((label, i) => (
          <div
            key={i}
            className="text-xs text-center max-w-10 font-medium text-muted-foreground mb-4"
          >
            {label}
          </div>
        ))}

        {cells.map((day, i) => {
          if (day === null) return <div key={`blank-${i}`} />

          const date = new Date(year, month, day)
          const dateStr = toDateString(date)
          const isToday = isSameDay(date, today)
          const isFuture = date.getTime() > todayMid.getTime()
          const done = doneSet.has(dateStr)
          const due = isDueOn(habit, date)
          const missed = due && !done && !isFuture && !isToday

          return (
            <Button
              key={dateStr}
              type="button"
              disabled={isFuture}
              onClick={() => !isFuture && onToggle(dateStr)}
              aria-label={dateStr}
              className={cn(
                'max-w-10 rounded-full text-xs transition-opacity',
                isFuture
                  ? 'opacity-30 cursor-not-allowed'
                  : 'cursor-pointer hover:opacity-80',
                isToday && 'ring-2 ring-foreground/40',
                !done && !missed && 'text-muted-foreground/50',
                missed && 'text-foreground'
              )}
              style={
                done
                  ? { backgroundColor: habit.color, color: '#fff' }
                  : missed
                    ? { backgroundColor: 'var(--muted)' }
                    : undefined
              }
            >
              {day}
            </Button>
          )
        })}
      </div>
    </div>
  )
}
