import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import authRoutes from './routes/auth.routes.js'
import habitsRoutes from './routes/habits.routes.js'
import completionsRoutes from './routes/completions.routes.js'

const app = express()
const PORT = process.env.PORT ?? 3000

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(
    cors({
        origin: [
            'http://localhost:5173',
            'http://localhost:5174',
            'http://localhost:4173',
        ],
        credentials: true,
    })
)
app.use(express.json())

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes)
app.use('/api/habits', habitsRoutes)
app.use('/api/completions', completionsRoutes)

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// ── 404 handler ───────────────────────────────────────────────────────────────
app.use((_req, res) => {
    res.status(404).json({ message: 'Not found' })
})

// ── Start ─────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
    console.log(`🚀 Ignite API running at http://localhost:${PORT}`)
    console.log(`   Auth  : http://localhost:${PORT}/api/auth`)
    console.log(`   Habits: http://localhost:${PORT}/api/habits`)
    console.log(`   Health: http://localhost:${PORT}/api/health`)
})
