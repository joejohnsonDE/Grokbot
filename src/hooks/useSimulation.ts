import {
  DAY_REPORT,
  INITIAL_AGENTS,
  LOG_TEMPLATES,
  PUMP_COINS,
  WORKING_STAKE_PCT,
} from '../data/agents'
import type {
  ActivityEntry,
  Agent,
  BalancePoint,
  LogAction,
  RegionalEvent,
  SeatName,
} from '../data/agents'
import { useEffect, useRef, useState } from 'react'

const INITIAL = DAY_REPORT.open

function pad(n: number) {
  return n.toString().padStart(2, '0')
}

function stamp(ms: number) {
  const total = Math.floor(ms / 1000)
  const h = Math.floor(total / 3600) % 24
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  return `${pad(h)}:${pad(m)}:${pad(s)}`
}

function formatUptime(ms: number) {
  const total = Math.floor(ms / 1000)
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  if (h > 0) return `${h}h ${m}m`
  return `${m}m ${pad(s)}s`
}

function seedHistory(): BalancePoint[] {
  const pts: BalancePoint[] = []
  let bal = INITIAL
  const target = DAY_REPORT.close
  for (let i = 0; i < 56; i++) {
    const progress = i / 55
    const guided = INITIAL + (target - INITIAL) * progress * 0.55
    const noise = (Math.random() - 0.4) * 45
    bal = Math.max(INITIAL * 0.985, guided * 0.35 + bal * 0.65 + noise)
    pts.push({ t: i, balance: Number(bal.toFixed(2)) })
  }
  pts[pts.length - 1] = {
    t: pts.length - 1,
    balance: Number((INITIAL + 369.68).toFixed(2)),
  }
  return pts
}

function seedLogs(): ActivityEntry[] {
  return LOG_TEMPLATES.map((tpl, i) => {
    const coin = PUMP_COINS[i % PUMP_COINS.length]
    const pnl = tpl.pnl ? Number(tpl.pnl().toFixed(2)) : null
    return {
      id: `seed-${i}`,
      time: stamp(i * 51_000 + 8_000),
      agent: tpl.agent,
      action: tpl.action,
      pnl,
      detail: tpl.detail(coin),
    }
  }).reverse()
}

function seedEvents(): RegionalEvent[] {
  return [
    { id: 'a1', region: 'AMERICAS', label: 'SOL volume', intensity: 0.9, x: 32, y: 48 },
    { id: 'a2', region: 'AMERICAS', label: 'whale', intensity: 0.55, x: 58, y: 38 },
    { id: 't1', region: 'ATLANTIC', label: 'headline', intensity: 0.7, x: 48, y: 42 },
    { id: 't2', region: 'ATLANTIC', label: 'vet kill', intensity: 0.45, x: 62, y: 55 },
    { id: 'p1', region: 'ASIA / PACIFIC', label: 'launch', intensity: 0.85, x: 55, y: 50 },
    { id: 'p2', region: 'ASIA / PACIFIC', label: 'bundle', intensity: 0.5, x: 70, y: 40 },
  ]
}

export function isRealMint(mint: string) {
  return Boolean(mint && mint.length >= 32 && !mint.includes('Demo') && !mint.includes('PumpDemo'))
}

export interface LiveTradeHooks {
  /** When true, FILL/CLOSE attempt real trades instead of simulated P&L */
  enabled: boolean
  mint: string
  ticketSol: number
  onBuy: (mint: string, sol: number) => Promise<{ signature: string } | null>
  onSell: (mint: string) => Promise<{ signature: string } | null>
  /** Minimum ms between live trades */
  cooldownMs?: number
}

export interface SimulationState {
  balance: number
  initial: number
  pnl: number
  winRate: number
  wins: number
  losses: number
  uptime: string
  day: number
  trench: number
  books: number
  live: boolean
  tradingLive: boolean
  activeCoin: string
  orders: number
  stakePct: number
  agents: Agent[]
  history: BalancePoint[]
  logs: ActivityEntry[]
  events: RegionalEvent[]
  candle: number[]
  mint: string
  setMint: (mint: string) => void
  curveProgress: number
  mcap: number
  openPosition: boolean
  pushLog: (entry: Omit<ActivityEntry, 'id' | 'time'> & { time?: string }) => void
}

