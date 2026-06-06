import { Router } from 'express'
import {
    getCompletions,
    toggleCompletion,
    updateNote,
} from '../controllers/completions.controller.js'
import { authMiddleware } from '../middleware/auth.middleware.js'

const router = Router()

// All completion routes require authentication
router.use(authMiddleware)

router.get('/', getCompletions)
router.post('/toggle', toggleCompletion)
router.put('/note', updateNote)

export default router
