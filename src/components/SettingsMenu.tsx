import { useState } from 'react'
import { probeProvider } from '../lib/llm'
import {
  providerLabel,
  providerNeedsKey,
  type AppSettings,
  type LlmProvider,
} from '../lib/settings'

const PROVIDERS: LlmProvider[] = [
  'ollama',
  'gemini',
  'groq',
  'openrouter',
  'openai',
  'rules',
]

export function SettingsMenu({
  open,
  onClose,
  settings,
  update,
  reset,
}: {
  open: boolean
  onClose: () => void
  settings: AppSettings
  update: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => void
  reset: () => void
}) {
  const [probeMsg, setProbeMsg] = useState<string | null>(null)
  const [probing, setProbing] = useState(false)

  if (!open) return null

  return (
    <div className="settings-overlay" role="dialog" aria-modal="true" aria-labelledby="settings-title">
      <div className="settings-panel">
        <div className="panel-head">
          <h2 id="settings-title">Settings</h2>
          <button type="button" className="settings-close" onClick={onClose}>
            close
          </button>
        </div>

        <p className="settings-lede">
          Default is <strong>Ollama on this laptop</strong> (free). Optional cloud keys stay in your
          browser localStorage — never committed to git.
        </p>

        <label className="settings-row">
          <span>AI agents</span>
          <input
            type="checkbox"
            checked={settings.agentsEnabled}
            onChange={(e) => update('agentsEnabled', e.target.checked)}
          />
        </label>

        <label className="settings-field">
          <span>Provider</span>
          <select
            value={settings.provider}
            onChange={(e) => update('provider', e.target.value as LlmProvider)}
          >
            {PROVIDERS.map((p) => (
              <option key={p} value={p}>
                {providerLabel(p)}
              </option>
            ))}
          </select>
        </label>

        {settings.provider === 'ollama' && (
          <div className="settings-block">
            <label className="settings-field">
              <span>Ollama URL</span>
              <input
                value={settings.ollamaBaseUrl}
                onChange={(e) => update('ollamaBaseUrl', e.target.value)}
                spellCheck={false}
              />
            </label>
            <label className="settings-field">
              <span>Ollama model</span>
              <input
                value={settings.ollamaModel}
                onChange={(e) => update('ollamaModel', e.target.value)}
                placeholder="llama3.2"
                spellCheck={false}
              />
            </label>
            <p className="settings-help">
              Install from ollama.com, then run: <code>ollama pull {settings.ollamaModel}</code>
            </p>
          </div>
        )}

        {settings.provider === 'gemini' && (
          <div className="settings-block">
            <label className="settings-field">
              <span>Gemini API key</span>
              <input
                type="password"
                value={settings.geminiApiKey}
                onChange={(e) => update('geminiApiKey', e.target.value)}
                placeholder="AIza…"
                spellCheck={false}
              />
            </label>
            <label className="settings-field">
              <span>Model</span>
              <input
                value={settings.geminiModel}
                onChange={(e) => update('geminiModel', e.target.value)}
                spellCheck={false}
              />
            </label>
          </div>
        )}

        {settings.provider === 'groq' && (
          <div className="settings-block">
            <label className="settings-field">
              <span>Groq API key</span>
              <input
                type="password"
                value={settings.groqApiKey}
                onChange={(e) => update('groqApiKey', e.target.value)}
                spellCheck={false}
              />
            </label>
            <label className="settings-field">
              <span>Model</span>
              <input
                value={settings.groqModel}
                onChange={(e) => update('groqModel', e.target.value)}
                spellCheck={false}
              />
            </label>
          </div>
        )}

        {settings.provider === 'openrouter' && (
          <div className="settings-block">
            <label className="settings-field">
              <span>OpenRouter API key</span>
              <input
                type="password"
                value={settings.openrouterApiKey}
                onChange={(e) => update('openrouterApiKey', e.target.value)}
                spellCheck={false}
              />
            </label>
            <label className="settings-field">
              <span>Model</span>
              <input
                value={settings.openrouterModel}
                onChange={(e) => update('openrouterModel', e.target.value)}
                spellCheck={false}
              />
            </label>
          </div>
        )}

        {settings.provider === 'openai' && (
          <div className="settings-block">
            <label className="settings-field">
              <span>OpenAI API key</span>
              <input
                type="password"
                value={settings.openaiApiKey}
                onChange={(e) => update('openaiApiKey', e.target.value)}
                spellCheck={false}
              />
            </label>
            <label className="settings-field">
              <span>Model</span>
              <input
                value={settings.openaiModel}
                onChange={(e) => update('openaiModel', e.target.value)}
                spellCheck={false}
              />
            </label>
          </div>
        )}

        {settings.provider === 'rules' && (
          <p className="settings-help">Seats use hardcoded protocol only — zero LLM calls.</p>
        )}

        {providerNeedsKey(settings.provider) && (
          <p className="settings-help">
            Free tiers are rate-limited. Keys never leave this browser unless you clear site data.
          </p>
        )}

        <div className="settings-actions">
          <button
            type="button"
            disabled={probing || settings.provider === 'rules' || !settings.agentsEnabled}
            onClick={() => {
              setProbing(true)
              setProbeMsg(null)
              void probeProvider(settings)
                .then((r) => setProbeMsg(`OK · ${r.slice(0, 80)}`))
                .catch((e) => setProbeMsg(e instanceof Error ? e.message : String(e)))
                .finally(() => setProbing(false))
            }}
          >
            {probing ? 'Testing…' : 'Test connection'}
          </button>
          <button type="button" className="ghost" onClick={reset}>
            Reset defaults
          </button>
        </div>
        {probeMsg && <p className="settings-probe">{probeMsg}</p>}
      </div>
    </div>
  )
}
