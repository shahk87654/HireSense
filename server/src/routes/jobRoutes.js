import { Router } from 'express'
import { 
  getJobDescriptions, 
  getJobDescription,
  createJobDescription, 
  updateJobDescription, 
  deleteJobDescription 
} from '../controllers/jobController.js'
import { protect } from '../middleware/authMiddleware.js'

const router = Router()

router.get('/', protect, getJobDescriptions)
router.get('/:id', protect, getJobDescription)
router.post('/', protect, createJobDescription)
router.put('/:id', protect, updateJobDescription)
router.delete('/:id', protect, deleteJobDescription)

export default router