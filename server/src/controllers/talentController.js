import Candidate from '../models/Candidate.js'
import { searchTalent as aiSearchTalent } from '../services/aiServiceGemini.js'

// POST /api/talent/search
// Body: { q: string }
export const searchTalent = async (req, res) => {
  try {
    const { q } = req.body
    if (!q) return res.status(400).json({ success: false, message: 'Query required' })

    const candidates = await Candidate.find()

  const results = await aiSearchTalent(q, candidates)

    // aiService.searchTalent returns ranked candidates with a `score` property (similarity).
    const formatted = results.map(r => ({
      name: r.name,
      skills: r.skills || [],
      location: r.location || r.location,
      fit_score: typeof r.score === 'number' ? Math.round(r.score * 100) / 100 : r.fit_score || 0
    }))

    res.json({ success: true, candidates: formatted.slice(0, 10) })
  } catch (err) {
    console.error('searchTalent error', err)
    res.status(500).json({ success: false, message: 'Talent search failed' })
  }
}