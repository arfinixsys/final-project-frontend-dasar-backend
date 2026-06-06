import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useHabitStore } from '@/store/useHabitStore'
import { isDueOn } from '@/lib/recurrence'
import { toDateString } from '@/lib/dateUtils'
import type { Habit } from '@/types/habit.type'
import { DAY_NAMES } from '@/const/dayLabels'
import { MONTH_NAMES } from '@/const/months'
import confetti from 'canvas-confetti'

const today = new Date()
const todayStr = toDateString(today)

export default function TodayPage() {
  const navigate = useNavigate()
  const habits = useHabitStore((s) => s.habits)
  const completions = useHabitStore((s) => s.completions)
  const toggleCompletion = useHabitStore((s) => s.toggleCompletion)
  const updateCompletionNote = useHabitStore((s) => s.updateCompletionNote)

  const [noteInputs, setNoteInputs] = useState<Record<string, string>>({})

  const todayCompletions = completions.filter((c) => c.date === todayStr)
  const noteMap = new Map(
    todayCompletions.map((c) => [c.habitId, c.note ?? ''])
  )

  const activeHabits = habits.filter((h) => !h.archivedAt)
  const dueHabits = activeHabits.filter((h) => isDueOn(h, today))

  const todayCompletionIds = new Set(
    completions.filter((c) => c.date === todayStr).map((c) => c.habitId)
  )

  const isDone = (h: Habit) => todayCompletionIds.has(h.id)

  const sorted = [...dueHabits].sort((a, b) => {
    const aDone = isDone(a) ? 1 : 0
    const bDone = isDone(b) ? 1 : 0
    return aDone - bDone
  })

  const doneCount = dueHabits.filter(isDone).length
  const totalDue = dueHabits.length
  const pct = totalDue === 0 ? 0 : Math.round((doneCount / totalDue) * 100)
  const allDone = totalDue > 0 && doneCount === totalDue
  const prevAllDone = useRef(allDone)

  useEffect(() => {
    if (allDone && !prevAllDone.current) {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: dueHabits.map((h) => h.color),
      })
    }
    prevAllDone.current = allDone
  }, [allDone, dueHabits])

  const dayName = DAY_NAMES[today.getDay()]
  const dateLabel = `${MONTH_NAMES[today.getMonth()]} ${today.getDate()}, ${today.getFullYear()}`

  return (
    <div className="p-4 md:p-5">
      {/* Header */}
      <div className="mb-5 md:mb-6">
        <h1 className="text-2xl md:text-3xl font-bold">{dayName}</h1>
        <p className="text-xs md:text-sm text-muted-foreground">{dateLabel}</p>
      </div>

      {/* Progress bar */}
      {totalDue > 0 && (
        <div className="mb-5 md:mb-6">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-muted-foreground">
              {doneCount} of {totalDue} done
            </span>
            <span className="font-medium">{pct}%</span>
          </div>
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${allDone ? 'bg-green-500' : 'bg-primary'}`}
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      )}

      {/* Empty state */}
      {activeHabits.length === 0 ? (
        <div className="text-center py-10 md:py-16 space-y-3">
          <p className="text-muted-foreground">No habits yet</p>
          <button
            onClick={() => navigate('/habits')}
            className="text-sm font-medium text-primary underline"
          >
            Add your first habit
          </button>
        </div>
      ) : totalDue === 0 ? (
        <p className="text-center py-10 md:py-16 text-muted-foreground">
          No habits due today
        </p>
      ) : (
        <ul className="grid grid-cols-1 gap-3 md:gap-4">
          {sorted.map((habit) => {
            const done = isDone(habit)
            return (
              <li
                key={habit.id}
                className="rounded-xl bg-card shadow-sm border border-border"
                style={{ borderLeft: `4px solid ${habit.color}` }}
              >
                <div className="flex items-center gap-3 p-4">
                  {/* Emoji + name */}
                  <span className="text-lg md:text-xl shrink-0">
                    {habit.emoji}
                  </span>
                  <div className="flex-1 min-w-0">
                    <span
                      className={`text-sm font-medium ${done ? 'line-through opacity-50' : ''}`}
                    >
                      {habit.name}
                    </span>
                    {done && (
                      <input
                        value={
                          noteInputs[habit.id] ?? noteMap.get(habit.id) ?? ''
                        }
                        onChange={(e) =>
                          setNoteInputs((prev) => ({
                            ...prev,
                            [habit.id]: e.target.value,
                          }))
                        }
                        onBlur={(e) =>
                          updateCompletionNote(
                            habit.id,
                            todayStr,
                            e.target.value
                          )
                        }
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.currentTarget.blur()
                          }
                        }}
                        placeholder="Add a note..."
                        className="block w-full mt-0.5 text-xs bg-transparent border-none outline-none placeholder:text-muted-foreground/40 text-muted-foreground"
                      />
                    )}
                  </div>

                  {/* Check button */}
                  <button
                    onClick={() => {
                      if (!done)
                        setNoteInputs((prev) => ({ ...prev, [habit.id]: '' }))
                      toggleCompletion(habit.id, todayStr)
                    }}
                    className="min-w-7 max-w-7 min-h-7 max-h-7 shrink-0 rounded-full border-2 flex items-center justify-center transition-colors cursor-pointer"
                    style={
                      done
                        ? {
                            backgroundColor: habit.color,
                            borderColor: habit.color,
                          }
                        : { borderColor: habit.color }
                    }
                    aria-label={done ? 'Mark undone' : 'Mark done'}
                  >
                    {done && (
                      <svg
                        className="w-4 h-4 text-white"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={3}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                  </button>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
