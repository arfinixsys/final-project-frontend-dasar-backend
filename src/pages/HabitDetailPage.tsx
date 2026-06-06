import React, { useState } from 'react'
import { useParams, useNavigate, Navigate } from 'react-router-dom'
import { useHabitStore } from '@/store/useHabitStore'
import {
  calculateStreak,
  calculateConsistencyScore,
  calculateMomentum,
  calculateBreakRisk,
  getBestDayOfWeek,
  getCorrelatedHabits,
  generateWeeklyInsight,
} from '@/lib/analytics'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ArchiveDialog } from '@/components/ArchiveHabitDialog'
import { DeleteHabitDialog } from '@/components/DeleteHabitDialog'
import HabitMiniCalendar from '@/components/HabitMiniCalendar'
import HabitWeeklyBarChart from '@/components/HabitWeeklyBarChart'
import { LucideArrowLeft } from 'lucide-react'
import { MOMENTUM_META } from '@/const/momentum'
import { RISK_META } from '@/const/riskMeta'

export default function HabitDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const habits = useHabitStore((s) => s.habits)
  const completions = useHabitStore((s) => s.completions)
  const toggleCompletion = useHabitStore((s) => s.toggleCompletion)
  const archiveHabit = useHabitStore((s) => s.archiveHabit)
  const deleteHabit = useHabitStore((s) => s.deleteHabit)

  const [archiveTarget, setArchiveTarget] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)

  const habit = habits.find((h) => h.id === id)

  if (!habit) return <Navigate to="/habits" replace />

  const today = new Date()
  const { current, longest } = calculateStreak(habit, completions, today)
  const consistency = calculateConsistencyScore(habit, completions, today)
  const totalDone = completions.filter((c) => c.habitId === habit.id).length
  const momentum = calculateMomentum(habit, completions, today)
  const risk = calculateBreakRisk(habit, completions, today)
  const bestDay = getBestDayOfWeek(habit, completions)
  const insight = generateWeeklyInsight(habit, completions, today)
  const correlated = getCorrelatedHabits(habit, habits, completions)

  const momentumMeta = MOMENTUM_META[momentum]
  const riskMeta = RISK_META[risk]

  const stats = [
    { label: 'Current Streak', icon: '🔥', value: current },
    { label: 'Longest Streak', icon: '🏆', value: longest },
    { label: 'Consistency', icon: '📊', value: `${consistency}%` },
    { label: 'Total Done', icon: '✓', value: totalDone },
  ]

  return (
    <div className="p-5 pb-24">
      <Button
        onClick={() => navigate('/habits')}
        className="text-sm font-bold mb-4 flex items-center gap-2 cursor-pointer"
        aria-label="Back to habits"
        variant="outline"
      >
        <LucideArrowLeft />
      </Button>

      <header
        className="rounded-2xl p-5 mb-6 flex items-center gap-4"
        style={{ backgroundColor: `${habit.color}1a` }}
      >
        <span className="text-5xl">{habit.emoji}</span>
        <div className="min-w-0">
          <h1
            className="text-2xl font-bold truncate"
            style={{ color: habit.color }}
          >
            {habit.name}
          </h1>
          <span
            className="text-xs px-2 py-0.5 rounded-full font-medium inline-block mt-1"
            style={{ backgroundColor: `${habit.color}22`, color: habit.color }}
          >
            {habit.category}
          </span>
        </div>
      </header>

      <div className="grid grid-cols-2 gap-3 mb-6">
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-xl p-4 bg-card border border-border shadow-sm"
          >
            <div className="text-2xl mb-1">{s.icon}</div>
            <div className="text-2xl font-bold">{s.value}</div>
            <div className="text-xs text-muted-foreground">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <span
          className={cn(
            'text-xs px-3 py-1 rounded-full font-medium flex items-center gap-2',
            momentumMeta.className
          )}
        >
          {momentumMeta.label}{' '}
          {React.createElement(momentumMeta.arrow, { size: 16 })}
        </span>
        <span
          className={cn(
            'text-xs px-3 py-1 rounded-full font-medium',
            riskMeta.className
          )}
        >
          Break Risk: {riskMeta.label}
        </span>
      </div>

      <p className="text-sm font-medium mb-2">
        {bestDay ? `Best day: ${bestDay}` : 'Not enough data'}
      </p>

      <p className="text-sm italic text-muted-foreground mb-6">{insight}</p>

      {correlated.length > 0 && (
        <div className="mb-6">
          <p className="text-sm font-medium mb-2">Often done together with:</p>
          <div className="flex flex-wrap gap-2">
            {correlated.map(({ habit: h }) => (
              <span
                key={h.id}
                className="text-xs px-3 py-1 rounded-full bg-muted flex items-center gap-1"
              >
                <span>{h.emoji}</span>
                {h.name}
              </span>
            ))}
          </div>
        </div>
      )}

      <section className="rounded-xl py-4 px-6 bg-card border border-border shadow-sm mb-6 flex justify-center">
        <HabitMiniCalendar
          habit={habit}
          completions={completions}
          onToggle={(date) => toggleCompletion(habit.id, date)}
        />
      </section>

      <section className="rounded-xl p-4 bg-card border border-border shadow-sm mb-6">
        <p className="text-sm font-semibold mb-8">Last 8 weeks</p>
        <HabitWeeklyBarChart habit={habit} completions={completions} />
      </section>

      <section className="rounded-xl p-4 bg-card border border-border shadow-sm mb-6">
        <p className="text-sm font-semibold mb-4">Notes</p>
        {(() => {
          const notes = completions
            .filter((c) => c.habitId === habit.id && c.note)
            .sort((a, b) => b.date.localeCompare(a.date))

          if (notes.length === 0) {
            return (
              <p className="text-xs text-muted-foreground text-center py-6">
                No notes yet. Tap a habit on Today to add one.
              </p>
            )
          }

          return (
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {notes.map((c) => (
                <div key={c.id} className="flex gap-3">
                  <div className="flex flex-col items-center gap-1">
                    <div
                      className="w-2 h-2 rounded-full shrink-0 mt-1.5"
                      style={{ backgroundColor: habit.color }}
                    />
                    <div className="w-px flex-1 bg-border" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] text-muted-foreground">
                      {new Date(c.date + 'T00:00:00').toLocaleDateString(
                        'en-US',
                        { month: 'short', day: 'numeric' }
                      )}
                    </p>
                    <p className="text-sm">{c.note}</p>
                  </div>
                </div>
              ))}
            </div>
          )
        })()}
      </section>

      <section className="rounded-xl p-4 border border-destructive/30 bg-destructive/5">
        <p className="text-sm font-semibold text-destructive mb-3">
          Danger Zone
        </p>
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => setArchiveTarget(habit.id)}
          >
            Archive Habit
          </Button>
          <Button
            variant="destructive"
            className="flex-1"
            onClick={() => setDeleteTarget(habit.id)}
          >
            Delete Habit
          </Button>
        </div>
      </section>

      <ArchiveDialog
        archiveHabitTarget={archiveTarget}
        setArchiveHabitTarget={setArchiveTarget}
        archiveHabit={(target) => {
          archiveHabit(target)
          navigate('/habits')
        }}
      />

      <DeleteHabitDialog
        deleteHabitTarget={deleteTarget}
        setDeleteHabitTarget={setDeleteTarget}
        deleteHabit={(target) => {
          deleteHabit(target)
          navigate('/habits')
        }}
      />
    </div>
  )
}
