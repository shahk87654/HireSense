let aiFailures = 0
const MAX_FAILURES = 3

export const isAIModeEnabled = (module = null) => {
  // Global AI mode
  if (process.env.AI_MODE === 'false') return false

  // Module-specific override
  if (module) {
    const moduleFlag = process.env[`AI_MODE_${module.toUpperCase()}`]
    if (moduleFlag !== undefined) return moduleFlag === 'true'
  }
  // Check failure threshold
  return aiFailures < MAX_FAILURES
}

export const recordAIFailure = () => {
  aiFailures++
  if (aiFailures >= MAX_FAILURES) {
    console.log('🚨 AI failures exceeded threshold, disabling AI mode')
    process.env.AI_MODE = 'false'
  }
}

export const resetAIFailures = () => {
  aiFailures = 0
}

export const getAIModeStatus = () => ({
  ai_mode: isAIModeEnabled() ? 'enabled' : 'disabled',
  failures: aiFailures,
  max_failures: MAX_FAILURES
})

export default { isAIModeEnabled, recordAIFailure, resetAIFailures, getAIModeStatus }
