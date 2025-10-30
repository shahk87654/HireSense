import { Router } from 'express'
import { addReferral, getReferrals } from '../controllers/referralController.js'
import { protect } from '../middleware/authMiddleware.js'

const router = Router()

router.post('/', protect, addReferral)
router.get('/', protect, getReferrals)

export default router