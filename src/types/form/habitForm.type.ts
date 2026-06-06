import type { HabitFormSchema } from '@/schemas/habitForm.schema'
import type z from 'zod'

export type HabitFormType = z.infer<typeof HabitFormSchema>
