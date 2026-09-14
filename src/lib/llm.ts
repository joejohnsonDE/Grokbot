import type { AppSettings, LlmProvider } from './settings'

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export class LlmError extends Error {
  provider: LlmProvider
  constructor(message: string, provider: LlmProvider) {
    super(message)
    this.name = 'LlmError'
    this.provider = provider
  }
}

async function chatOllama(settings: AppSettings, messages: ChatMessage[]) {
  const base = settings.ollamaBaseUrl.replace(/\/$/, '')
  // Prefer Vite proxy in browser to avoid CORS surprises
  const url =
    typeof window !== 'undefined' && base.includes('127.0.0.1')
      ? '/api/ollama/api/chat'
      : `${base}/api/chat`

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: settings.ollamaModel,
      stream: false,
      messages,
      options: { temperature: 0.4, num_predict: 220 },
    }),
  })
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText)
    throw new LlmError(
      `Ollama error: ${text || res.status}. Is Ollama running? Try: ollama serve && ollama pull ${settings.ollamaModel}`,
      'ollama',
    )
  }
  const data = (await res.json()) as { message?: { content?: string } }
  const content = data.message?.content?.trim()
  if (!content) throw new LlmError('Ollama returned empty response', 'ollama')
  return content
}

async function chatOpenAiCompatible(
  provider: 'groq' | 'openrouter' | 'openai',
  settings: AppSettings,
  messages: ChatMessage[],
) {
  const cfg =
    provider === 'groq'
      ? {
          url: 'https://api.groq.com/openai/v1/chat/completions',
          key: settings.groqApiKey,
          model: settings.groqModel,
        }
      : provider === 'openrouter'
        ? {
            url: 'https://openrouter.ai/api/v1/chat/completions',
            key: settings.openrouterApiKey,
            model: settings.openrouterModel,
          }
        : {
            url: 'https://api.openai.com/v1/chat/completions',
            key: settings.openaiApiKey,
            model: settings.openaiModel,
          }

  if (!cfg.key.trim()) {
    throw new LlmError(`Add a ${provider} API key in Settings`, provider)
  }

  const res = await fetch(cfg.url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${cfg.key}`,
      ...(provider === 'openrouter'
        ? {
            'HTTP-Referer': typeof window !== 'undefined' ? window.location.origin : 'http://localhost',
            'X-Title': 'Groktagon',
          }
        : {}),
    },
    body: JSON.stringify({
      model: cfg.model,
      messages,
      temperature: 0.4,
      max_tokens: 280,
    }),
  })
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText)
    throw new LlmError(`${provider} error: ${text || res.status}`, provider)
  }
  const data = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>
  }
  const content = data.choices?.[0]?.message?.content?.trim()
  if (!content) throw new LlmError(`${provider} returned empty response`, provider)
  return content
}

async function chatGemini(settings: AppSettings, messages: ChatMessage[]) {
  if (!settings.geminiApiKey.trim()) {
    throw new LlmError('Add a Gemini API key in Settings', 'gemini')
  }
  const system = messages.filter((m) => m.role === 'system').map((m) => m.content).join('\n')
  const contents = messages
    .filter((m) => m.role !== 'system')
    .map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }))

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(settings.geminiModel)}:generateContent?key=${encodeURIComponent(settings.geminiApiKey)}`
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      systemInstruction: system ? { parts: [{ text: system }] } : undefined,
      contents,
      generationConfig: { temperature: 0.4, maxOutputTokens: 280 },
    }),
  })
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText)
    throw new LlmError(`Gemini error: ${text || res.status}`, 'gemini')
  }
  const data = (await res.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>
  }
  const content = data.candidates?.[0]?.content?.parts?.map((p) => p.text ?? '').join('').trim()
  if (!content) throw new LlmError('Gemini returned empty response', 'gemini')
  return content
}

export async function chatCompletion(
  settings: AppSettings,
  messages: ChatMessage[],
): Promise<string> {
  if (!settings.agentsEnabled || settings.provider === 'rules') {
    throw new LlmError('LLM agents disabled (rules-only mode)', 'rules')
  }
  switch (settings.provider) {
    case 'ollama':
      return chatOllama(settings, messages)
    case 'gemini':
      return chatGemini(settings, messages)
    case 'groq':
      return chatOpenAiCompatible('groq', settings, messages)
    case 'openrouter':
      return chatOpenAiCompatible('openrouter', settings, messages)
    case 'openai':
      return chatOpenAiCompatible('openai', settings, messages)
    default:
      throw new LlmError('Unknown provider', 'rules')
  }
}

export async function probeProvider(settings: AppSettings): Promise<string> {
  return chatCompletion(settings, [
    { role: 'system', content: 'Reply with exactly: OK' },
    { role: 'user', content: 'ping' },
  ])
}
