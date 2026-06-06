/**
 * Simple in-memory store with JSON file persistence.
 * Persists data to db.json in the project root.
 */
import fs from 'fs'
import path from 'path'
import type { User, Habit, HabitCompletion } from '../types/index.js'

const DB_FILE = path.resolve(__dirname, '../../db.json')

interface DbSchema {
    users: User[]
    habits: Habit[]
    completions: HabitCompletion[]
}

// Load from disk or initialize empty
function loadDb(): DbSchema {
    try {
        if (fs.existsSync(DB_FILE)) {
            const raw = fs.readFileSync(DB_FILE, 'utf-8')
            return JSON.parse(raw) as DbSchema
        }
    } catch {
        console.warn('[db] Failed to load db.json, starting fresh')
    }
    return { users: [], habits: [], completions: [] }
}

// Save to disk (debounced)
let saveTimer: ReturnType<typeof setTimeout> | null = null
function scheduleSave() {
    if (saveTimer) clearTimeout(saveTimer)
    saveTimer = setTimeout(() => {
        fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8')
    }, 300)
}

// In-memory db
export const db = loadDb()

// Helpers that auto-persist
export const dbUsers = {
    findByEmail: (email: string) =>
        db.users.find((u) => u.email.toLowerCase() === email.toLowerCase()),
    findById: (id: string) => db.users.find((u) => u.id === id),
    create: (user: User) => {
        db.users.push(user)
        scheduleSave()
        return user
    },
    update: (id: string, updates: Partial<User>) => {
        const idx = db.users.findIndex((u) => u.id === id)
        if (idx === -1) return null
        db.users[idx] = { ...db.users[idx], ...updates }
        scheduleSave()
        return db.users[idx]
    },
}

export const dbHabits = {
    findByUser: (userId: string) => db.habits.filter((h) => h.userId === userId),
    findById: (id: string) => db.habits.find((h) => h.id === id),
    create: (habit: Habit) => {
        db.habits.push(habit)
        scheduleSave()
        return habit
    },
    update: (id: string, updates: Partial<Habit>) => {
        const idx = db.habits.findIndex((h) => h.id === id)
        if (idx === -1) return null
        db.habits[idx] = { ...db.habits[idx], ...updates }
        scheduleSave()
        return db.habits[idx]
    },
    delete: (id: string) => {
        const before = db.habits.length
        db.habits = db.habits.filter((h) => h.id !== id)
        scheduleSave()
        return db.habits.length < before
    },
}

export const dbCompletions = {
    findByUser: (userId: string) =>
        db.completions.filter((c) => c.userId === userId),
    findByHabit: (habitId: string) =>
        db.completions.filter((c) => c.habitId === habitId),
    findOne: (habitId: string, date: string) =>
        db.completions.find((c) => c.habitId === habitId && c.date === date),
    create: (completion: HabitCompletion) => {
        db.completions.push(completion)
        scheduleSave()
        return completion
    },
    update: (id: string, updates: Partial<HabitCompletion>) => {
        const idx = db.completions.findIndex((c) => c.id === id)
        if (idx === -1) return null
        db.completions[idx] = { ...db.completions[idx], ...updates }
        scheduleSave()
        return db.completions[idx]
    },
    delete: (id: string) => {
        const before = db.completions.length
        db.completions = db.completions.filter((c) => c.id !== id)
        scheduleSave()
        return db.completions.length < before
    },
    deleteByHabit: (habitId: string) => {
        db.completions = db.completions.filter((c) => c.habitId !== habitId)
        scheduleSave()
    },
}
