import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const logFile = path.join(__dirname, '../../logs/ai-fallback.log')

// Ensure logs directory exists
if (!fs.existsSync(path.dirname(logFile))) {
  fs.mkdirSync(path.dirname(logFile), { recursive: true })
}

let aiFailures = 0

export async function safeProcess(aiTask, manualTask) {
  try {
    if (process.env.AI_MODE === 'false') throw new Error("AI disabled manually")
    const result = await aiTask()
    aiFailures = 0 // Reset on success
    return result
  } catch (error) {
    aiFailures++
    const timestamp = new Date().toISOString()
    const logEntry = `[${timestamp}] AI failure #${aiFailures}: ${error.message}\n`
    fs.appendFileSync(logFile, logEntry)
    console.log("⚠️ AI unavailable → switching to manual:", error.message)

    // Auto-disable AI after 3 consecutive failures
    if (aiFailures >= 3) {
      process.env.AI_MODE = 'false'
      fs.appendFileSync(logFile, `[${new Date().toISOString()}] AI auto-disabled after 3 failures\n`)
    }

    return await manualTask()
  }
}

export function getAIMode() {
  return process.env.AI_MODE !== 'false' && aiFailures < 3 ? 'ai' : 'manual'
}
