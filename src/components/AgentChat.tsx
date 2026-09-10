import { useState } from 'react'
import type { AgentChatMessage } from '../hooks/useAgentRuntime'

function stamp(ms: number) {
  const d = new Date(ms)
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

export function AgentChat({
  messages,
  busy,
  status,
  error,
  providerLabel,
  onSend,
}: {
  messages: AgentChatMessage[]
  busy: boolean
  status: string
  error: string | null
  providerLabel: string
  onSend: (text: string) => Promise<void>
}) {
  const [draft, setDraft] = useState('')

  return (
    <section className="panel chat-panel">
      <div className="panel-head">
        <h2>Agent Comms</h2>
        <span className="panel-meta">{providerLabel}</span>
      </div>
      <p className="chat-help">
        Talk to the room. Prefix with <code>@SCAN</code>, <code>@VET</code>, <code>@RISK</code>, etc.
        Default routes to CHIEF.
      </p>
      <div className="chat-log" role="log" aria-live="polite">
        {messages.map((m) => (
          <div key={m.id} className={`chat-row from-${m.from.toLowerCase()}`}>
            <span className="chat-meta">
              <strong>{m.from}</strong>
              <span className="muted">{stamp(m.at)}</span>
            </span>
            <p>{m.text}</p>
          </div>
        ))}
      </div>
      <form
        className="chat-compose"
        onSubmit={(e) => {
          e.preventDefault()
          const text = draft
          setDraft('')
          void onSend(text)
        }}
      >
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="@SCAN what looks alive on pump.fun?"
          disabled={busy}
        />
        <button type="submit" disabled={busy || !draft.trim()}>
          SEND
        </button>
      </form>
      <div className="chat-status">
        <span className="muted">{status}</span>
        {error && <span className="neg">{error}</span>}
      </div>
    </section>
  )
}
