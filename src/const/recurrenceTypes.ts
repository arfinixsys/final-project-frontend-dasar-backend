import type { RecurrenceConfig } from '@/types/reccurenceConfig.type'

export const RECURRENCE_TYPES: {
  value: RecurrenceConfig['type']
  label: string
}[] = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekdays', label: 'Weekdays' },
  { value: 'weekends', label: 'Weekends' },
  { value: 'specific_days', label: 'Specific days' },
  { value: 'every_n_days', label: 'Every N days' },
  { value: 'monthly', label: 'Monthly' },
]
