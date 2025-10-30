import { Router } from 'express'
import { analyzeFit } from '../controllers/cultureController.js'
import { protect } from '../middleware/authMiddleware.js'

const router = Router()

router.post('/', protect, analyzeFit)

export default router