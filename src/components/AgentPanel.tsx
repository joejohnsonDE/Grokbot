import type { CSSProperties } from 'react'
import type { Agent } from '../data/agents'

export function AgentPanel({ agents }: { agents: Agent[] }) {
  const seats = agents.filter((a) => a.trades)
  const chief = agents.find((a) => !a.trades)

  return (
    <section className="panel agent-panel">
      <div className="panel-head">
        <h2>Seats</h2>
        <span className="panel-meta">one decision each</span>
      </div>

      {chief && (
        <div className="chief-card" style={{ '--agent': chief.color } as CSSProperties}>
          <div className="agent-icon">
            <span className="pixel-face" style={{ background: chief.color }} />
          </div>
          <div className="agent-info">
            <div className="agent-top">
              <strong>{chief.name}</strong>
              <span className="agent-role">{chief.role}</span>
            </div>
            <p className="agent-rule">{chief.rule}</p>
            <span className="status-pill status-hold">NEVER TRADES</span>
          </div>
        </div>
      )}

      <div className="agent-list">
        {seats.map((agent) => {
          const style = { '--agent': agent.color } as CSSProperties
          return (
            <div
              key={agent.id}
              className={`agent-card status-${agent.status.toLowerCase()}`}
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
                <p className="agent-rule">{agent.rule}</p>
                <div className="agent-status-row">
                  <span className={`status-pill status-${agent.status.toLowerCase()}`}>
                    {agent.status}
                  </span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
