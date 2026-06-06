import type { Habit } from '@/types/habit.type'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { EMOJI_GROUPS } from '@/const/emojiGroups'
import { RECURRENCE_TYPES } from '@/const/recurrenceTypes'
import { DAY_LABELS } from '@/const/dayLabels'
import { COLORS } from '@/const/colors'
import { CATEGORIES } from '@/const/categories'
import { useHabitForms } from '@/hooks/form/useHabitForms'
import { Button } from './ui/button'

interface HabitFormProps {
  open: boolean
  onClose: () => void
  habit?: Habit
}

export default function HabitForm({ open, onClose, habit }: HabitFormProps) {
  const { register, handleSubmit, onSubmit, setValue, watch, errors } =
    useHabitForms(onClose, habit)

  const recType = watch('recType')
  const color = watch('color')
  const days = watch('days')
  const category = watch('category')
  const isCustomCategory = !(CATEGORIES as readonly string[]).includes(category)

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        className="fixed px-10 w-full max-w-lg max-h-[80vh] rounded-t-2xl rounded-b-none p-6 pb-8 overflow-y-auto data-[state=open]:slide-in-from-bottom data-[state=closed]:slide-out-to-bottom scrollbar-none"
        showCloseButton={true}
      >
        <DialogHeader className="mb-2">
          <DialogTitle>{habit ? 'Edit Habit' : 'New Habit'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Name */}
          <div className="space-y-1">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              {...register('name')}
              placeholder="e.g. Morning run"
            />
            {errors.name && (
              <p className="text-destructive text-xs">{errors.name.message}</p>
            )}
          </div>

          {/* Emoji */}
          <div className="space-y-2">
            <Label>Emoji</Label>
            <div className="grid grid-cols-6 sm:grid-cols-6 gap-1">
              {EMOJI_GROUPS.flatMap((g) => g.emojis).map((e) => (
                <button
                  key={e}
                  type="button"
                  onClick={() => setValue('emoji', e)}
                  className={`text-xl h-10 rounded-lg flex items-center justify-center transition-colors
                    ${watch('emoji') === e ? 'bg-primary/20 ring-2 ring-primary' : 'hover:bg-muted'}`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          {/* Color */}
          <div className="space-y-2">
            <Label>Color</Label>
            <div className="flex gap-3 flex-wrap">
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setValue('color', c)}
                  className={`w-7 h-7 rounded-full transition-transform ${color === c ? 'ring-2 ring-offset-2 ring-offset-background scale-110' : ''}`}
                  style={{
                    backgroundColor: c,
                    ['--tw-ring-color' as string]: c,
                  }}
                />
              ))}
            </div>
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label>Category</Label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setValue('category', cat)}
                  className={`px-2.5 py-1 rounded-full text-sm border transition-colors
                    ${
                      category === cat
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'border-border text-muted-foreground hover:border-primary'
                    }`}
                >
                  {cat}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setValue('category', '')}
                className={`px-2.25 py-1 rounded-full text-sm border border-dashed transition-colors ${
                  isCustomCategory
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'border-border text-muted-foreground hover:border-primary'
                }`}
              >
                + Custom
              </button>
            </div>
            {isCustomCategory && (
              <Input
                placeholder="Type a category..."
                value={category}
                onChange={(e) => setValue('category', e.target.value)}
                className="mt-1"
              />
            )}
          </div>

          {/* Reminder */}
          <div className="space-y-1">
            <Label htmlFor="reminderTime">Reminder</Label>
            <div className="flex items-center gap-2">
              <input
                id="reminderTime"
                type="time"
                onClick={() => {
                  if (
                    'Notification' in window &&
                    Notification.permission === 'default'
                  ) {
                    Notification.requestPermission()
                  }
                }}
                {...register('reminderTime')}
                className="w-full border border-input rounded-lg px-3 py-2 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
              {'Notification' in window &&
                Notification.permission === 'denied' && (
                  <span className="text-xs text-destructive shrink-0">
                    Blocked
                  </span>
                )}
            </div>
            <p className="text-xs text-muted-foreground">
              {'Notification' in window && Notification.permission === 'granted'
                ? 'Notifications enabled'
                : 'Tap the field to enable notifications'}
            </p>
          </div>

          {/* Recurrence type */}
          <div className="space-y-1">
            <Label htmlFor="recType">Repeat</Label>
            <select
              id="recType"
              {...register('recType')}
              className="w-full border border-input rounded-lg px-3 py-2 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {RECURRENCE_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          {/* specific_days */}
          {recType === 'specific_days' && (
            <div className="space-y-1">
              <div className="flex gap-1">
                {DAY_LABELS.map((label, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      const next = days.includes(i)
                        ? days.filter((x) => x !== i)
                        : [...days, i]
                      setValue('days', next)
                    }}
                    className={`flex-1 h-9 rounded-lg text-sm font-medium transition-colors
                      ${
                        days.includes(i)
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground hover:bg-muted/80'
                      }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              {errors.days && (
                <p className="text-destructive text-xs">
                  {errors.days.message}
                </p>
              )}
            </div>
          )}

          {/* every_n_days */}
          {recType === 'every_n_days' && (
            <div className="space-y-1">
              <Label htmlFor="nDays">Every N days</Label>
              <Input
                id="nDays"
                type="number"
                min={2}
                max={30}
                className="w-24"
                {...register('nDays', { valueAsNumber: true })}
              />
            </div>
          )}

          {/* monthly */}
          {recType === 'monthly' && (
            <div className="space-y-1">
              <Label htmlFor="dayOfMonth">Day of month</Label>
              <Input
                id="dayOfMonth"
                type="number"
                min={1}
                max={28}
                className="w-24"
                {...register('dayOfMonth', { valueAsNumber: true })}
              />
            </div>
          )}

          {/* Submit */}
          <Button
            type="submit"
            className="w-full py-3 rounded-xl font-semibold text-sm text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: color }}
          >
            {habit ? 'Save Changes' : 'Add Habit'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
