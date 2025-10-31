import { Router } from 'express'
import { searchTalent, bulkResumeAnalysis } from '../controllers/talentController.js'
import { protect } from '../middleware/authMiddleware.js'
import multer from 'multer'

const router = Router()
const upload = multer({ storage: multer.memoryStorage() })

router.post('/search', protect, searchTalent)
router.post('/bulk-analyze', protect, upload.array('resumes'), bulkResumeAnalysis)

export default router
