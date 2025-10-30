import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import rateLimit from 'express-rate-limit'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import { connectDB } from './config/db.js'
import authRoutes from './routes/authRoutes.js'
import resumeRoutes from './routes/resumeRoutes.js'
import referralRoutes from './routes/referralRoutes.js'
import diversityRoutes from './routes/diversityRoutes.js'
import talentRoutes from './routes/talentRoutes.js'
import cultureRoutes from './routes/cultureRoutes.js'
import jobRoutes from './routes/jobRoutes.js'

dotenv.config()
const app = express()

app.use(helmet())
app.use(cors({ origin: true, credentials: true }))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(morgan('dev'))

const limiter = rateLimit({ windowMs: 1 * 60 * 1000, max: 120 })
app.use(limiter)

// Connect DB (optional)
connectDB().catch((err) => console.warn('DB connect failed:', err.message))

app.use('/api/auth', authRoutes)
app.use('/api/resume', resumeRoutes)
app.use('/api/referrals', referralRoutes)
app.use('/api/diversity', diversityRoutes)
app.use('/api/talent', talentRoutes)
app.use('/api/culturefit', cultureRoutes)
app.use('/api/jobs', jobRoutes)

app.get('/api/dashboard', async (req, res) => {
  // Lightweight summary endpoint
  try {
    const Candidate = (await import('./models/Candidate.js')).default
    const Referral = (await import('./models/Referral.js')).default
    const total = await Candidate.countDocuments().catch(() => 0)
    const referrals = await Referral.countDocuments().catch(() => 0)
    // average fit
    const avg = await Candidate.aggregate([{ $group: { _id: null, avg: { $avg: '$fit_score' } } }]).catch(() => [{ avg: 72 }])
    res.json({ total, referrals, avgFit: Math.round((avg[0]?.avg ?? 72) * 1) })
  } catch (e) {
    res.json({ total: 0, referrals: 0, avgFit: 72 })
  }
})

app.use((req, res) => res.status(404).json({ message: 'Not Found' }))

export default app
