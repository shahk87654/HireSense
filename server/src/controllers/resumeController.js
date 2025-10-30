import multer from 'multer'
import { PDFExtract } from 'pdf.js-extract'
import Candidate from '../models/Candidate.js'
import JobDescription from '../models/JobDescription.js'
import { analyzeResume } from '../services/aiServiceGemini.js'

const pdfExtract = new PDFExtract()
const upload = multer({ storage: multer.memoryStorage() })

export const uploadMiddleware = upload.array('resumes', 10)

// POST /api/resume/upload
export const uploadResume = async (req, res) => {
  try {
    if (!req.files || !Array.isArray(req.files)) {
      return res.status(400).json({ success: false, message: 'No resume files uploaded' })
    }

    const { jobId } = req.body
    if (!jobId) {
      return res.status(400).json({ success: false, message: 'Job ID is required' })
    }

    const jobDescription = await JobDescription.findById(jobId)
    if (!jobDescription) {
      return res.status(404).json({ success: false, message: 'Job description not found' })
    }

    const results = []

    for (const file of req.files) {
      try {
        // Extract text from PDF buffer
        const data = await pdfExtract.extractBuffer(file.buffer)
        const resumeText = data.pages.map(p => p.content.map(c => c.str).join(' ')).join('\n')

        // Analyze with AI
        const analysis = await analyzeResume(resumeText, jobDescription)

        // Store candidate data
        const candidateData = {
          name: analysis.name || file.originalname.replace(/\.pdf$/i, ''),
          email: analysis.email,
          skills: analysis.skills || [],
          experience_summary: analysis.experience_summary || '',
          education: analysis.education || '',
          fit_score: typeof analysis.fit_score === 'number' ? analysis.fit_score : parseInt(analysis.fit_score) || 0,
          reason: analysis.reason || ''
        }

        const candidate = new Candidate(candidateData)
        await candidate.save()
        results.push(candidate)
      } catch (err) {
        console.error('Error processing file:', file.originalname, err)
        results.push({
          name: file.originalname,
          fit_score: 0,
          skills: [],
          reason: 'Failed to process PDF'
        })
      }
    }

    // Return ranked results
    results.sort((a, b) => (b.fit_score || 0) - (a.fit_score || 0))
    res.json({ success: true, candidates: results })
  } catch (err) {
    console.error('uploadResume error:', err)
    res.status(500).json({ success: false, message: 'Resume upload failed' })
  }
}

// POST /api/resume/reanalyze
export const reanalyzeResume = async (req, res) => {
  try {
    const { id, jobId } = req.body
    if (!id) return res.status(400).json({ success: false, message: 'Missing candidate ID' })
    if (!jobId) return res.status(400).json({ success: false, message: 'Missing job ID' })

    const [candidate, jobDescription] = await Promise.all([
      Candidate.findById(id),
      JobDescription.findById(jobId)
    ])

    if (!candidate) return res.status(404).json({ success: false, message: 'Candidate not found' })
    if (!jobDescription) return res.status(404).json({ success: false, message: 'Job description not found' })

    // Re-analyze with current job description
    const analysis = await analyzeResume(candidate.experience_summary, jobDescription.description)
    
    candidate.fit_score = typeof analysis.fit_score === 'number' ? analysis.fit_score : parseInt(analysis.fit_score) || candidate.fit_score
    candidate.reason = analysis.reason || candidate.reason
    candidate.jobId = jobId // Track which job this analysis is for
    await candidate.save()

    res.json({ success: true, candidate })
  } catch (err) {
    console.error('reanalyzeResume error:', err)
    res.status(500).json({ success: false, message: 'Resume reanalysis failed' })
  }
}