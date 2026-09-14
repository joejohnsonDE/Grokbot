import { WalletMultiButton, useLiveTrading } from '../wallet/SolanaProviders'

function shortKey(key: string) {
  return `${key.slice(0, 4)}…${key.slice(-4)}`
}

export function LiveControls({
  mint,
  onManualBuy,
  onManualSell,
}: {
  mint: string
  onManualBuy: () => Promise<void>
  onManualSell: () => Promise<void>
}) {
  const live = useLiveTrading()
  const canTrade = live.connected && Boolean(mint)

  return (
    <section className="panel live-panel">
      <div className="panel-head">
        <h2>Sign in · Live Desk</h2>
        <span className={`panel-meta ${live.liveArmed ? 'neg' : live.connected ? 'pos' : ''}`}>
          {live.liveArmed ? 'ARMED · real SOL' : live.connected ? 'signed in' : 'sign in required'}
        </span>
      </div>

      <div className="live-row">
        <WalletMultiButton />
        <div className="live-meta">
          {live.connected ? (
            <>
              <span className="mono">{shortKey(live.publicKey!)}</span>
              <span className="mono pos">
                {live.solBalance === null ? '…' : `${live.solBalance.toFixed(3)} SOL`}
              </span>
            </>
          ) : (
            <span className="muted">Connect wallet = pump.fun trader login</span>
          )}
        </div>
      </div>

      <div className="live-grid">
        <label className="live-field">
          <span className="metric-label">Ticket (SOL)</span>
          <input
            type="number"
            min={0.001}
            step={0.01}
            value={live.ticketSol}
            disabled={!live.connected}
            onChange={(e) => live.setTicketSol(Number(e.target.value) || 0)}
          />
        </label>
        <label className="live-field">
          <span className="metric-label">Slippage %</span>
          <input
            type="number"
            min={1}
            max={50}
            step={1}
            value={live.slippage}
            disabled={!live.connected}
            onChange={(e) => live.setSlippage(Number(e.target.value) || 1)}
          />
        </label>
        <label className="live-arm">
          <input
            type="checkbox"
            checked={live.liveArmed}
            disabled={!live.connected || !mint}
            onChange={(e) => live.setLiveArmed(e.target.checked)}
          />
          <span>
            <strong>ARM LIVE</strong>
            <em> FILLS buys · RISK sells · approve each tx in wallet</em>
          </span>
        </label>
      </div>

      <div className="live-manual">
        <button type="button" disabled={!canTrade || live.busy} onClick={() => void onManualBuy()}>
          BUY NOW
        </button>
        <button
          type="button"
          className="sell"
          disabled={!canTrade || live.busy}
          onClick={() => void onManualSell()}
        >
          SELL 100%
        </button>
        {!mint && <span className="muted">Track a mint first</span>}
      </div>

      {live.busy && <p className="live-status">signing / sending…</p>}
      {live.lastTrade && (
        <p className="live-status pos">
          last tx{' '}
          <a href={live.lastTrade.explorerUrl} target="_blank" rel="noreferrer">
            {live.lastTrade.signature.slice(0, 8)}…
          </a>
        </p>
      )}
      {live.lastError && <p className="live-status neg">{live.lastError}</p>}

      <p className="mint-hint">
        Your pump.fun identity is the Solana wallet you connect. Keys never leave Phantom/Solflare —
        you approve agent trades there.
      </p>
    </section>
  )
}
