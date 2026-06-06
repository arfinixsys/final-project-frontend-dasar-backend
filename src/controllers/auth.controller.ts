import { Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { z } from 'zod'
import { nanoid } from 'nanoid'
import { dbUsers } from '../db/store.js'
import type { AuthRequest, AuthTokenPayload } from '../types/index.js'

const JWT_SECRET = process.env.JWT_SECRET ?? 'fallback_secret'
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN ?? '7d'

// ── Validation schemas ────────────────────────────────────────────────────────
const RegisterSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
})

const LoginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
})

// ── Helpers ───────────────────────────────────────────────────────────────────
function signToken(userId: string, email: string): string {
    const payload: AuthTokenPayload = { userId, email }
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions)
}

// ── POST /auth/register ───────────────────────────────────────────────────────
export async function register(req: Request, res: Response): Promise<void> {
    const parsed = RegisterSchema.safeParse(req.body)

    if (!parsed.success) {
        res.status(400).json({
            message: 'Validation failed',
            errors: parsed.error.flatten().fieldErrors,
        })
        return
    }

    const { name, email, password } = parsed.data

    // Check duplicate email
    const existing = dbUsers.findByEmail(email)
    if (existing) {
        res.status(409).json({ message: 'Email already registered' })
        return
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10)

    // Create user
    const user = dbUsers.create({
        id: nanoid(),
        name,
        email,
        passwordHash,
        createdAt: new Date().toISOString(),
    })

    const token = signToken(user.id, user.email)

    res.status(201).json({
        message: 'Registration successful',
        token,
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            createdAt: user.createdAt,
        },
    })
}

// ── POST /auth/login ──────────────────────────────────────────────────────────
export async function login(req: Request, res: Response): Promise<void> {
    const parsed = LoginSchema.safeParse(req.body)

    if (!parsed.success) {
        res.status(400).json({
            message: 'Validation failed',
            errors: parsed.error.flatten().fieldErrors,
        })
        return
    }

    const { email, password } = parsed.data

    const user = dbUsers.findByEmail(email)
    if (!user) {
        res.status(401).json({ message: 'Invalid email or password' })
        return
    }

    const passwordMatch = await bcrypt.compare(password, user.passwordHash)
    if (!passwordMatch) {
        res.status(401).json({ message: 'Invalid email or password' })
        return
    }

    const token = signToken(user.id, user.email)

    res.json({
        message: 'Login successful',
        token,
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            createdAt: user.createdAt,
        },
    })
}

// ── GET /auth/me ──────────────────────────────────────────────────────────────
export function getMe(req: AuthRequest, res: Response): void {
    const user = dbUsers.findById(req.userId!)
    if (!user) {
        res.status(404).json({ message: 'User not found' })
        return
    }

    res.json({
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
    })
}

// ── PUT /auth/profile ─────────────────────────────────────────────────────────
const UpdateProfileSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').optional(),
    email: z.string().email('Invalid email address').optional(),
    currentPassword: z.string().optional(),
    newPassword: z.string().min(6).optional(),
})

export async function updateProfile(req: AuthRequest, res: Response): Promise<void> {
    const parsed = UpdateProfileSchema.safeParse(req.body)

    if (!parsed.success) {
        res.status(400).json({
            message: 'Validation failed',
            errors: parsed.error.flatten().fieldErrors,
        })
        return
    }

    const { name, email, currentPassword, newPassword } = parsed.data
    const user = dbUsers.findById(req.userId!)

    if (!user) {
        res.status(404).json({ message: 'User not found' })
        return
    }

    // If changing password, verify current password
    if (newPassword) {
        if (!currentPassword) {
            res.status(400).json({ message: 'Current password is required to set a new password' })
            return
        }
        const match = await bcrypt.compare(currentPassword, user.passwordHash)
        if (!match) {
            res.status(401).json({ message: 'Current password is incorrect' })
            return
        }
    }

    // If changing email, check not taken
    if (email && email !== user.email) {
        const taken = dbUsers.findByEmail(email)
        if (taken) {
            res.status(409).json({ message: 'Email already in use' })
            return
        }
    }

    const updates: Record<string, string> = {}
    if (name) updates.name = name
    if (email) updates.email = email
    if (newPassword) updates.passwordHash = await bcrypt.hash(newPassword, 10)

    const updated = dbUsers.update(user.id, updates)!

    res.json({
        message: 'Profile updated',
        user: {
            id: updated.id,
            name: updated.name,
            email: updated.email,
            createdAt: updated.createdAt,
        },
    })
}
