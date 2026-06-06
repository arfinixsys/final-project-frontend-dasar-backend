import { Response } from 'express'
import { z } from 'zod'
import { nanoid } from 'nanoid'
import { dbHabits, dbCompletions } from '../db/store.js'
import type { AuthRequest } from '../types/index.js'

// ── Validation ────────────────────────────────────────────────────────────────
const ToggleSchema = z.object({
    habitId: z.string().min(1),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
})

const NoteSchema = z.object({
    note: z.string().max(500),
})

// ── GET /completions ──────────────────────────────────────────────────────────
export function getCompletions(req: AuthRequest, res: Response): void {
    const completions = dbCompletions.findByUser(req.userId!)
    res.json(completions)
}

// ── POST /completions/toggle ──────────────────────────────────────────────────
// Replicates frontend toggleCompletion: add if missing, remove if exists
export function toggleCompletion(req: AuthRequest, res: Response): void {
    const parsed = ToggleSchema.safeParse(req.body)

    if (!parsed.success) {
        res.status(400).json({
            message: 'Validation failed',
            errors: parsed.error.flatten().fieldErrors,
        })
        return
    }

    const { habitId, date } = parsed.data

    // Verify habit belongs to user
    const habit = dbHabits.findById(habitId)
    if (!habit || habit.userId !== req.userId) {
        res.status(404).json({ message: 'Habit not found' })
        return
    }

    const existing = dbCompletions.findOne(habitId, date)

    if (existing) {
        // Remove (uncomplete)
        dbCompletions.delete(existing.id)
        res.json({ action: 'removed', date, habitId })
    } else {
        // Add (complete)
        const completion = dbCompletions.create({
            id: nanoid(),
            habitId,
            userId: req.userId!,
            date,
        })
        res.status(201).json({ action: 'added', completion })
    }
}

// ── PUT /completions/note ─────────────────────────────────────────────────────
export function updateNote(req: AuthRequest, res: Response): void {
    const { habitId, date } = req.body as { habitId: string; date: string }

    const parsed = NoteSchema.safeParse(req.body)
    if (!parsed.success) {
        res.status(400).json({
            message: 'Validation failed',
            errors: parsed.error.flatten().fieldErrors,
        })
        return
    }

    const existing = dbCompletions.findOne(habitId, date)
    if (!existing || existing.userId !== req.userId) {
        res.status(404).json({ message: 'Completion not found' })
        return
    }

    const updated = dbCompletions.update(existing.id, { note: parsed.data.note })
    res.json(updated)
}
