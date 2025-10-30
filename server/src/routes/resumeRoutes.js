import { Router } from 'express'
import { uploadResume, reanalyzeResume, uploadMiddleware } from '../controllers/resumeController.js'
import { protect } from '../middleware/authMiddleware.js'

const router = Router()

router.post('/upload', protect, uploadMiddleware, uploadResume)
router.post('/reanalyze', protect, reanalyzeResume)

export default router