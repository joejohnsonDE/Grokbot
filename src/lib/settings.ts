export type LlmProvider =
  | 'ollama'
  | 'gemini'
  | 'groq'
  | 'openrouter'
  | 'openai'
  | 'rules'

export interface AppSettings {
  provider: LlmProvider
  /** When false, seats stay purely rule-based */
  agentsEnabled: boolean
  ollamaBaseUrl: string
  ollamaModel: string
  geminiApiKey: string
  geminiModel: string
  groqApiKey: string
  groqModel: string
  openrouterApiKey: string
  openrouterModel: string
  openaiApiKey: string
  openaiModel: string
}

export const DEFAULT_SETTINGS: AppSettings = {
  provider: 'ollama',
  agentsEnabled: true,
  ollamaBaseUrl: 'http://127.0.0.1:11434',
  ollamaModel: 'llama3.2',
  geminiApiKey: '',
  geminiModel: 'gemini-2.0-flash',
  groqApiKey: '',
  groqModel: 'llama-3.1-8b-instant',
  openrouterApiKey: '',
  openrouterModel: 'meta-llama/llama-3.2-3b-instruct:free',
  openaiApiKey: '',
  openaiModel: 'gpt-4o-mini',
}

const STORAGE_KEY = 'groktagon.settings.v1'

export function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { ...DEFAULT_SETTINGS }
    const parsed = JSON.parse(raw) as Partial<AppSettings>
    return { ...DEFAULT_SETTINGS, ...parsed }
  } catch {
    return { ...DEFAULT_SETTINGS }
  }
}

export function saveSettings(settings: AppSettings) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
}

export function providerLabel(p: LlmProvider) {
  switch (p) {
    case 'ollama':
      return 'Ollama (free · local)'
    case 'gemini':
      return 'Google Gemini (free tier)'
    case 'groq':
      return 'Groq (free tier)'
    case 'openrouter':
      return 'OpenRouter (free models)'
    case 'openai':
      return 'OpenAI (paid)'
    case 'rules':
      return 'Rules only (no LLM)'
  }
}

export function providerNeedsKey(p: LlmProvider) {
  return p === 'gemini' || p === 'groq' || p === 'openrouter' || p === 'openai'
}
