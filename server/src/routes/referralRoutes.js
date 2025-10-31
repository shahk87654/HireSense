import { Router } from 'express'
import { addReferral, getReferrals, updateReferralStatus, deleteReferral, addReferralPublic } from '../controllers/referralController.js'
import { protect } from '../middleware/authMiddleware.js'

const router = Router()

// Protected routes (require authentication)
router.post('/', protect, addReferral)
router.get('/', protect, getReferrals)
router.put('/:id/status', protect, updateReferralStatus)
router.delete('/:id', protect, deleteReferral)

// Public route for employee referrals (no authentication required)
router.post('/public', addReferralPublic)

export default router
