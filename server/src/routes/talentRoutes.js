import { Router } from 'express'
import { searchTalent } from '../controllers/talentController.js'
import { protect } from '../middleware/authMiddleware.js'

const router = Router()

router.post('/search', protect, searchTalent)

export default router