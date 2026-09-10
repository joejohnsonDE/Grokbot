import type { CSSProperties } from 'react'

/** Rough pump.fun graduation band (~$69k mcap / ~85 SOL raised historically). */
const GRAD_MCAP = 69_000
const GRAD_SOL = 85

export function BondingCurve({
  coin,
  progress,
  mcap,
}: {
  coin: string
  progress: number
  mcap: number
}) {
  const pct = Math.max(0, Math.min(100, progress))
  const style = { '--pct': `${pct}%` } as CSSProperties
  const solRaised = (pct / 100) * GRAD_SOL
  const solLeft = Math.max(0, GRAD_SOL - solRaised)

  return (
    <section className="panel curve-panel">
      <div className="panel-head">
        <h2>Bonding Curve</h2>
        <span className="panel-meta">{coin} · pump.fun</span>
      </div>
      <div className="curve-body">
        <div className="curve-track" style={style}>
          <div className="curve-fill" />
          <div className="curve-marker" />
        </div>
        <div className="curve-stats">
          <div>
            <span className="metric-label">To graduate</span>
            <span className="metric-value mono">{pct.toFixed(1)}%</span>
          </div>
          <div>
            <span className="metric-label">Est. MCAP</span>
            <span className="metric-value mono">
              ${mcap >= 1000 ? `${(mcap / 1000).toFixed(1)}k` : mcap.toFixed(0)}
              <span className="muted"> / ${(GRAD_MCAP / 1000).toFixed(0)}k</span>
            </span>
          </div>
          <div>
            <span className="metric-label">SOL raised</span>
            <span className="metric-value mono">
              {solRaised.toFixed(1)}
              <span className="muted"> · {solLeft.toFixed(1)} left</span>
            </span>
          </div>
          <div>
            <span className="metric-label">Target</span>
            <span className="metric-value mono muted">grad → PumpSwap</span>
          </div>
        </div>
      </div>
    </section>
  )
}
