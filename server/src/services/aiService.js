import { getGeminiConfig } from '../config/gemini.js'
import cosineSimilarity from '../utils/helpers.js'

// Gemini-first AI service: uses Gemini/Vertex if configured, otherwise
// returns safe demo fallbacks. OpenAI/GPT usage has been removed per request.

const callGemini = async (prompt, options = {}) => {
  const cfg = getGeminiConfig()
  if (!cfg) return null

  try {
    // If configured to use API key (Google), try project-level then model-level endpoints.
    if (cfg.useApiKey) {
      const modelName = (cfg.model || 'text-bison-001').replace(/^\/+/, '')
      const tryUrls = []
      if (cfg.project) tryUrls.push(`https://generativelanguage.googleapis.com/v1beta2/projects/${cfg.project}/locations/${cfg.location}/${modelName}:generateText`)
      tryUrls.push(`https://generativelanguage.googleapis.com/v1beta2/models/${modelName}:generateText`)

      const body = { prompt: { text: prompt }, temperature: options.temperature ?? 0.2 }

      let lastErr = null
      for (const u of tryUrls) {
        const sep = u.includes('?') ? '&' : '?'
        const fullUrl = `${u}${sep}key=${encodeURIComponent(cfg.apiKey)}`
        try {
          const res = await fetch(fullUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
          if (!res.ok) {
            const t = await res.text()
            lastErr = new Error(`Gemini request failed: ${res.status} ${t}`)
            continue
          }
          const data = await res.json()
          if (data.candidates && Array.isArray(data.candidates)) {
            const c0 = data.candidates[0]
            if (c0.output) return c0.output
            if (c0.content) return c0.content
          }
          if (data.output && typeof data.output === 'string') return data.output
          if (data.text) return data.text
          return JSON.stringify(data)
        } catch (e) {
          lastErr = e
          continue
        }
      }
      if (lastErr) throw lastErr
      return null
    }

    // Generic endpoint mode (GEMINI_API_URL). Use Bearer token.
    const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${cfg.apiKey}` }
    const body = { prompt, model: options.model || cfg.model }
    const res = await fetch(cfg.apiUrl, { method: 'POST', headers, body: JSON.stringify(body) })
    if (!res.ok) {
      const t = await res.text()
      throw new Error(`Gemini request failed: ${res.status} ${t}`)
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
    console.error('Gemini call failed:', e.message)
    return null
  }
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
import { getGeminiConfig } from '../config/gemini.js'
import cosineSimilarity from '../utils/helpers.js'

// Lightweight Gemini/Vertex wrapper. This file prefers Gemini (Generative
// Language / Vertex) as the primary provider and does NOT call OpenAI.

const callGemini = async (prompt, options = {}) => {
  const cfg = getGeminiConfig()
  if (!cfg) return null

      try {
        return JSON.parse(gresp)
      } catch {
        return {
          genderDistribution: [ { name: 'Unknown', value: 100 } ],
          educationDistribution: [ { name: 'Unknown', value: 100 } ],
          index: 0
        }
      }
    }

    return {
      genderDistribution: [
        { name: 'Male', value: 60 },
        { name: 'Female', value: 40 }
      ],
      educationDistribution: [
        { name: 'BSc', value: 45 },
        { name: 'MSc', value: 35 },
        { name: 'PhD', value: 20 }
      ],
      index: 0.72
    }
  }

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo',
      messages: [{
        role: 'user',
        content: `Analyze candidate data for diversity metrics: ${JSON.stringify(candidateArray)}`
      }]
    })
    return JSON.parse(response.choices[0].message.content)
  } catch (e) {
    console.error('OpenAI diversity analysis failed:', e.message)
    const gresp = await callGemini(`Analyze candidate data for diversity metrics: ${JSON.stringify(candidateArray)}`)
    if (gresp) {
      try { return JSON.parse(gresp) } catch { /* fall through */ }
    }
    return {
      genderDistribution: [ { name: 'Error', value: 100 } ],
      educationDistribution: [ { name: 'Error', value: 100 } ],
      index: 0
    }
  }
}

export const searchTalent = async (query, candidates) => {
  const openai = getOpenAI()
  if (!openai) {
    // No OpenAI: try Gemini (if available) or provide a simple keyword ranking
    const gresp = await callGemini(JSON.stringify({ query, candidates }))
    if (gresp) {
      try {
        return JSON.parse(gresp)
      } catch {
        // If Gemini returned text, fall back to simple local ranking below
      }
    }

    // Local simple ranking: score by overlap of query words with candidate skills
    import { getGeminiConfig } from '../config/gemini.js'
    import cosineSimilarity from '../utils/helpers.js'

    // Lightweight Gemini/Vertex wrapper. This file prefers Gemini (Generative
    // Language / Vertex) as the primary provider and does NOT call OpenAI.

    const callGemini = async (prompt, options = {}) => {
      const cfg = getGeminiConfig()
      if (!cfg) return null

      try {
        // If using API key mode for Google generativelanguage, try project-level
        // endpoint first (if project configured), then model-level endpoint.
        if (cfg.useApiKey) {
          const modelName = (cfg.model || 'text-bison-001').replace(/^\/+/, '')
          const tryUrls = []
          if (cfg.project) {
            tryUrls.push(`https://generativelanguage.googleapis.com/v1beta2/projects/${cfg.project}/locations/${cfg.location}/${modelName}:generateText`)
          }
          tryUrls.push(`https://generativelanguage.googleapis.com/v1beta2/models/${modelName}:generateText`)

          const body = { prompt: { text: prompt }, temperature: options.temperature ?? 0.2 }

          let lastErr = null
          for (const u of tryUrls) {
            const sep = u.includes('?') ? '&' : '?'
            const fullUrl = `${u}${sep}key=${encodeURIComponent(cfg.apiKey)}`
            try {
              const res = await fetch(fullUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
              if (!res.ok) {
                const t = await res.text()
                lastErr = new Error(`Gemini request failed: ${res.status} ${t}`)
                continue
              }
              const data = await res.json()
              // Common shapes
              if (data.candidates && Array.isArray(data.candidates)) {
                const c0 = data.candidates[0]
                if (c0.output) return c0.output
                if (c0.content) return c0.content
              }
              if (data.output && typeof data.output === 'string') return data.output
              if (data.text) return data.text
              return JSON.stringify(data)
            } catch (e) {
              lastErr = e
              continue
            }
          }
          if (lastErr) throw lastErr
          return null
        }

        // Generic endpoint mode (GEMINI_API_URL provided). Use Bearer token.
        const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${cfg.apiKey}` }
        const body = { prompt, model: options.model || cfg.model }
        const res = await fetch(cfg.apiUrl, { method: 'POST', headers, body: JSON.stringify(body) })
        if (!res.ok) {
          const t = await res.text()
          throw new Error(`Gemini request failed: ${res.status} ${t}`)
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
        console.error('Gemini call failed:', e.message)
        return null
      }
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

      // No Gemini available or it failed — return a safe demo response (no OpenAI calls)
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
          try { return JSON.parse(gresp) } catch { /* fall through to demo */ }
        }
      }
      return {
        genderDistribution: [ { name: 'Male', value: 60 }, { name: 'Female', value: 40 } ],
        educationDistribution: [ { name: 'BSc', value: 45 }, { name: 'MSc', value: 35 }, { name: 'PhD', value: 20 } ],
        index: 0.72
      }
    }

    export const searchTalent = async (query, candidates) => {
      // Prefer Gemini for semantic search if available and able to return embeddings/vectors
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
            // continue to local fallback
          }
        }
      }

      // Local simple ranking: keyword overlap
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