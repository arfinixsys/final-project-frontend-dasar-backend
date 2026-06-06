import type { Habit } from '@/types/habit.type'
import { parseDate, daysBetween } from './dateUtils'
import type { HabitFormType } from '@/types/form/habitForm.type'
import type { RecurrenceConfig } from '@/types/reccurenceConfig.type'

export const isDueOn = (habit: Habit, date: Date | string): boolean => {
  const target = toLocalDate(date)
  const { recurrence } = habit

  switch (recurrence.type) {
    case 'daily':
      return true

    case 'weekdays': {
      const dow = target.getDay()
      return dow >= 1 && dow <= 5
    }

    case 'weekends': {
      const dow = target.getDay()
      return dow === 0 || dow === 6
    }

    case 'specific_days': {
      if (!recurrence.days || recurrence.days.length === 0) return false
      const dow = target.getDay() as 0 | 1 | 2 | 3 | 4 | 5 | 6
      return recurrence.days.includes(dow)
    }

    case 'every_n_days': {
      const n = recurrence.n
      if (!n || n < 1) return false

      const epoch = toLocalDate(habit.createdAt)
      const diff = daysBetween(epoch, target)

      return diff % n === 0
    }

    case 'monthly': {
      const dom = recurrence.dayOfMonth
      if (!dom) return false
      return target.getDate() === dom
    }

    default:
      return false
  }
}

const toLocalDate = (value: Date | string): Date => {
  if (typeof value === 'string') {
    const datePart = value.slice(0, 10)
    return parseDate(datePart)
  }
  return new Date(value.getFullYear(), value.getMonth(), value.getDate())
}

export const buildRecurrence = (v: HabitFormType): RecurrenceConfig => {
  switch (v.recType) {
    case 'specific_days':
      return { type: 'specific_days', days: v.days }
    case 'every_n_days':
      return { type: 'every_n_days', n: v.nDays }
    case 'monthly':
      return { type: 'monthly', dayOfMonth: v.dayOfMonth }
    default:
      return { type: v.recType }
  }
}
