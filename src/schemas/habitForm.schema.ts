import z from 'zod'

export const HabitFormSchema = z
  .object({
    name: z.string().min(1, 'Name is required'),
    emoji: z.string(),
    color: z.string(),
    category: z.string(),
    reminderTime: z.string().optional(),
    recType: z.enum([
      'daily',
      'weekdays',
      'weekends',
      'specific_days',
      'every_n_days',
      'monthly',
    ]),
    days: z.array(z.number()),
    nDays: z.number().min(2).max(30),
    dayOfMonth: z.number().min(1).max(28),
  })
  .superRefine((val, ctx) => {
    if (val.recType === 'specific_days' && val.days.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Select at least one day',
        path: ['days'],
      })
    }
  })
