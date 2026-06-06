import { Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import type { AuthRequest, AuthTokenPayload } from '../types/index.js'

const JWT_SECRET = process.env.JWT_SECRET ?? 'fallback_secret'

export function authMiddleware(
    req: AuthRequest,
    res: Response,
    next: NextFunction
): void {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ message: 'Missing or invalid Authorization header' })
        return
    }

    const token = authHeader.slice(7)

    try {
        const payload = jwt.verify(token, JWT_SECRET) as AuthTokenPayload
        req.userId = payload.userId
        req.userEmail = payload.email
        next()
    } catch {
        res.status(401).json({ message: 'Token expired or invalid' })
    }
}
