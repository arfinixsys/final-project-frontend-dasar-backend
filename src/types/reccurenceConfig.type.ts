export type RecurrenceConfig =
  | { type: 'daily' }
  | { type: 'weekdays' }
  | { type: 'weekends' }
  | { type: 'specific_days'; days: number[] }
  | { type: 'every_n_days'; n: number }
  | { type: 'monthly'; dayOfMonth: number }
