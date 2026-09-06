import { useEffect, useRef, useState } from 'react'
import {
  INITIAL_AGENTS,
  LOG_TEMPLATES,
  PUMP_COINS,
} from '../data/agents'
import type {
  ActivityEntry,
  Agent,
  BalancePoint,
  RegionalEvent,
} from '../data/agents'

const INITIAL = 12010.97
const DAY = 10
const DEMO_MINT = 'FatC01nPumpDemo1111111111111111111111111'

function pad(n: number) {
  return n.toString().padStart(2, '0')
}

function nowStamp(elapsedMs: number) {
  const total = Math.floor(elapsedMs / 1000)
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

function seedBalanceHistory(): BalancePoint[] {
  const pts: BalancePoint[] = []
  let bal = INITIAL
  for (let i = 0; i < 48; i++) {
    const spike = i > 30 && i < 38 ? 40 + Math.random() * 80 : (Math.random() - 0.4) * 25
    bal = Math.max(INITIAL * 0.98, bal + spike)
    pts.push({ t: i, balance: Number(bal.toFixed(2)) })
  }
  return pts
}

function seedLogs(): ActivityEntry[] {
  const entries: ActivityEntry[] = []
  for (let i = 0; i < 18; i++) {
    const tpl = LOG_TEMPLATES[i % LOG_TEMPLATES.length]
    const agent = tpl.agents[i % tpl.agents.length]
    const coin = PUMP_COINS[i % PUMP_COINS.length]
    const pnl = tpl.pnl ? tpl.pnl() : null
    entries.push({
      id: `seed-${i}`,
      time: nowStamp(i * 47_000 + 12_000),
      agent,
      action: tpl.action,
      pnl: pnl === null ? null : Number(pnl.toFixed(2)),
      detail: tpl.detail(coin),
    })
  }
  return entries.reverse()
}

function seedEvents(): RegionalEvent[] {
  return [
    { id: 'a1', region: 'AMERICAS', label: 'SOL volume', intensity: 0.9, x: 32, y: 48 },
    { id: 'a2', region: 'AMERICAS', label: 'whale', intensity: 0.55, x: 58, y: 38 },
    { id: 't1', region: 'ATLANTIC', label: 'listing', intensity: 0.7, x: 48, y: 42 },
    { id: 't2', region: 'ATLANTIC', label: 'rug watch', intensity: 0.4, x: 62, y: 55 },
    { id: 'p1', region: 'ASIA / PACIFIC', label: 'launch', intensity: 0.85, x: 55, y: 50 },
    { id: 'p2', region: 'ASIA / PACIFIC', label: 'bundle', intensity: 0.5, x: 70, y: 40 },
  ]
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
  activeCoin: string
  orders: number
  agents: Agent[]
  history: BalancePoint[]
  logs: ActivityEntry[]
  events: RegionalEvent[]
  candle: number[]
  mint: string
  setMint: (mint: string) => void
  curveProgress: number
  mcap: number
}

export function useSimulation(): SimulationState {
  const [agents, setAgents] = useState<Agent[]>(INITIAL_AGENTS)
  const [history, setHistory] = useState<BalancePoint[]>(seedBalanceHistory)
  const [logs, setLogs] = useState<ActivityEntry[]>(seedLogs)
  const [events, setEvents] = useState<RegionalEvent[]>(seedEvents)
  const [balance, setBalance] = useState(() => history[history.length - 1]?.balance ?? INITIAL)
  const [wins, setWins] = useState(3)
  const [losses, setLosses] = useState(3)
  const [orders, setOrders] = useState(12)
  const [activeCoin, setActiveCoin] = useState<string>('FATCOIN')
  const [mint, setMint] = useState(DEMO_MINT)
  const [curveProgress, setCurveProgress] = useState(62.4)
  const [mcap, setMcap] = useState(48_200)
  const [uptimeMs, setUptimeMs] = useState(23 * 60_000 + 48_000)
  const [candle, setCandle] = useState(() =>
    Array.from({ length: 24 }, (_, i) => 40 + Math.sin(i / 3) * 18 + Math.random() * 10),
  )
  const tick = useRef(history.length)

  useEffect(() => {
    const uptimeTimer = window.setInterval(() => {
      setUptimeMs((v) => v + 1000)
    }, 1000)

    const simTimer = window.setInterval(() => {
      const tpl = LOG_TEMPLATES[Math.floor(Math.random() * LOG_TEMPLATES.length)]
      const agentName = tpl.agents[Math.floor(Math.random() * tpl.agents.length)]
      const coin = PUMP_COINS[Math.floor(Math.random() * PUMP_COINS.length)]
      const pnlRaw = tpl.pnl ? tpl.pnl() : null
      const pnl = pnlRaw === null ? null : Number(pnlRaw.toFixed(2))

      setActiveCoin(coin)
      setOrders((o) => o + (tpl.action === 'ORDER' || tpl.action === 'FILL' ? 1 : 0))
      setCurveProgress((p) =>
        Math.max(5, Math.min(99, Number((p + (Math.random() - 0.42) * 2.4).toFixed(1)))),
      )
      setMcap((m) => Math.max(8_000, Math.round(m + (Math.random() - 0.45) * 1800)))

      setAgents((prev) =>
        prev.map((a) => {
          if (a.name === 'TESS') return { ...a, status: 'OFF' }
          if (a.name === agentName) {
            const map: Record<string, Agent['status']> = {
              FILL: 'FILL',
              SETTLE: 'ACTIVE',
              RESEARCH: 'SCAN',
              ORDER: 'ACTIVE',
              SCAN: 'SCAN',
              QUOTE: 'ACTIVE',
            }
            return { ...a, status: map[tpl.action] ?? 'ACTIVE' }
          }
          if (a.status !== 'OFF' && Math.random() > 0.55) {
            return { ...a, status: 'IDLE' }
          }
          return a
        }),
      )

      setLogs((prev) => {
        const entry: ActivityEntry = {
          id: `live-${Date.now()}`,
          time: nowStamp(Date.now() % 86_400_000),
          agent: agentName,
          action: tpl.action,
          pnl,
          detail: tpl.detail(coin),
        }
        return [entry, ...prev].slice(0, 60)
      })

      if (pnl !== null) {
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
    }, 2200)

    return () => {
      window.clearInterval(uptimeTimer)
      window.clearInterval(simTimer)
    }
  }, [])

  const pnl = Number((balance - INITIAL).toFixed(2))
  const total = wins + losses
  const winRate = total === 0 ? 0 : Number(((wins / total) * 100).toFixed(1))

  return {
    balance,
    initial: INITIAL,
    pnl,
    winRate,
    wins,
    losses,
    uptime: formatUptime(uptimeMs),
    day: DAY,
    trench: 5,
    books: 2,
    live: true,
    activeCoin,
    orders,
    agents,
    history,
    logs,
    events,
    candle,
    mint,
    setMint,
    curveProgress,
    mcap,
  }
}
