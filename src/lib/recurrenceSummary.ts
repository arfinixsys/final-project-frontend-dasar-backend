import type { RecurrenceConfig } from '@/types/reccurenceConfig.type'

const DAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const ordinal = (n: number) => {
  const s = ['th', 'st', 'nd', 'rd']
  const v = n % 100
  return n + (s[(v - 20) % 10] ?? s[v] ?? s[0])
}

export function recurrenceSummary(recurrence: RecurrenceConfig): string {
  switch (recurrence.type) {
    case 'daily':
      return 'Every day'
    case 'weekdays':
      return 'Weekdays'
    case 'weekends':
      return 'Weekends'
    case 'specific_days':
      return recurrence.days.map((d) => DAY_SHORT[d]).join(' ')
    case 'every_n_days':
      return `Every ${recurrence.n} days`
    case 'monthly':
      return `Monthly on ${ordinal(recurrence.dayOfMonth)}`
  }
}
