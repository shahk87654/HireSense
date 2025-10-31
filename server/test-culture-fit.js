// Test script for culture fit assessment in talent discovery
import fs from 'fs'

// Copy the function directly to avoid import issues
const manualResumeAnalysis = (resumeText, jobDescription) => {
  const resumeLower = resumeText.toLowerCase()
  const jobLower = jobDescription.toLowerCase()

  // Extract candidate name
  const nameMatch = resumeText.match(/^([^\n\r]{1,50})/m) || resumeText.match(/name:?\s*([^\n\r]{1,50})/i)
  const name = nameMatch ? nameMatch[1].trim() : 'Unknown Candidate'

  // Enhanced skill extraction from job description
  const techSkills = {
    'javascript': ['js', 'javascript', 'ecmascript'],
    'python': ['python', 'py'],
    'java': ['java'],
    'react': ['react', 'reactjs'],
    'node.js': ['node', 'nodejs', 'node.js'],
    'mongodb': ['mongodb', 'mongo'],
    'sql': ['sql', 'mysql', 'postgresql', 'oracle'],
    'aws': ['aws', 'amazon web services'],
    'docker': ['docker'],
    'kubernetes': ['kubernetes', 'k8s'],
    'typescript': ['typescript', 'ts'],
    'vue': ['vue', 'vuejs'],
    'angular': ['angular'],
    'php': ['php'],
    'ruby': ['ruby'],
    'c++': ['c++', 'cpp'],
    'c#': ['c#', 'csharp'],
    'go': ['go', 'golang'],
    'rust': ['rust'],
    'scala': ['scala'],
    'kotlin': ['kotlin'],
    'express': ['express', 'expressjs'],
    'django': ['django'],
    'flask': ['flask'],
    'spring': ['spring', 'spring boot'],
    'mysql': ['mysql'],
    'postgresql': ['postgresql', 'postgres'],
    'redis': ['redis'],
    'graphql': ['graphql'],
    'rest': ['rest', 'restful'],
    'api': ['api', 'apis'],
    'microservices': ['microservices'],
    'ci/cd': ['ci/cd', 'ci', 'cd', 'continuous integration', 'continuous deployment'],
    'jenkins': ['jenkins'],
    'github': ['github', 'git'],
    'jira': ['jira'],
    'agile': ['agile', 'scrum', 'kanban'],
    'scrum': ['scrum'],
    'html': ['html'],
    'css': ['css'],
    'sass': ['sass', 'scss'],
    'less': ['less'],
    'webpack': ['webpack'],
    'babel': ['babel'],
    'eslint': ['eslint'],
    'jest': ['jest'],
    'mocha': ['mocha'],
    'selenium': ['selenium'],
    'git': ['git'],
    'linux': ['linux'],
    'windows': ['windows'],
    'macos': ['macos', 'mac'],
    'azure': ['azure'],
    'gcp': ['gcp', 'google cloud'],
    'firebase': ['firebase'],
    'heroku': ['heroku']
  }

  // Extract skills from job description with context
  const mustHaveSkills = []
  const niceToHaveSkills = []

  Object.keys(techSkills).forEach(skill => {
    const variations = techSkills[skill]
    const found = variations.some(v => jobLower.includes(v))
    if (found) {
      const context = jobLower.substring(Math.max(0, jobLower.indexOf(variations[0]) - 100), jobLower.indexOf(variations[0]) + 100)
      if (context.includes('required') || context.includes('must') || context.includes('essential') || context.includes('experience with') || context.includes('strong')) {
        mustHaveSkills.push(skill)
      } else {
        niceToHaveSkills.push(skill)
      }
    }
  })

  // Remove duplicates
  const uniqueMustHave = [...new Set(mustHaveSkills)]
  const uniqueNiceToHave = [...new Set(niceToHaveSkills)]

  // Precise skill matching with scoring
  const matchedMustHave = []
  const matchedNiceToHave = []

  uniqueMustHave.forEach(skill => {
    const variations = techSkills[skill]
    let matchScore = 0
    variations.forEach(v => {
      if (resumeLower.includes(` ${v} `) || resumeLower.includes(`${v},`) || resumeLower.includes(`${v}.`) || resumeLower.includes(`${v};`)) {
        matchScore += 1
      }
      if (resumeLower.includes(`experience with ${v}`) || resumeLower.includes(`proficient in ${v}`) || resumeLower.includes(`${v} development`) || resumeLower.includes(`using ${v}`)) {
        matchScore += 2
      }
    })
    if (matchScore > 0) {
      matchedMustHave.push({ skill, score: Math.min(3, matchScore) })
    }
  })

  uniqueNiceToHave.forEach(skill => {
    const variations = techSkills[skill]
    let matchScore = 0
    variations.forEach(v => {
      if (resumeLower.includes(v)) matchScore += 1
    })
    if (matchScore > 0) {
      matchedNiceToHave.push({ skill, score: Math.min(2, matchScore) })
    }
  })

  // Calculate precise skill score
  const totalMustHaveScore = matchedMustHave.reduce((sum, m) => sum + m.score, 0)
  const maxMustHaveScore = uniqueMustHave.length * 3
  const mustHaveScore = maxMustHaveScore > 0 ? Math.round((totalMustHaveScore / maxMustHaveScore) * 50) : 0

  const totalNiceToHaveScore = matchedNiceToHave.reduce((sum, m) => sum + m.score, 0)
  const maxNiceToHaveScore = uniqueNiceToHave.length * 2
  const niceToHaveScore = maxNiceToHaveScore > 0 ? Math.round((totalNiceToHaveScore / maxNiceToHaveScore) * 25) : 0

  const skillScore = mustHaveScore + niceToHaveScore

  // Enhanced experience matching
  let candidateExperience = 0
  const experiencePatterns = [
    /(\d+(?:\.\d+)?)\+?\s*years?\s*(?:of\s*)?(?:professional\s*)?experience/i,
    /(\d+(?:\.\d+)?)\+?\s*years?\s*in\s*(?:software|web|frontend|backend|full.?stack|development)/i,
    /experience:?\s*(\d+(?:\.\d+)?)\+?\s*years?/i,
    /(\d+(?:\.\d+)?)\s*years?\s*work/i
  ]

  for (const pattern of experiencePatterns) {
    const matches = resumeText.match(new RegExp(pattern, 'gi'))
    if (matches) {
      matches.forEach(match => {
        const numMatch = match.match(/(\d+(?:\.\d+)?)/)
        if (numMatch) {
          candidateExperience = Math.max(candidateExperience, parseFloat(numMatch[1]))
        }
      })
    }
  }

  // Extract required experience from job description
  let requiredExperience = 0
  const jobExpPatterns = [
    /(\d+(?:\.\d+)?)\+?\s*years?\s*(?:of\s*)?(?:professional\s*)?experience\s*(?:required|preferred|minimum)/i,
    /(?:minimum|at least)\s*(\d+(?:\.\d+)?)\+?\s*years?/i,
    /experience:\s*(\d+(?:\.\d+)?)\+?\s*years?/i
  ]

  for (const pattern of jobExpPatterns) {
    const match = jobDescription.match(pattern)
    if (match) {
      requiredExperience = Math.max(requiredExperience, parseFloat(match[1]))
    }
  }

  // Precise experience scoring
  let experienceScore = 0
  if (requiredExperience > 0) {
    const ratio = candidateExperience / requiredExperience
    if (ratio >= 1) {
      experienceScore = 30
    } else if (ratio >= 0.8) {
      experienceScore = 25
    } else if (ratio >= 0.6) {
      experienceScore = 15
    } else if (ratio >= 0.4) {
      experienceScore = 5
    } else {
      experienceScore = 0
    }
  } else {
    experienceScore = Math.min(20, candidateExperience * 2)
  }

  // Education scoring
  let educationScore = 0
  const educationLevels = {
    'phd': 20,
    'doctorate': 20,
    'master': 15,
    'masters': 15,
    'bachelor': 10,
    'bachelors': 10,
    'associate': 5,
    'diploma': 3
  }

  for (const [level, score] of Object.entries(educationLevels)) {
    if (resumeLower.includes(level)) {
      educationScore = Math.max(educationScore, score)
      break
    }
  }

  // Culture fit assessment
  let cultureFitScore = 0
  const cultureIndicators = {
    // Team collaboration
    'team player': 3, 'teamwork': 3, 'collaboration': 3, 'collaborative': 3,
    'team environment': 3, 'team-oriented': 3, 'group projects': 2,

    // Leadership
    'leadership': 4, 'led': 3, 'managed': 3, 'mentored': 3, 'supervised': 3,
    'team lead': 4, 'project lead': 4, 'senior developer': 3,

    // Innovation and creativity
    'innovative': 3, 'innovation': 3, 'creative': 3, 'creativity': 3,
    'problem solving': 3, 'analytical': 3, 'strategic thinking': 3,

    // Communication
    'communication': 3, 'presentation': 2, 'public speaking': 2,
    'client facing': 2, 'stakeholder': 2,

    // Adaptability
    'adaptable': 3, 'flexible': 3, 'quick learner': 3, 'continuous learning': 3,
    'agile': 2, 'versatile': 2,

    // Work ethic
    'dedicated': 2, 'committed': 2, 'hardworking': 2, 'reliable': 2,
    'responsible': 2, 'accountable': 2,

    // Company values alignment
    'integrity': 3, 'honest': 2, 'ethical': 2, 'transparent': 2,
    'customer focused': 3, 'customer-centric': 3, 'quality': 2,

    // Professional development
    'certifications': 2, 'professional development': 3, 'training': 2,
    'mentoring': 3, 'knowledge sharing': 3
  }

  let cultureMatches = []
  Object.keys(cultureIndicators).forEach(indicator => {
    if (resumeLower.includes(indicator)) {
      cultureMatches.push(indicator)
      cultureFitScore += cultureIndicators[indicator]
    }
  })

  // Cap culture fit score at 20 points
  cultureFitScore = Math.min(20, cultureFitScore)

  // Final precise score calculation with culture fit
  const finalScore = Math.min(100, skillScore + experienceScore + educationScore + cultureFitScore)

  // Extract education string
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
  const matchedSkills = [...matchedMustHave.map(m => m.skill), ...matchedNiceToHave.map(m => m.skill)]
  const reason = `Skills matched: ${matchedSkills.join(', ')}. Experience: ${candidateExperience} years (required: ${requiredExperience}). Education: ${education}. Culture fit indicators: ${cultureMatches.slice(0, 5).join(', ')}. Precise scoring applied.`

  return {
    name: name,
    skills: matchedSkills.slice(0, 15),
    experience_summary: resumeText, // Include full resume content for complete analysis
    education: education,
    fit_score: finalScore,
    reason: reason,
    analysis_mode: 'manual'
  }
}

