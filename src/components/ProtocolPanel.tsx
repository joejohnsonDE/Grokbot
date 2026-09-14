import { DAY_REPORT, MAX_TICKET_PCT, WORKING_STAKE_PCT } from '../data/agents'

function money(n: number) {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
}

export function ProtocolPanel() {
  const r = DAY_REPORT

  return (
    <section className="panel protocol-panel">
      <div className="panel-head">
        <h2>Room Protocol</h2>
        <span className="panel-meta">day {r.day} charter</span>
      </div>

      <p className="protocol-lede">
        day {r.day}. bank opened at {money(r.open)}, closed at {money(r.close)}, up exactly{' '}
        {r.pct}%, and the coin they traded all night ended {r.coinDrawdownPct}% below the price
        they paid for it. that gap is the whole story. <em>{r.thesis}</em>
      </p>

      <p className="protocol-structure">
        the room is <strong>one chief who never trades</strong> and{' '}
        <strong>six seats that each own one decision</strong>.
      </p>

      <ul className="protocol-rules">
        <li>
          <span>SCAN</span> finds what moves and refuses nothing, on purpose
        </li>
        <li>
          <span>VET</span> kills most of SCAN&apos;s list
        </li>
        <li>
          <span>BOOK</span> only takes markets where the price has not caught the headline yet
        </li>
        <li>
          <span>SIZE</span> clamps every ticket to {MAX_TICKET_PCT}% of bank · working stake{' '}
          {WORKING_STAKE_PCT}%
        </li>
        <li>
          <span>FILLS</span> cancels instead of chasing when the book moves 3¢ against
        </li>
        <li>
          <span>RISK</span> is the only seat that can close, and it wins every argument to hold
        </li>
      </ul>

      <p className="protocol-footer">{r.protocol}</p>

      <div className="protocol-split">
        <div>
          <span className="metric-label">{r.coinName}</span>
          <span className="metric-value pos mono">+{money(r.coinPnl)}</span>
        </div>
        <div>
          <span className="metric-label">{r.predictionCount} predictions</span>
          <span className="metric-value pos mono">+{money(r.predictionPnl)}</span>
        </div>
      </div>
    </section>
  )
}
