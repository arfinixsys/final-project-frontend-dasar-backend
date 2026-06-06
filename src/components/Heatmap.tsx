import { useMemo, useRef, useState } from 'react'
import { isDueOn } from '@/lib/recurrence'
import { toDateString } from '@/lib/dateUtils'
import { MONTH_NAMES } from '@/const/months'
import type { Habit } from '@/types/habit.type'
import type { HabitCompletion } from '@/types/habitCompletion.type'

const WEEKS = 16
const DAY_LABEL_ROWS: Record<number, string> = { 0: 'Mon', 2: 'Wed', 4: 'Fri' }

interface DayCell {
  dateStr: string
  isFuture: boolean
  colorClass: string
  tooltip: string
}

interface TooltipState {
  text: string
  left: number
  top: number
}

function partialColor(ratio: number): string {
  if (ratio < 0.4) return 'bg-emerald-900'
  if (ratio < 0.65) return 'bg-emerald-700'
  return 'bg-emerald-500'
}

export default function Heatmap({
  habits,
  completions,
}: {
  habits: Habit[]
  completions: HabitCompletion[]
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [tooltip, setTooltip] = useState<TooltipState | null>(null)

  const { cells, monthLabels } = useMemo(() => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const daysSinceMonday = (today.getDay() + 6) % 7
    const start = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() - daysSinceMonday - (WEEKS - 1) * 7
    )

    const activeHabits = habits.filter((h) => !h.archivedAt)
    const doneSet = new Set(completions.map((c) => `${c.habitId}|${c.date}`))

    const cells: DayCell[] = []
    const monthLabels: (string | null)[] = new Array(WEEKS).fill(null)

    for (let w = 0; w < WEEKS; w++) {
      for (let dd = 0; dd < 7; dd++) {
        const date = new Date(
          start.getFullYear(),
          start.getMonth(),
          start.getDate() + w * 7 + dd
        )

        if (date.getDate() === 1) {
          monthLabels[w] = MONTH_NAMES[date.getMonth()].slice(0, 3)
        }

        const dateStr = toDateString(date)
        const label = `${MONTH_NAMES[date.getMonth()].slice(0, 3)} ${date.getDate()}`
        const isFuture = date.getTime() > today.getTime()

        if (isFuture) {
          cells.push({
            dateStr,
            isFuture: true,
            colorClass: 'bg-transparent',
            tooltip: '',
          })
          continue
        }

        const dueHabits = activeHabits.filter((h) => isDueOn(h, date))
        const dueCount = dueHabits.length

        if (dueCount === 0) {
          cells.push({
            dateStr,
            isFuture: false,
            colorClass: 'bg-gray-900',
            tooltip: `${label} · Not due`,
          })
          continue
        }

        const doneCount = dueHabits.filter((h) =>
          doneSet.has(`${h.id}|${dateStr}`)
        ).length

        let colorClass: string
        if (doneCount === 0) colorClass = 'bg-red-900/60'
        else if (doneCount === dueCount) colorClass = 'bg-emerald-400'
        else colorClass = partialColor(doneCount / dueCount)

        cells.push({
          dateStr,
          isFuture: false,
          colorClass,
          tooltip: `${label} · ${doneCount} of ${dueCount} done`,
        })
      }
    }

    return { cells, monthLabels }
  }, [habits, completions])

  function showTooltip(e: React.MouseEvent, text: string) {
    const cont = containerRef.current
    if (!cont) return
    const cr = e.currentTarget.getBoundingClientRect()
    const pr = cont.getBoundingClientRect()
    setTooltip({
      text,
      left: cr.left - pr.left + cr.width / 2,
      top: cr.top - pr.top - 4,
    })
  }

  return (
    <div ref={containerRef} className="relative">
      <div className="overflow-x-auto pb-2">
        <div
          className="grid w-max"
          style={{
            gridTemplateColumns: `auto repeat(${WEEKS}, 16px)`,
            gridTemplateRows: `auto repeat(7, 16px)`,
            gap: '2px',
          }}
        >
          <div style={{ gridColumn: 1, gridRow: 1 }} />

          {monthLabels.map((m, w) =>
            m ? (
              <div
                key={`month-${w}`}
                className="text-[10px] leading-none text-gray-400 whitespace-nowrap"
                style={{ gridColumn: w + 2, gridRow: 1 }}
              >
                {m}
              </div>
            ) : null
          )}

          {[0, 1, 2, 3, 4, 5, 6].map((r) =>
            DAY_LABEL_ROWS[r] ? (
              <div
                key={`day-${r}`}
                className="flex items-center justify-end pr-1 text-[10px] leading-none text-gray-400"
                style={{ gridColumn: 1, gridRow: r + 2 }}
              >
                {DAY_LABEL_ROWS[r]}
              </div>
            ) : null
          )}

          {cells.map((cell, idx) => {
            const w = Math.floor(idx / 7)
            const dd = idx % 7
            return (
              <div
                key={cell.dateStr}
                className={`h-4 w-4 rounded-sm ${cell.colorClass}`}
                style={{ gridColumn: w + 2, gridRow: dd + 2 }}
                onMouseEnter={
                  cell.isFuture
                    ? undefined
                    : (e) => showTooltip(e, cell.tooltip)
                }
                onMouseLeave={
                  cell.isFuture ? undefined : () => setTooltip(null)
                }
              />
            )
          })}
        </div>
      </div>

      {tooltip && (
        <div
          className="pointer-events-none absolute z-10 whitespace-nowrap rounded bg-gray-900 px-2 py-1 text-[11px] text-white shadow-md"
          style={{
            left: tooltip.left,
            top: tooltip.top,
            transform: 'translate(-50%, -100%)',
          }}
        >
          {tooltip.text}
        </div>
      )}
    </div>
  )
}
