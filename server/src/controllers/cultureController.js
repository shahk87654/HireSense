import { analyzeCultureFit } from '../services/aiServiceGemini.js'
import CultureFit from '../models/CultureFit.js'
import { safeProcess } from '../utils/safeProcess.js'

// Manual culture fit analysis function
const manualCultureFitAnalysis = (candidate, cultureStatement) => {
  const candidateText = `${candidate.name || ''} ${candidate.skills?.join(' ') || ''} ${candidate.experience_summary || ''}`.toLowerCase()
  const cultureKeywords = cultureStatement.toLowerCase().split(/\W+/).filter(word =>
    word.length > 2 && !['and', 'the', 'for', 'with', 'from', 'this', 'that', 'will', 'have', 'been'].includes(word)
  )

  const matches = cultureKeywords.filter(keyword => candidateText.includes(keyword)).length
  const fitScore = Math.min(100, (matches / cultureKeywords.length) * 100)

  return {
    name: candidate.name || 'Unknown',
    fitScore: Math.round(fitScore),
    explanation: `Found ${matches} out of ${cultureKeywords.length} culture keywords in candidate profile.`,
    analysis_mode: 'manual'
  }
}

// POST /api/culture
// Body: { candidate: { ... }, cultureStatement: string } or { text: string }
export const analyzeFit = async (req, res) => {
  try {
    let { candidate, cultureStatement, text } = req.body

    // Handle legacy payload where only 'text' is sent
    if (text && !candidate) {
      candidate = {
        name: 'Candidate',
        skills: [],
        experience_summary: text
      }
    }

    // Default culture statement if not provided - focus on experiences and interpersonal skills
    if (!cultureStatement) {
      cultureStatement = 'We seek candidates with strong interpersonal skills including communication, teamwork, leadership, and emotional intelligence. Experience in collaborative environments, mentoring, stakeholder management, and relationship building is highly valued. We prioritize candidates who demonstrate adaptability, conflict resolution, and the ability to work effectively with diverse teams.'
    }

    if (!candidate || !cultureStatement) return res.status(400).json({ success: false, message: 'Missing candidate or culture statement' })

    const analysis = await safeProcess(
      () => analyzeCultureFit(candidate, cultureStatement),
      () => manualCultureFitAnalysis(candidate, cultureStatement)
    )

    const doc = new CultureFit({
      candidateName: analysis.name || candidate.name || 'Unknown',
      fitScore: typeof analysis.fitScore === 'number' ? analysis.fitScore : parseInt(analysis.fitScore) || 0,
      explanation: analysis.explanation || analysis.reason || '',
      analysis_mode: analysis.analysis_mode || 'manual'
    })

    await doc.save()
    res.json({ success: true, cultureFit: doc, score: doc.fitScore })
  } catch (err) {
    console.error('analyzeFit error', err)
    res.status(500).json({ success: false, message: 'Culture fit analysis failed' })
  }
}