// Test data: Different resume texts with various culture indicators
const testResumes = [
  {
    name: 'Team Player Resume',
    text: `John Doe
Software Developer with 5 years experience.
Team player who excels in collaborative environments.
Worked on group projects and contributed to team success.
Skills: JavaScript, React, Node.js`,
    jobDesc: 'Looking for a collaborative team player with JavaScript skills.'
  },
  {
    name: 'Leadership Resume',
    text: `Jane Smith
Senior Developer with 8 years experience.
Leadership experience leading development teams.
Managed projects and mentored junior developers.
Led cross-functional teams to deliver successful products.
Skills: Python, Django, AWS`,
    jobDesc: 'Seeking a leader who can manage teams and deliver projects.'
  },
  {
    name: 'Innovation Resume',
    text: `Bob Johnson
Full Stack Developer with 6 years experience.
Innovative problem solver who develops creative solutions.
Strategic thinking and analytical approach to challenges.
Continuous learning and professional development.
Skills: Java, Spring, MongoDB`,
    jobDesc: 'Need an innovative developer who solves complex problems.'
  },
  {
    name: 'Communication Resume',
    text: `Alice Brown
Frontend Developer with 4 years experience.
Strong communication skills with client-facing experience.
Public speaking at conferences and stakeholder presentations.
Collaborative and transparent in all interactions.
Skills: HTML, CSS, JavaScript, Vue.js`,
    jobDesc: 'Require excellent communication and client interaction skills.'
  },
  {
    name: 'Adaptability Resume',
    text: `Charlie Wilson
DevOps Engineer with 7 years experience.
Highly adaptable and flexible in fast-paced environments.
Quick learner who embraces new technologies.
Versatile across multiple platforms and tools.
Skills: Docker, Kubernetes, CI/CD, Linux`,
    jobDesc: 'Looking for adaptable engineer who learns quickly.'
  },
  {
    name: 'Work Ethic Resume',
    text: `Diana Lee
Backend Developer with 5 years experience.
Dedicated and committed professional.
Reliable and accountable for deliverables.
Hardworking with strong work ethic.
Skills: Node.js, Express, PostgreSQL`,
    jobDesc: 'Need dedicated professional with strong work ethic.'
  },
  {
    name: 'Values Alignment Resume',
    text: `Edward Kim
QA Engineer with 6 years experience.
Integrity and ethical approach to quality assurance.
Customer-focused with commitment to excellence.
Transparent communication and honest feedback.
Skills: Selenium, Jest, API testing`,
    jobDesc: 'Seeking values-aligned professional focused on quality.'
  },
  {
    name: 'Professional Development Resume',
    text: `Fiona Garcia
Mobile Developer with 5 years experience.
Continuous professional development through certifications.
Mentoring junior developers and knowledge sharing.
Training programs and skill enhancement.
Skills: React Native, iOS, Android`,
    jobDesc: 'Looking for developer committed to professional growth.'
  },
  {
    name: 'Edge Case - No Culture Indicators',
    text: `Generic Developer
Basic coding skills.
No special mentions of culture or soft skills.
Skills: Basic programming`,
    jobDesc: 'Basic programming job with no culture requirements.'
  },
  {
    name: 'Edge Case - Maximum Culture Match',
    text: `Super Candidate
Team player, leadership, innovative, communication, adaptable, dedicated, integrity, professional development.
Led teams, mentored, creative solutions, presentations, flexible, committed, ethical, certifications.
All culture indicators present.`,
    jobDesc: 'Perfect culture fit required for leadership role.'
  }
]

// Run tests
console.log('=== Culture Fit Assessment Testing ===\n')

testResumes.forEach((test, index) => {
  console.log(`Test ${index + 1}: ${test.name}`)
  console.log(`Resume: ${test.text.substring(0, 100)}...`)
  console.log(`Job Description: ${test.jobDesc}`)

  try {
    const result = manualResumeAnalysis(test.text, test.jobDesc)
    console.log(`Fit Score: ${result.fit_score}`)
    console.log(`Reason: ${result.reason}`)
    console.log(`Skills Found: ${result.skills.join(', ')}`)
    console.log(`Education: ${result.education}`)
  } catch (error) {
    console.error(`Error in test ${index + 1}:`, error.message)
  }

  console.log('---\n')
})

console.log('Testing completed.')