export function useSimulation(live?: LiveTradeHooks): SimulationState {
  const seeded = seedHistory()
  const [agents, setAgents] = useState<Agent[]>(INITIAL_AGENTS)
  const [history, setHistory] = useState<BalancePoint[]>(seeded)
  const [logs, setLogs] = useState<ActivityEntry[]>(seedLogs)
  const [events, setEvents] = useState<RegionalEvent[]>(seedEvents)
  const [balance, setBalance] = useState(seeded[seeded.length - 1]?.balance ?? INITIAL)
  const [wins, setWins] = useState(3)
  const [losses, setLosses] = useState(3)
  const [orders, setOrders] = useState(12)
  const [activeCoin, setActiveCoin] = useState('FATCOIN')
  const [mint, setMint] = useState('')
  const [curveProgress, setCurveProgress] = useState(62.4)
  const [mcap, setMcap] = useState(48_200)
  const [uptimeMs, setUptimeMs] = useState(23 * 60_000 + 48_000)
  const [openPosition, setOpenPosition] = useState(false)
  const [candle, setCandle] = useState(() =>
    Array.from({ length: 24 }, (_, i) => 40 + Math.sin(i / 3) * 18 + Math.random() * 10),
  )
  const tick = useRef(seeded.length)
  const pipeline = useRef(0)
  const lastTradeAt = useRef(0)
  const tradingLock = useRef(false)
  const liveRef = useRef(live)
  liveRef.current = live
  const mintRef = useRef(mint)
  mintRef.current = mint
  const openRef = useRef(openPosition)
  openRef.current = openPosition

  const pushLog = (entry: Omit<ActivityEntry, 'id' | 'time'> & { time?: string }) => {
    setLogs((prev) => {
      const row: ActivityEntry = {
        id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        time: entry.time ?? stamp(Date.now() % 86_400_000),
        agent: entry.agent,
        action: entry.action,
        pnl: entry.pnl,
        detail: entry.detail,
      }
      return [row, ...prev].slice(0, 80)
    })
  }

  useEffect(() => {
    const uptimeTimer = window.setInterval(() => setUptimeMs((v) => v + 1000), 1000)

    const simTimer = window.setInterval(() => {
      const liveCfg = liveRef.current
      const tradingLive = Boolean(liveCfg?.enabled && isRealMint(liveCfg.mint || mintRef.current))
      const ordered = LOG_TEMPLATES
      const idx =
        Math.random() > 0.25
          ? pipeline.current % ordered.length
          : Math.floor(Math.random() * ordered.length)
      pipeline.current = (pipeline.current + 1) % ordered.length
      const tpl = ordered[idx]
      const trackedMint = liveCfg?.mint || mintRef.current
      const coin = tradingLive
        ? trackedMint.slice(0, 6).toUpperCase()
        : PUMP_COINS[Math.floor(Math.random() * PUMP_COINS.length)]
      let pnl = tpl.pnl ? Number(tpl.pnl().toFixed(2)) : null

      setActiveCoin(coin)
      if (tpl.action === 'BOOK' || tpl.action === 'FILL') setOrders((o) => o + 1)
      setCurveProgress((p) =>
        Math.max(5, Math.min(99, Number((p + (Math.random() - 0.42) * 2.4).toFixed(1)))),
      )
      setMcap((m) => Math.max(8_000, Math.round(m + (Math.random() - 0.45) * 1800)))

      setAgents((prev) =>
        prev.map((a) => {
          if (!a.trades) return { ...a, status: 'HOLD' }
          if (a.name === tpl.agent) return { ...a, status: tpl.status }
          if (a.status !== 'IDLE' && Math.random() > 0.5) return { ...a, status: 'IDLE' }
          return a
        }),
      )

      // Live autonomous trades: FILLS buys when flat, RISK sells when open
      const cooldown = liveCfg?.cooldownMs ?? 45_000
      const canTrade =
        tradingLive &&
        liveCfg &&
        !tradingLock.current &&
        Date.now() - lastTradeAt.current > cooldown

      if (canTrade && tpl.action === 'FILL' && !openRef.current) {
        tradingLock.current = true
        const sol = liveCfg.ticketSol
        pushLog({
          agent: 'FILLS',
          action: 'FILL',
          pnl: null,
          detail: `LIVE buy ${sol} SOL · mint ${trackedMint.slice(0, 4)}… — approve in wallet`,
        })
        void liveCfg
          .onBuy(trackedMint, sol)
          .then((res) => {
            if (res?.signature) {
              lastTradeAt.current = Date.now()
              setOpenPosition(true)
              setOrders((o) => o + 1)
              pushLog({
                agent: 'FILLS',
                action: 'FILL',
                pnl: null,
                detail: `LIVE fill confirmed · https://solscan.io/tx/${res.signature}`,
              })
            } else {
              pushLog({
                agent: 'FILLS',
                action: 'CANCEL',
                pnl: null,
                detail: `LIVE buy aborted / rejected · staying flat`,
              })
            }
          })
          .finally(() => {
            tradingLock.current = false
          })
        return
      }

      if (canTrade && tpl.action === 'CLOSE' && openRef.current) {
        tradingLock.current = true
        pushLog({
          agent: 'RISK',
          action: 'CLOSE',
          pnl: null,
          detail: `LIVE sell 100% · mint ${trackedMint.slice(0, 4)}… — approve in wallet`,
        })
        void liveCfg
          .onSell(trackedMint)
          .then((res) => {
            if (res?.signature) {
              lastTradeAt.current = Date.now()
              setOpenPosition(false)
              pushLog({
                agent: 'RISK',
                action: 'CLOSE',
                pnl: null,
                detail: `LIVE close confirmed · https://solscan.io/tx/${res.signature}`,
              })
            } else {
              pushLog({
                agent: 'RISK',
                action: 'HOLD',
                pnl: null,
                detail: `LIVE sell aborted / rejected · RISK holds`,
              })
            }
          })
          .finally(() => {
            tradingLock.current = false
          })
        return
      }

      // While live-armed, keep desk chatter but skip fake P&L fills/closes
      if (tradingLive && (tpl.action === 'FILL' || tpl.action === 'CLOSE')) {
        pushLog({
          agent: tpl.agent,
          action: tpl.action,
          pnl: null,
          detail:
            tpl.action === 'FILL'
              ? `FILLS idle · cooldown / waiting for flat ticket on tracked mint`
              : `RISK idle · no open live position to close`,
        })
        return
      }

      pushLog({
        agent: tpl.agent,
        action: tpl.action,
        pnl: tradingLive ? null : pnl,
        detail: tradingLive
          ? `${tpl.detail(coin)} · watching ${trackedMint.slice(0, 4)}…`
          : tpl.detail(coin),
      })

      if (!tradingLive && pnl !== null) {
        setBalance((b) => {
          const next = Number((b + pnl).toFixed(2))
          tick.current += 1
          setHistory((h) => [...h.slice(-80), { t: tick.current, balance: next }])
          if (pnl >= 0) setWins((w) => w + 1)
          else setLosses((l) => l + 1)
          return next
        })
      }

      setCandle((c) => {
        const last = c[c.length - 1] ?? 50
        const next = Math.max(8, Math.min(92, last + (Math.random() - 0.48) * 14))
        return [...c.slice(1), next]
      })

      if (Math.random() > 0.6) {
        setEvents((prev) =>
          prev.map((e) =>
            Math.random() > 0.5
              ? {
                  ...e,
                  intensity: Math.max(0.2, Math.min(1, e.intensity + (Math.random() - 0.5) * 0.3)),
                  x: Math.max(15, Math.min(85, e.x + (Math.random() - 0.5) * 8)),
                  y: Math.max(25, Math.min(75, e.y + (Math.random() - 0.5) * 8)),
                }
              : e,
          ),
        )
      }
    }, 2100)

    return () => {
      window.clearInterval(uptimeTimer)
      window.clearInterval(simTimer)
    }
  }, [])

  const pnl = Number((balance - INITIAL).toFixed(2))
  const total = wins + losses
  const winRate = total === 0 ? 0 : Number(((wins / total) * 100).toFixed(1))
  const tradingLive = Boolean(live?.enabled && isRealMint(live.mint || mint))

  return {
    balance,
    initial: INITIAL,
    pnl,
    winRate,
    wins,
    losses,
    uptime: formatUptime(uptimeMs),
    day: DAY_REPORT.day,
    trench: 5,
    books: 2,
    live: true,
    tradingLive,
    activeCoin,
    orders,
    stakePct: WORKING_STAKE_PCT,
    agents,
    history,
    logs,
    events,
    candle,
    mint,
    setMint,
    curveProgress,
    mcap,
    openPosition,
    pushLog,
  }
}

// silence unused type imports in some TS configs
export type { LogAction, SeatName }
