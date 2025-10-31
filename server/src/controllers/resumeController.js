import multer from 'multer'
import { PDFExtract } from 'pdf.js-extract'
import Candidate from '../models/Candidate.js'
import JobDescription from '../models/JobDescription.js'
import { analyzeResume } from '../services/aiServiceGemini.js'
import { safeProcess } from '../utils/safeProcess.js'

const pdfExtract = new PDFExtract()
const upload = multer({ storage: multer.memoryStorage() })

export const uploadMiddleware = upload.array('resumes', 10)

// Manual resume analysis function - Strict Job Description Matching
const manualResumeAnalysis = (resumeText, jobDescription) => {
  const resumeLower = resumeText.toLowerCase()
  const jobLower = jobDescription.toLowerCase()

  // Extract candidate name
  const nameMatch = resumeText.match(/^([^\n\r]{1,50})/m) || resumeText.match(/name:?\s*([^\n\r]{1,50})/i)
  const name = nameMatch ? nameMatch[1].trim() : 'Unknown Candidate'

  // Extract critical job requirements - be very selective
  const jobWords = jobLower
    .split(/\W+/)
    .filter(word => {
      return word.length > 2 &&
             !['and', 'the', 'for', 'with', 'from', 'this', 'that', 'will', 'have', 'been', 'are', 'you', 'our', 'team', 'work', 'job', 'role', 'position', 'company', 'looking', 'candidate', 'must', 'should', 'would', 'like', 'able', 'good', 'strong', 'excellent', 'experience', 'knowledge', 'understanding', 'familiarity', 'proficiency', 'responsibilities', 'requirements', 'qualifications', 'preferred', 'required', 'skills', 'ability', 'expertise', 'responsibilities', 'include', 'following', 'duties', 'tasks', 'activities', 'perform', 'develop', 'create', 'build', 'design', 'implement', 'maintain', 'support', 'collaborate', 'work', 'team', 'environment'].includes(word) &&
             !/^\d+$/.test(word)
    })

  // Identify must-have technical skills from job description
  const mustHaveSkills = []
  const niceToHaveSkills = []

  jobWords.forEach(word => {
    // Technical skills that are typically required
    const techSkills = ['javascript', 'python', 'java', 'react', 'node.js', 'nodejs', 'mongodb', 'sql', 'aws', 'docker', 'kubernetes', 'typescript', 'vue', 'angular', 'php', 'ruby', 'c++', 'c#', 'go', 'rust', 'scala', 'kotlin', 'express', 'django', 'flask', 'spring', 'mysql', 'postgresql', 'redis', 'graphql', 'rest', 'api', 'microservices', 'ci/cd', 'jenkins', 'github', 'jira', 'agile', 'scrum', 'html', 'css', 'sass', 'less', 'webpack', 'babel', 'eslint', 'jest', 'mocha', 'selenium', 'git', 'linux', 'windows', 'macos', 'azure', 'gcp', 'firebase', 'heroku']

    if (techSkills.includes(word) || techSkills.some(tech => word.includes(tech) || tech.includes(word))) {
      // Check if it's mentioned as required vs preferred
      const context = jobLower.substring(Math.max(0, jobLower.indexOf(word) - 50), jobLower.indexOf(word) + 50)
      if (context.includes('required') || context.includes('must') || context.includes('essential') || context.includes('experience with')) {
        mustHaveSkills.push(word)
      } else {
        niceToHaveSkills.push(word)
      }
    }
  })

  // Remove duplicates
  const uniqueMustHave = [...new Set(mustHaveSkills)]
  const uniqueNiceToHave = [...new Set(niceToHaveSkills)]

  // Strict skill matching - require exact or very close matches
  const matchedMustHave = []
  const matchedNiceToHave = []

  uniqueMustHave.forEach(skill => {
    // Require stronger evidence for must-have skills
    const exactMatch = resumeLower.includes(` ${skill} `) || resumeLower.includes(`${skill},`) || resumeLower.includes(`${skill}.`) || resumeLower.includes(`${skill};`)
    const contextMatch = resumeLower.includes(skill) && (
      resumeLower.includes(`experience with ${skill}`) ||
      resumeLower.includes(`proficient in ${skill}`) ||
      resumeLower.includes(`${skill} development`) ||
      resumeLower.includes(`using ${skill}`)
    )

    if (exactMatch || contextMatch) {
      matchedMustHave.push(skill)
    }
  })

  uniqueNiceToHave.forEach(skill => {
    // Less strict for nice-to-have skills
    if (resumeLower.includes(skill)) {
      matchedNiceToHave.push(skill)
    }
  })

  // Calculate skill score - be very strict
  const mustHaveScore = matchedMustHave.length === uniqueMustHave.length ? 50 : Math.round((matchedMustHave.length / Math.max(uniqueMustHave.length, 1)) * 40)
  const niceToHaveScore = Math.round((matchedNiceToHave.length / Math.max(uniqueNiceToHave.length, 1)) * 20)
  const skillScore = mustHaveScore + niceToHaveScore

  // Strict experience matching
  let experienceScore = 0
  const experiencePatterns = [
    /(\d+)\+?\s*years?\s*(?:of\s*)?(?:professional\s*)?experience/i,
    /(\d+)\+?\s*years?\s*in\s*(?:software|web|frontend|backend|full.?stack|development)/i,
    /experience:?\s*(\d+)\+?\s*years?/i
  ]

  let candidateExperience = 0
  for (const pattern of experiencePatterns) {
    const match = resumeText.match(pattern)
    if (match) {
      candidateExperience = Math.max(candidateExperience, parseInt(match[1]))
    }
  }

  // Extract required experience from job description
  const jobExpPatterns = [
    /(\d+)\+?\s*years?\s*(?:of\s*)?(?:professional\s*)?experience\s*(?:required|preferred|minimum)/i,
    /(?:minimum|at least)\s*(\d+)\+?\s*years?/i,
    /experience:\s*(\d+)\+?\s*years?/i
  ]

  let requiredExperience = 0
  for (const pattern of jobExpPatterns) {
    const match = jobDescription.match(pattern)
    if (match) {
      requiredExperience = Math.max(requiredExperience, parseInt(match[1]))
    }
  }

  // Strict experience scoring
  if (requiredExperience > 0) {
    if (candidateExperience >= requiredExperience) {
      experienceScore = 30 // Full credit for meeting requirement
    } else if (candidateExperience >= requiredExperience * 0.9) {
      experienceScore = 20 // Close but not quite
    } else if (candidateExperience >= requiredExperience * 0.7) {
      experienceScore = 10 // Partial credit
    } else {
      experienceScore = 0 // Not enough experience
    }
  } else {
    // No specific requirement mentioned, give modest points for experience
    experienceScore = Math.min(15, candidateExperience * 1.2)
  }

  // Final score calculation - strict weighting
  const finalScore = Math.min(100, skillScore + experienceScore)

  // Extract education with strict patterns
  const educationPatterns = [
    /(?:education|degree):?\s*(bachelor|master|phd|associate|diploma)/i,
    /(?:bachelor|master|phd|associate)[\s\S]*?(?:in\s+[\w\s]+)?(?:from\s+[\w\s]+)?$/im,
    /(?:university|college|institute):?\s*([\s\S]*?)(?:\n|$)/i
  ]

  let education = 'Not specified'
  for (const pattern of educationPatterns) {
    const match = resumeText.match(pattern)
    if (match && match[1]) {
      education = match[1].trim()
      break
    }
  }

  // Build detailed reason
  const mustHaveMet = matchedMustHave.length === uniqueMustHave.length
  const reason = `Must-have skills: ${matchedMustHave.length}/${uniqueMustHave.length} matched. Nice-to-have: ${matchedNiceToHave.length}/${uniqueNiceToHave.length}. Experience: ${candidateExperience} years (required: ${requiredExperience}). ${mustHaveMet ? 'Meets core requirements.' : 'Missing critical skills.'}`

  return {
    name: name,
    skills: [...matchedMustHave, ...matchedNiceToHave].slice(0, 15),
    experience_summary: resumeText.slice(0, 400),
    education: education,
    fit_score: finalScore,
    reason: reason,
    analysis_mode: 'manual'
  }
}

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

        // Analyze with AI or manual fallback
        const analysis = await safeProcess(
          () => analyzeResume(resumeText, jobDescription),
          () => manualResumeAnalysis(resumeText, jobDescription.description)
        )

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
    const analysis = await safeProcess(
      () => analyzeResume(candidate.experience_summary, jobDescription.description),
      () => manualResumeAnalysis(candidate.experience_summary, jobDescription.description)
    )
    
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