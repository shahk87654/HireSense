import { getGeminiConfig } from '../config/gemini.js'
import cosineSimilarity from '../utils/helpers.js'

// Gemini-first AI service: uses Gemini/Vertex if configured, otherwise
// returns safe demo fallbacks. OpenAI/GPT usage has been removed per request.

const callGemini = async (prompt, options = {}) => {
  const configs = getGeminiConfig()
  if (!configs || configs.length === 0) return null

  let lastError = null

  // Try each model configuration in order
  for (const cfg of configs) {
    try {
      // If configured to use API key (Google), use the appropriate API endpoint.
      if (cfg.useApiKey) {
        const modelName = cfg.model.replace(/^\/+/, '')
        const url = `${cfg.apiUrl}?key=${encodeURIComponent(cfg.apiKey)}`

        let body
        if (cfg.isPalm) {
          // PaLM API format
          body = {
            prompt: { text: prompt },
            temperature: options.temperature ?? 0.2,
            candidateCount: 1
          }
        } else {
          // Gemini API format
          body = {
            contents: [{
              parts: [{
                text: prompt
              }]
            }],
            generationConfig: {
              temperature: options.temperature ?? 0.2,
              maxOutputTokens: 2048
            }
          }
        }

        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        })

        if (!res.ok) {
          const t = await res.text()
          lastError = new Error(`Gemini request failed for ${modelName}: ${res.status} ${t}`)
          continue // Try next model
        }

        const data = await res.json()
        if (cfg.isPalm) {
          // PaLM response format
          if (data.candidates && Array.isArray(data.candidates) && data.candidates[0]) {
            const candidate = data.candidates[0]
            if (candidate.output) return candidate.output
          }
        } else {
          // Gemini response format
          if (data.candidates && Array.isArray(data.candidates) && data.candidates[0]) {
            const candidate = data.candidates[0]
            if (candidate.content && candidate.content.parts && candidate.content.parts[0]) {
              return candidate.content.parts[0].text
            }
          }
        }
        return JSON.stringify(data)
      }

      // Generic endpoint mode (GEMINI_API_URL). Use Bearer token.
      const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${cfg.apiKey}` }
      const body = { prompt, model: options.model || cfg.model }
      const res = await fetch(cfg.apiUrl, { method: 'POST', headers, body: JSON.stringify(body) })
      if (!res.ok) {
        const t = await res.text()
        lastError = new Error(`Gemini request failed: ${res.status} ${t}`)
        continue // Try next model
      }
      const data = await res.json()
      if (data.text) return data.text
      if (data.output && typeof data.output === 'string') return data.output
      if (data.candidates && Array.isArray(data.candidates)) {
        const c0 = data.candidates[0]
        if (c0.output) return c0.output
        if (c0.content) return c0.content
      }
      return JSON.stringify(data)
    } catch (e) {
      lastError = e
      continue // Try next model
    }
  }

  // If all models failed, log the last error and return null
  if (lastError) {
    console.error('All Gemini models failed, last error:', lastError.message)
  }
  return null
}

const isGeminiAvailable = () => {
  try { return !!getGeminiConfig() } catch { return false }
}

export const analyzeResume = async (resumeText, jobDescription) => {
  const prompt = `Analyze the following resume and job description. Extract key skills, experience, and education. Assign a Fit Score (0-100) and return JSON: { name, skills[], experience_summary, education, fit_score, reason }\n\nResume:\n${resumeText}\n\nJob Description:\n${jobDescription}`

  if (isGeminiAvailable()) {
    const gresp = await callGemini(prompt)
    if (gresp) {
      try { return JSON.parse(gresp) } catch {
        return {
          name: 'Gemini Candidate',
          skills: [],
          experience_summary: (gresp || '').slice(0, 200),
          education: 'Unknown',
          fit_score: 50,
          reason: 'Gemini free-text response'
        }
      }
    }
  }

  return {
    name: 'Demo Candidate',
    skills: ['JavaScript', 'React', 'Node.js'],
    experience_summary: 'Experienced frontend developer',
    education: 'BSc Computer Science',
    fit_score: 85,
    reason: 'Fallback demo response'
  }
}

export const analyzeDiversity = async (candidateArray) => {
  const prompt = `Analyze candidate data for diversity metrics: ${JSON.stringify(candidateArray)}`
  if (isGeminiAvailable()) {
    const gresp = await callGemini(prompt)
    if (gresp) {
      try { return JSON.parse(gresp) } catch { /* fall back */ }
    }
  }
  return {
    genderDistribution: [ { name: 'Male', value: 60 }, { name: 'Female', value: 40 } ],
    educationDistribution: [ { name: 'BSc', value: 45 }, { name: 'MSc', value: 35 }, { name: 'PhD', value: 20 } ],
    index: 0.72
  }
}

export const searchTalent = async (query, candidates) => {
  if (isGeminiAvailable()) {
    const tryResp = await callGemini(JSON.stringify({ purpose: 'embeddings', query, candidates }))
    if (tryResp) {
      try {
        const parsed = JSON.parse(tryResp)
        if (Array.isArray(parsed)) {
          const queryVector = parsed[0]
          const candidateVectors = parsed.slice(1)
          const ranked = candidates.map((c, i) => ({ ...c, score: cosineSimilarity(queryVector, candidateVectors[i]) })).sort((a,b)=>b.score-a.score)
          return ranked.slice(0,10)
        }
      } catch {
        // continue to fallback
      }
    }
  }

  const qterms = (query || '').toLowerCase().split(/\W+/).filter(Boolean)
  const ranked = (candidates || []).map(c => {
    const skills = (c.skills || []).join(' ').toLowerCase()
    const score = qterms.reduce((acc, t) => acc + (skills.includes(t) ? 1 : 0), 0)
    return { ...c, score }
  }).sort((a,b)=>b.score-a.score)
  return ranked.slice(0,10)
}

export const analyzeCultureFit = async (candidate, cultureStatement) => {
  const prompt = `Analyze culture fit between: Candidate: ${JSON.stringify(candidate)} \nCulture: ${cultureStatement}`
  if (isGeminiAvailable()) {
    const gresp = await callGemini(prompt)
    if (gresp) {
      try { return JSON.parse(gresp) } catch { return { fitScore: 60, explanation: (gresp||'').slice(0,200) } }
    }
  }
  return { fitScore: 75, explanation: 'Demo culture fit analysis' }
}
