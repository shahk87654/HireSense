import { Router } from 'express'
import { getDiversity } from '../controllers/diversityController.js'
import { protect } from '../middleware/authMiddleware.js'

const router = Router()

router.get('/', protect, getDiversity)

export default router