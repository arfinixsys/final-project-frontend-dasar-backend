import { Response } from 'express'
import { z } from 'zod'
import { nanoid } from 'nanoid'
import { dbHabits, dbCompletions } from '../db/store.js'
import type { AuthRequest } from '../types/index.js'

// ── Validation schemas ────────────────────────────────────────────────────────
const RecurrenceSchema = z.discriminatedUnion('type', [
    z.object({ type: z.literal('daily') }),
    z.object({ type: z.literal('weekdays') }),
    z.object({ type: z.literal('weekends') }),
    z.object({
        type: z.literal('specific_days'),
        days: z.array(z.number().min(0).max(6)).min(1),
    }),
    z.object({
        type: z.literal('every_n_days'),
        n: z.number().min(2).max(30),
    }),
    z.object({
        type: z.literal('monthly'),
        dayOfMonth: z.number().min(1).max(28),
    }),
])

const HabitSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    emoji: z.string().default('⭐'),
    color: z.string().default('#6366f1'),
    category: z.enum(['Health', 'Productivity', 'Mindfulness', 'Learning']),
    recurrence: RecurrenceSchema,
    reminderTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
})

const HabitUpdateSchema = HabitSchema.partial().extend({
    archivedAt: z.string().optional(),
})

// ── GET /habits ───────────────────────────────────────────────────────────────
export function getHabits(req: AuthRequest, res: Response): void {
    const habits = dbHabits.findByUser(req.userId!)
    res.json(habits)
}

// ── POST /habits ──────────────────────────────────────────────────────────────
export function createHabit(req: AuthRequest, res: Response): void {
    const parsed = HabitSchema.safeParse(req.body)

    if (!parsed.success) {
        res.status(400).json({
            message: 'Validation failed',
            errors: parsed.error.flatten().fieldErrors,
        })
        return
    }

    const habit = dbHabits.create({
        id: nanoid(),
        userId: req.userId!,
        ...parsed.data,
        createdAt: new Date().toISOString(),
    })

    res.status(201).json(habit)
}

// ── GET /habits/:id ───────────────────────────────────────────────────────────
export function getHabit(req: AuthRequest, res: Response): void {
    const habit = dbHabits.findById(req.params.id)

    if (!habit || habit.userId !== req.userId) {
        res.status(404).json({ message: 'Habit not found' })
        return
    }

    res.json(habit)
}

// ── PUT /habits/:id ───────────────────────────────────────────────────────────
export function updateHabit(req: AuthRequest, res: Response): void {
    const habit = dbHabits.findById(req.params.id)

    if (!habit || habit.userId !== req.userId) {
        res.status(404).json({ message: 'Habit not found' })
        return
    }

    const parsed = HabitUpdateSchema.safeParse(req.body)

    if (!parsed.success) {
        res.status(400).json({
            message: 'Validation failed',
            errors: parsed.error.flatten().fieldErrors,
        })
        return
    }

    const updated = dbHabits.update(req.params.id, parsed.data)
    res.json(updated)
}

// ── PATCH /habits/:id/archive ─────────────────────────────────────────────────
export function archiveHabit(req: AuthRequest, res: Response): void {
    const habit = dbHabits.findById(req.params.id)

    if (!habit || habit.userId !== req.userId) {
        res.status(404).json({ message: 'Habit not found' })
        return
    }

    const updated = dbHabits.update(req.params.id, {
        archivedAt: new Date().toISOString(),
    })

    res.json(updated)
}

// ── PATCH /habits/:id/unarchive ───────────────────────────────────────────────
export function unarchiveHabit(req: AuthRequest, res: Response): void {
    const habit = dbHabits.findById(req.params.id)

    if (!habit || habit.userId !== req.userId) {
        res.status(404).json({ message: 'Habit not found' })
        return
    }

    const updated = dbHabits.update(req.params.id, { archivedAt: undefined })
    res.json(updated)
}

// ── DELETE /habits/:id ────────────────────────────────────────────────────────
export function deleteHabit(req: AuthRequest, res: Response): void {
    const habit = dbHabits.findById(req.params.id)

    if (!habit || habit.userId !== req.userId) {
        res.status(404).json({ message: 'Habit not found' })
        return
    }

    dbHabits.delete(req.params.id)
    dbCompletions.deleteByHabit(req.params.id)

    res.json({ message: 'Habit deleted' })
}
