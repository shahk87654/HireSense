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

import talentRoutes from './routes/talentRoutes.js'
import cultureRoutes from './routes/cultureRoutes.js'
import jobRoutes from './routes/jobRoutes.js'
import dashboardRoutes from './routes/dashboardRoutes.js'

dotenv.config({ path: './.env' })
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

app.use('/api/talent', talentRoutes)
app.use('/api/culturefit', cultureRoutes)
app.use('/api/jobs', jobRoutes)
app.use('/api/dashboard', dashboardRoutes)



app.get('/api/dashboard', async (req, res) => {
  // Lightweight summary endpoint
  try {
    const Candidate = (await import('./models/Candidate.js')).default
    const Referral = (await import('./models/Referral.js')).default
    const total = await Candidate.countDocuments().catch(() => 0)
    const referrals = await Referral.countDocuments().catch(() => 0)
    // average fit
    const avg = await Candidate.aggregate([{ $group: { _id: null, avg: { $avg: '$fit_score' } } }]).catch(() => [{ avg: 72 }])
    res.json({
      totalCandidates: total,
      averageFitScore: Math.round((avg[0]?.avg ?? 72) * 1),
      referrals: referrals,
      analysis_mode: process.env.AI_MODE === 'false' ? 'manual' : 'ai'
    })
  } catch (e) {
    res.json({ totalCandidates: 0, averageFitScore: 72, referrals: 0, analysis_mode: 'manual' })
  }
})

app.get('/api/status', (req, res) => {
  const { getAIMode } = require('./utils/safeProcess.js')
  res.json({ ai_mode: getAIMode() })
})

app.use((req, res) => res.status(404).json({ message: 'Not Found' }))

export default app
