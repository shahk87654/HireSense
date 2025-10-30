import OpenAI from 'openai'

export const getOpenAI = () => {
  const key = process.env.OPENAI_API_KEY
  if (!key) return null
  return new OpenAI({ apiKey: key })
}
