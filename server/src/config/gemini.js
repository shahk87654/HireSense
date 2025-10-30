export const getGeminiConfig = () => {
  // Support either a direct GEMINI_API_URL or constructing a default
  // Google Generative Language / Vertex AI endpoint from project/location/model.
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || null
  const apiUrl = process.env.GEMINI_API_URL || null
  const project = process.env.GEMINI_PROJECT || process.env.GOOGLE_PROJECT || null
  const location = process.env.GEMINI_LOCATION || process.env.GOOGLE_LOCATION || 'us-central1'
  // default to a commonly used model name; you can override with GEMINI_MODEL
  const model = process.env.GEMINI_MODEL || process.env.GEMINI_MODEL_NAME || 'models/text-bison-001'

  // If an explicit URL is provided, prefer it (useful for custom proxies).
  if (apiUrl && apiKey) return { apiKey, apiUrl, model }

  // If a project + key are present, construct a reasonable default URL for
  // the Google Generative Language API. This uses the generativelanguage
  // public endpoint — if you use Vertex AI endpoints you may want to set
  // GEMINI_API_URL explicitly.
  if (apiKey) {
    const host = 'https://generativelanguage.googleapis.com'
    // Common public generativelanguage endpoint: /v1beta2/models/{model}:generateText
    // Use GEMINI_MODEL to specify model resource name (for example: text-bison-001 or models/text-bison-001).
    // Normalize model name to ensure no leading slash
    const modelName = model.replace(/^\/+/, '')
    const apiUrlConstructed = `${host}/v1beta2/models/${modelName}:generateText`
    return { apiKey, apiUrl: apiUrlConstructed, model: modelName, project, location, useApiKey: true }
  }

  // Not enough config to call Gemini/Vertex
  return null
}

export default getGeminiConfig
