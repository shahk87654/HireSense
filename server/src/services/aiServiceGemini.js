import { getGeminiConfig } from '../config/gemini.js'
import cosineSimilarity from '../utils/helpers.js'

const callGemini = async (prompt, options = {}) => {
  const configs = getGeminiConfig()
  if (!configs || configs.length === 0) return null
  let lastErr = null
  for (const cfg of configs) {
    try {
      if (cfg.useApiKey) {
        const modelName = (cfg.model || 'gemini-1.5-flash').replace(/^\/+/, '')
        const isPalm = modelName.startsWith('text-')
        const version = isPalm ? 'v1beta2' : 'v1beta'
        const endpoint = isPalm ? 'generateText' : 'generateContent'

        const tryUrls = []
        if (cfg.project && !isPalm) {
          tryUrls.push(`https://generativelanguage.googleapis.com/${version}/projects/${cfg.project}/locations/${cfg.location}/publishers/google/models/${modelName}:${endpoint}`)
        }
        tryUrls.push(`https://generativelanguage.googleapis.com/${version}/models/${modelName}:${endpoint}`)

        const body = isPalm
          ? { prompt: { text: prompt }, temperature: options.temperature ?? 0.2 }
          : { contents: [{ parts: [{ text: prompt }] }], generationConfig: { temperature: options.temperature ?? 0.2 } }

        for (const u of tryUrls) {
          const sep = u.includes('?') ? '&' : '?'
          const fullUrl = `${u}${sep}key=${encodeURIComponent(cfg.apiKey)}`
          try {
            const res = await fetch(fullUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
            if (!res.ok) { lastErr = new Error(`Gemini request failed: ${res.status}`); continue }
            const data = await res.json()

            if (isPalm) {
              if (data.candidates && Array.isArray(data.candidates)) {
                const c0 = data.candidates[0]
                if (c0.output) return c0.output
                if (c0.content) return c0.content
              }
              if (data.output && typeof data.output === 'string') return data.output
              if (data.text) return data.text
            } else {
              if (data.candidates && Array.isArray(data.candidates)) {
                const c0 = data.candidates[0]
                if (c0.content && c0.content.parts && c0.content.parts[0]) {
                  return c0.content.parts[0].text
                }
              }
            }
            return JSON.stringify(data)
          } catch (e) { lastErr = e; continue }
        }
      } else {
        const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${cfg.apiKey}` }
        const body = { prompt, model: options.model || cfg.model }
        const res = await fetch(cfg.apiUrl, { method: 'POST', headers, body: JSON.stringify(body) })
        if (!res.ok) { const t = await res.text(); throw new Error(`Gemini request failed: ${res.status} ${t}`) }
        const data = await res.json()
        if (data.text) return data.text
        if (data.output && typeof data.output === 'string') return data.output
        if (data.candidates && Array.isArray(data.candidates)) { const c0 = data.candidates[0]; if (c0.output) return c0.output; if (c0.content) return c0.content }
        return JSON.stringify(data)
      }
    } catch (e) { lastErr = e; continue }
  }
  if (lastErr) console.error('Gemini call failed:', lastErr.message)
  return null
}

const isGeminiAvailable = () => { try { return !!getGeminiConfig() } catch { return false } }

export const analyzeResume = async (resumeText, jobDescription) => {
  const prompt = `Analyze the following resume and job description. Extract key skills, experience, and education. Assign a Fit Score (0-100) and return JSON: { name, skills[], experience_summary, education, fit_score, reason }\n\nResume:\n${resumeText}\n\nJob Description:\n${jobDescription}`
  if (!isGeminiAvailable()) {
    throw new Error('Gemini AI not configured or available')
  }
  const gresp = await callGemini(prompt)
  if (!gresp) {
    throw new Error('Gemini API call failed - no response')
  }
  try {
    // Clean the response by removing markdown code blocks if present
    let cleanResponse = gresp.trim()
    if (cleanResponse.startsWith('```json')) {
      cleanResponse = cleanResponse.replace(/^```json\s*/, '').replace(/\s*```$/, '')
    } else if (cleanResponse.startsWith('```')) {
      cleanResponse = cleanResponse.replace(/^```\s*/, '').replace(/\s*```$/, '')
    }
    const parsed = JSON.parse(cleanResponse)
    // Validate that we got a proper response
    if (!parsed.name || !parsed.skills || typeof parsed.fit_score !== 'number') {
      throw new Error('Invalid response format from Gemini')
    }
    return parsed
  } catch (parseError) {
    throw new Error('Failed to parse Gemini response: ' + parseError.message)
  }
}

export const analyzeDiversity = async (candidateArray) => {
  const prompt = `Analyze candidate data for diversity metrics: ${JSON.stringify(candidateArray)}`
  if (!isGeminiAvailable()) {
    throw new Error('Gemini AI not configured or available')
  }
  const gresp = await callGemini(prompt)
  if (!gresp) {
    throw new Error('Gemini API call failed - no response')
  }
  try {
    const parsed = JSON.parse(gresp)
    // Validate diversity response
    if (!parsed.genderDistribution || !parsed.educationDistribution || typeof parsed.index !== 'number') {
      throw new Error('Invalid diversity response format from Gemini')
    }
    return parsed
  } catch (parseError) {
    throw new Error('Failed to parse diversity response: ' + parseError.message)
  }
}

export const searchTalent = async (query, candidates) => {
  if (!isGeminiAvailable()) {
    throw new Error('Gemini AI not configured or available')
  }
  const tryResp = await callGemini(JSON.stringify({ purpose: 'embeddings', query, candidates }))
  if (!tryResp) {
    throw new Error('Gemini API call failed - no response')
  }
  try {
    const parsed = JSON.parse(tryResp)
    if (Array.isArray(parsed)) {
      const queryVector = parsed[0]
      const candidateVectors = parsed.slice(1)
      const ranked = candidates.map((c,i)=>({ ...c, score: cosineSimilarity(queryVector, candidateVectors[i]) })).sort((a,b)=>b.score-a.score)
      return ranked.slice(0,10)
    } else {
      throw new Error('Invalid embeddings response format')
    }
  } catch (parseError) {
    throw new Error('Failed to parse embeddings response: ' + parseError.message)
  }
}

export const analyzeCultureFit = async (candidate, cultureStatement) => {
  const prompt = `Analyze culture fit between candidate and company culture. Return ONLY a JSON object with this exact format: {"fitScore": number, "explanation": "string"}

Candidate: ${JSON.stringify(candidate)}
Culture Statement: ${cultureStatement}

Response must be valid JSON only, no additional text, no markdown, no code blocks.`
  if (!isGeminiAvailable()) {
    throw new Error('Gemini AI not configured or available')
  }
  const gresp = await callGemini(prompt)
  if (!gresp) {
    throw new Error('Gemini API call failed - no response')
  }
  try {
    // Clean the response by removing markdown code blocks if present
    let cleanResponse = gresp.trim()
    if (cleanResponse.startsWith('```json')) {
      cleanResponse = cleanResponse.replace(/^```json\s*/, '').replace(/\s*```$/, '')
    } else if (cleanResponse.startsWith('```')) {
      cleanResponse = cleanResponse.replace(/^```\s*/, '').replace(/\s*```$/, '')
    }
    const parsed = JSON.parse(cleanResponse)
    // Validate culture fit response
    if (typeof parsed.fitScore !== 'number' || !parsed.explanation) {
      throw new Error('Invalid culture fit response format from Gemini')
    }
    return parsed
  } catch (parseError) {
    throw new Error('Failed to parse culture fit response: ' + parseError.message)
  }
}
