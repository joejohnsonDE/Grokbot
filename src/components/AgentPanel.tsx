import type { CSSProperties } from 'react'
import { VolumeX } from 'lucide-react'
import type { Agent } from '../data/agents'

export function AgentPanel({ agents }: { agents: Agent[] }) {
  return (
    <section className="panel agent-panel">
      <div className="panel-head">
        <h2>Agents</h2>
        <span className="panel-meta">desk roster</span>
      </div>
      <div className="agent-list">
        {agents.map((agent) => {
          const off = agent.status === 'OFF'
          const style = { '--agent': agent.color } as CSSProperties
          return (
            <div
              key={agent.id}
              className={`agent-card ${off ? 'agent-off' : ''} status-${agent.status.toLowerCase()}`}
              style={style}
            >
              <div className="agent-icon">
                <span className="pixel-face" style={{ background: agent.color }} />
              </div>
              <div className="agent-info">
                <div className="agent-top">
                  <strong>{agent.name}</strong>
                  <span className="agent-role">{agent.role}</span>
                </div>
                <div className="agent-status-row">
                  <span className={`status-pill status-${agent.status.toLowerCase()}`}>
                    {agent.status}
                  </span>
                  {off && <VolumeX size={12} className="muted-icon" aria-label="Muted" />}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
