import { analyzeCultureFit } from '../services/aiServiceGemini.js'
import CultureFit from '../models/CultureFit.js'

// POST /api/culture
// Body: { candidate: { ... }, cultureStatement: string }
export const analyzeFit = async (req, res) => {
  try {
    const { candidate, cultureStatement } = req.body
    if (!candidate || !cultureStatement) return res.status(400).json({ success: false, message: 'Missing candidate or culture statement' })

    const analysis = await analyzeCultureFit(candidate, cultureStatement)

    const doc = new CultureFit({
      candidateName: analysis.name || candidate.name || 'Unknown',
      fitScore: typeof analysis.fitScore === 'number' ? analysis.fitScore : parseInt(analysis.fitScore) || 0,
      explanation: analysis.explanation || analysis.reason || ''
    })

    await doc.save()
    res.json({ success: true, cultureFit: doc })
  } catch (err) {
    console.error('analyzeFit error', err)
    res.status(500).json({ success: false, message: 'Culture fit analysis failed' })
  }
}