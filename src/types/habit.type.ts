import type { HabitCategory } from './habitCategory.type'
import type { RecurrenceConfig } from './reccurenceConfig.type'

export interface Habit {
  id: string
  name: string
  emoji: string
  color: string
  category: HabitCategory
  recurrence: RecurrenceConfig
  createdAt: string
  archivedAt?: string
  reminderTime?: string // HH:mm
}
