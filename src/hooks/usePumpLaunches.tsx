import { useEffect, useRef, useState } from 'react'

export interface PumpLaunch {
  id: string
  name: string
  symbol: string
  mint: string
  source: 'live' | 'sim'
  at: number
}

const SIM_NAMES = [
  ['FATCOIN', 'FAT'],
  ['TRENCHCAT', 'TRENCH'],
  ['BOOKWIF', 'BOOKS'],
  ['GIGAFOX', 'GIGA'],
  ['MOONBAG', 'MOON'],
  ['SOLPUP', 'PUP'],
  ['CHADPEPE', 'CHAD'],
  ['RUGGEDNT', 'SAFE'],
]

function shortMint(mint: string) {
  if (mint.length < 10) return mint
  return `${mint.slice(0, 4)}…${mint.slice(-4)}`
}

function parseLaunch(raw: unknown): PumpLaunch | null {
  if (!raw || typeof raw !== 'object') return null
  const msg = raw as Record<string, unknown>
  const mint = String(msg.mint ?? msg.token ?? msg.ca ?? '')
  if (!mint || mint.length < 20) return null
  const name = String(msg.name ?? msg.tokenName ?? 'NEW')
  const symbol = String(msg.symbol ?? msg.ticker ?? name.slice(0, 6)).toUpperCase()
  return {
    id: `${mint}-${Date.now()}`,
    name,
    symbol,
    mint,
    source: 'live',
    at: Date.now(),
  }
}

export function usePumpLaunches(onLiveMint?: (mint: string, symbol: string) => void) {
  const [launches, setLaunches] = useState<PumpLaunch[]>([])
  const [live, setLive] = useState(false)
  const onLive = useRef(onLiveMint)
  onLive.current = onLiveMint

  useEffect(() => {
    let ws: WebSocket | null = null
    let closed = false
    let simTimer: number | undefined
    let retryTimer: number | undefined

    const pushSim = () => {
      const [name, symbol] = SIM_NAMES[Math.floor(Math.random() * SIM_NAMES.length)]
      const mint = `${symbol}${Math.random().toString(36).slice(2, 10)}Pump111111111111111111`
      const launch: PumpLaunch = {
        id: `sim-${Date.now()}`,
        name,
        symbol,
        mint,
        source: 'sim',
        at: Date.now(),
      }
      setLaunches((prev) => [launch, ...prev].slice(0, 24))
    }

    const startSim = () => {
      if (simTimer) return
      pushSim()
      simTimer = window.setInterval(pushSim, 4500)
    }

    const connect = () => {
      // Free new-token stream (no key). Falls back to sim if blocked.
      try {
        ws = new WebSocket('wss://pumpportal.fun/api/data')
      } catch {
        startSim()
        return
      }

      ws.onopen = () => {
        if (closed) return
        setLive(true)
        ws?.send(JSON.stringify({ method: 'subscribeNewToken' }))
      }

      ws.onmessage = (ev) => {
        try {
          const data = JSON.parse(String(ev.data))
          const launch = parseLaunch(data)
          if (!launch) return
          setLaunches((prev) => [launch, ...prev].slice(0, 24))
          onLive.current?.(launch.mint, launch.symbol)
        } catch {
          /* ignore malformed frames */
        }
      }

      ws.onerror = () => {
        setLive(false)
      }

      ws.onclose = () => {
        setLive(false)
        if (closed) return
        startSim()
        retryTimer = window.setTimeout(connect, 12_000)
      }
    }

    connect()
    // Always keep a slow sim heartbeat so the board never looks dead offline
    const heartbeat = window.setTimeout(startSim, 3500)

    return () => {
      closed = true
      ws?.close()
      if (simTimer) window.clearInterval(simTimer)
      if (retryTimer) window.clearTimeout(retryTimer)
      window.clearTimeout(heartbeat)
    }
  }, [])

  return { launches, live }
}

export function LaunchFeed({
  launches,
  live,
  onTrack,
}: {
  launches: PumpLaunch[]
  live: boolean
  onTrack: (mint: string) => void
}) {
  return (
    <section className="panel launch-panel">
      <div className="panel-head">
        <h2>pump.fun Launches</h2>
        <span className={`panel-meta ${live ? 'pos' : ''}`}>
          {live ? 'ws live' : 'sim feed'}
        </span>
      </div>
      <div className="launch-list" role="list">
        {launches.length === 0 && (
          <div className="launch-empty muted">waiting for new bonding-curve tokens…</div>
        )}
        {launches.map((l) => (
          <div className="launch-row" key={l.id} role="listitem">
            <div className="launch-main">
              <strong>{l.symbol}</strong>
              <span className="muted">{l.name}</span>
              <span className="mono muted">{shortMint(l.mint)}</span>
            </div>
            <div className="launch-actions">
              <a
                className="launch-link"
                href={`https://pump.fun/coin/${l.mint}`}
                target="_blank"
                rel="noreferrer"
              >
                open
              </a>
              <button type="button" className="launch-track" onClick={() => onTrack(l.mint)}>
                track
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
