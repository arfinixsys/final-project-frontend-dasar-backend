import { useRef } from 'react'
import { isDueOn } from '@/lib/recurrence'
import { toDateString } from '@/lib/dateUtils'
import type { Habit } from '@/types/habit.type'
import type { HabitCompletion } from '@/types/habitCompletion.type'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
} from 'chart.js'
import { Bar } from 'react-chartjs-2'

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip)

const WEEKS = 8

export default function HabitWeeklyBarChart({
  habit,
  completions,
}: {
  habit: Habit
  completions: HabitCompletion[]
}) {
  const ref = useRef<ChartJS<'bar'>>(null)
  const today = new Date()
  const base = new Date(today.getFullYear(), today.getMonth(), today.getDate())

  const doneSet = new Set(
    completions.filter((c) => c.habitId === habit.id).map((c) => c.date)
  )

  const labels: string[] = []
  const rates: number[] = []
  for (let w = WEEKS - 1; w >= 0; w--) {
    const end = new Date(base)
    end.setDate(end.getDate() - w * 7)
    const start = new Date(end)
    start.setDate(start.getDate() - 6)

    let due = 0
    let done = 0
    const cursor = new Date(start)
    while (cursor.getTime() <= end.getTime()) {
      if (isDueOn(habit, cursor)) {
        due++
        if (doneSet.has(toDateString(cursor))) done++
      }
      cursor.setDate(cursor.getDate() + 1)
    }

    const startLabel = `${start.getDate()}/${start.getMonth() + 1}`
    const endLabel = `${end.getDate()}/${end.getMonth() + 1}`
    labels.push(`W${w + 1}\n${startLabel}-${endLabel}`)
    rates.push(due === 0 ? 0 : Math.round((done / due) * 100))
  }

  return (
    <Bar
      ref={ref}
      data={{
        labels,
        datasets: [
          {
            data: rates,
            backgroundColor: rates.map((_, i) => {
              const alpha = Math.round((0.4 + (i / (WEEKS - 1)) * 0.6) * 255)
              return `${habit.color}${alpha.toString(16).padStart(2, '0')}`
            }),
            borderRadius: 3,
            borderSkipped: false,
          },
        ],
      }}
      options={{
        responsive: true,
        maintainAspectRatio: true,
        aspectRatio: 2,
        animation: {
          duration: 600,
          easing: 'easeOutQuart',
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => `${ctx.parsed.y}% completion`,
            },
          },
        },
        scales: {
          x: {
            ticks: {
              maxRotation: 0,
              font: { size: 9 },
              color: '#fff',
              callback(_value, index) {
                return rates[index] > 0 ? `W${index + 1}` : ''
              },
            },
            grid: { display: false },
          },
          y: {
            beginAtZero: true,
            max: 100,
            ticks: {
              font: { size: 9 },
              color: '#fff',
              stepSize: 25,
              callback(value) {
                return `${value}%`
              },
            },
            grid: {
              color: '#ffffff26',
            },
          },
        },
      }}
    />
  )
}
