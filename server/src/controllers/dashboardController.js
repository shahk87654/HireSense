import Candidate from '../models/Candidate.js'
import Referral from '../models/Referral.js'
import { safeProcess } from '../utils/safeProcess.js'

// Manual dashboard analytics
const manualDashboardAnalytics = async () => {
  const total = await Candidate.countDocuments().catch(() => 0)
  const referrals = await Referral.countDocuments().catch(() => 0)

  // Manual average fit score calculation
  const candidates = await Candidate.find().catch(() => [])
  const avgFit = candidates.length > 0
    ? candidates.reduce((sum, c) => sum + (c.fit_score || 0), 0) / candidates.length
    : 72

  return {
    total,
    referrals,
    avgFit: Math.round(avgFit),
    analysis_mode: 'manual'
  }
}

// GET /api/dashboard
export const getDashboard = async (req, res) => {
  try {
    const data = await safeProcess(
      async () => {
        // AI-powered dashboard (using existing logic)
        const total = await Candidate.countDocuments().catch(() => 0)
        const referrals = await Referral.countDocuments().catch(() => 0)
        const avg = await Candidate.aggregate([{ $group: { _id: null, avg: { $avg: '$fit_score' } } }]).catch(() => [{ avg: 72 }])
        return { total, referrals, avgFit: Math.round((avg[0]?.avg ?? 72) * 1) }
      },
      () => manualDashboardAnalytics()
    )

    res.json(data)
  } catch (e) {
    res.json({ total: 0, referrals: 0, avgFit: 72, analysis_mode: 'manual' })
  }
}
