import type { ActivityEntry } from '../data/agents'

function pnlClass(pnl: number | null) {
  if (pnl === null) return 'muted'
  return pnl >= 0 ? 'pos' : 'neg'
}

function formatPnl(pnl: number | null) {
  if (pnl === null) return '—'
  const sign = pnl >= 0 ? '+' : ''
  return `${sign}$${Math.abs(pnl).toFixed(2)}`
}

export function ActivityLog({ logs }: { logs: ActivityEntry[] }) {
  return (
    <section className="panel log-panel">
      <div className="panel-head">
        <h2>Activity</h2>
        <span className="panel-meta">agent stream</span>
      </div>
      <div className="log-table" role="log" aria-live="polite">
        <div className="log-row log-head">
          <span>TIME</span>
          <span>AGENT</span>
          <span>ACT</span>
          <span>P&amp;L</span>
          <span>DETAIL</span>
        </div>
        {logs.map((row) => (
          <div className="log-row" key={row.id}>
            <span className="mono muted">{row.time}</span>
            <span className="agent-name">{row.agent}</span>
            <span className={`action action-${row.action.toLowerCase()}`}>{row.action}</span>
            <span className={`mono ${pnlClass(row.pnl)}`}>{formatPnl(row.pnl)}</span>
            <span className="detail">{row.detail}</span>
          </div>
        ))}
      </div>
    </section>
  )
}
