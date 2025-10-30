import Candidate from '../models/Candidate.js'
import DiversityMetric from '../models/DiversityMetric.js'
import { analyzeDiversity } from '../services/aiServiceGemini.js'

// GET /api/diversity
export const getDiversity = async (req, res) => {
  try {
    const candidates = await Candidate.find()

    // Prepare anonymized data to send to AI (only fields needed)
    const anonymized = candidates.map(c => ({
      gender: c.gender || 'Unknown',
      education: c.education || 'Unknown',
      location: c.location || 'Unknown'
    }))

    const analysis = await analyzeDiversity(anonymized)

    // Expected analysis: { genderDistribution: {...}, educationDistribution: {...}, locationDistribution: {...}, diversityIndex }
    const metric = new DiversityMetric({
      genderDistribution: analysis.genderDistribution,
      educationDistribution: analysis.educationDistribution,
      locationDistribution: analysis.locationDistribution,
      diversityIndex: typeof analysis.diversityIndex === 'number' ? analysis.diversityIndex : analysis.index || 0
    })

    await metric.save()
    res.json({ success: true, metric })
  } catch (err) {
    console.error('getDiversity error', err)
    res.status(500).json({ success: false, message: 'Diversity analysis failed' })
  }
}