import { Router } from 'express'
import {
    getHabits,
    createHabit,
    getHabit,
    updateHabit,
    archiveHabit,
    unarchiveHabit,
    deleteHabit,
} from '../controllers/habits.controller.js'
import { authMiddleware } from '../middleware/auth.middleware.js'

const router = Router()

// All habit routes require authentication
router.use(authMiddleware)

router.get('/', getHabits)
router.post('/', createHabit)
router.get('/:id', getHabit)
router.put('/:id', updateHabit)
router.patch('/:id/archive', archiveHabit)
router.patch('/:id/unarchive', unarchiveHabit)
router.delete('/:id', deleteHabit)

export default router
