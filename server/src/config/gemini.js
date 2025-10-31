export const getGeminiConfig = () => {
  // Support either a direct GEMINI_API_URL or constructing a default
  // Google Generative Language / Vertex AI endpoint from project/location/model.
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || null
  const apiUrl = process.env.GEMINI_API_URL || null
  const project = process.env.GEMINI_PROJECT || process.env.GOOGLE_PROJECT || null
  const location = process.env.GEMINI_LOCATION || process.env.GOOGLE_LOCATION || 'us-central1'
  // List of Gemini models to try in order of preference
  const models = [
    'gemini-2.0-flash',
    'gemini-2.0-flash-lite',
    'gemini-2.5-flash-lite',
    'gemini-2.5-flash',
    'gemini-2.5-pro',
    'gemini-2.0-flash-exp',
    'gemini-1.5-flash',
    'gemini-1.5-pro',
    'text-bison-001'
  ]

  // If an explicit URL is provided, prefer it (useful for custom proxies).
  if (apiUrl && apiKey) return [{ apiKey, apiUrl, model: 'custom', project, location, useApiKey: true }]

  // If key is present, construct configs for each model
  if (apiKey) {
    const host = 'https://generativelanguage.googleapis.com'
    return models.map(model => {
      // Normalize model name to ensure no leading slash
      const modelName = model.replace(/^\/+/, '')
      // Use v1beta2 for PaLM models, v1beta for Gemini models
      const version = modelName.startsWith('text-') ? 'v1beta2' : 'v1beta'
      const endpoint = modelName.startsWith('text-') ? 'generateText' : 'generateContent'
      const apiUrlConstructed = `${host}/${version}/models/${modelName}:${endpoint}`
      return { apiKey, apiUrl: apiUrlConstructed, model: modelName, project, location, useApiKey: true, isPalm: modelName.startsWith('text-') }
    })
  }

  // Not enough config to call Gemini
  return []
}

export default getGeminiConfig
