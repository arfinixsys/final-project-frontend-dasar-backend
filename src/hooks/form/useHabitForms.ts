import { useEffect } from 'react'
import { buildRecurrence } from '@/lib/recurrence'
import { HabitFormSchema } from '@/schemas/habitForm.schema'
import { useHabitStore } from '@/store/useHabitStore'
import type { HabitFormType } from '@/types/form/habitForm.type'
import type { Habit } from '@/types/habit.type'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

export const useHabitForms = (onClose: () => void, habit?: Habit) => {
  const addHabit = useHabitStore((s) => s.addHabit)
  const updateHabit = useHabitStore((s) => s.updateHabit)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<HabitFormType>({
    resolver: zodResolver(HabitFormSchema),
    defaultValues: {
      name: habit?.name ?? '',
      emoji: habit?.emoji ?? '⭐',
      color: habit?.color ?? '#6366f1',
      category: habit?.category ?? 'Health',
      reminderTime: habit?.reminderTime ?? '',
      recType: habit?.recurrence.type ?? 'daily',
      days:
        habit?.recurrence.type === 'specific_days' ? habit.recurrence.days : [],
      nDays: habit?.recurrence.type === 'every_n_days' ? habit.recurrence.n : 2,
      dayOfMonth:
        habit?.recurrence.type === 'monthly' ? habit.recurrence.dayOfMonth : 1,
    },
  })

  useEffect(() => {
    reset({
      name: habit?.name ?? '',
      emoji: habit?.emoji ?? '⭐',
      color: habit?.color ?? '#6366f1',
      category: habit?.category ?? 'Health',
      reminderTime: habit?.reminderTime ?? '',
      recType: habit?.recurrence.type ?? 'daily',
      days:
        habit?.recurrence.type === 'specific_days' ? habit.recurrence.days : [],
      nDays: habit?.recurrence.type === 'every_n_days' ? habit.recurrence.n : 2,
      dayOfMonth:
        habit?.recurrence.type === 'monthly' ? habit.recurrence.dayOfMonth : 1,
    })
  }, [habit]) // eslint-disable-line react-hooks/exhaustive-deps

  const onSubmit = (values: HabitFormType) => {
    const recurrence = buildRecurrence(values)
    const data = {
      name: values.name,
      emoji: values.emoji,
      color: values.color,
      category: values.category,
      recurrence,
      reminderTime: values.reminderTime || undefined,
    }
    if (habit) updateHabit(habit.id, data)
    else addHabit(data)
    onClose()
  }

  return {
    register,
    handleSubmit,
    onSubmit,
    setValue,
    watch,
    errors,
  }
}
