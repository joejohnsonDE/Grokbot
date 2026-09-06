import type { SimulationState } from '../hooks/useSimulation'

function money(n: number) {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
}

export function MetricsBar({ sim }: { sim: SimulationState }) {
  const pnlPositive = sim.pnl >= 0

  return (
    <header className="metrics">
      <div className="brand-block">
        <div className="brand-mark" aria-hidden>
          <svg viewBox="0 0 48 48" width="36" height="36">
            <polygon
              points="24,2 44,14 44,34 24,46 4,34 4,14"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            />
            <polygon
              points="24,12 34,18 34,30 24,36 14,30 14,18"
              fill="currentColor"
              opacity="0.35"
            />
          </svg>
        </div>
        <div>
          <h1 className="brand">THE GROKTAGON</h1>
          <p className="brand-sub">pump.fun · trench command · day {sim.day}</p>
        </div>
      </div>

      <div className="metric-grid">
        <div className="metric">
          <span className="metric-label">Balance</span>
          <span className="metric-value pulse-soft">{money(sim.balance)}</span>
          <span className="metric-hint">INITIAL {money(sim.initial)}</span>
        </div>
        <div className="metric">
          <span className="metric-label">Total P&amp;L</span>
          <span className={`metric-value ${pnlPositive ? 'pos' : 'neg'}`}>
            {pnlPositive ? '+' : ''}
            {money(sim.pnl)}
          </span>
          <span className="metric-hint">session</span>
        </div>
        <div className="metric">
          <span className="metric-label">Win Rate</span>
          <span className="metric-value">{sim.winRate.toFixed(1)}%</span>
          <span className="metric-hint">
            {sim.wins}W / {sim.losses}L
          </span>
        </div>
        <div className="metric">
          <span className="metric-label">Uptime</span>
          <span className="metric-value mono">{sim.uptime}</span>
          <span className="metric-hint live-dot">
            {sim.live ? 'POSITION · LIVE' : 'FLAT'}
          </span>
        </div>
        <div className="metric metric-tags">
          <span className="tag">TRENCH {sim.trench}</span>
          <span className="tag">BOOKS {sim.books}</span>
          <span className="tag accent">{sim.activeCoin}</span>
        </div>
      </div>
    </header>
  )
}
