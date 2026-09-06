export type AgentStatus = 'IDLE' | 'ACTIVE' | 'SCAN' | 'FILL' | 'OFF'

export type AgentRole =
  | 'Pricing'
  | 'Scanner'
  | 'Settlement'
  | 'Sentiment'
  | 'Execution'
  | 'Ops'

export interface Agent {
  id: string
  name: string
  role: AgentRole
  color: string
  status: AgentStatus
  desk: { x: number; y: number }
}

export const INITIAL_AGENTS: Agent[] = [
  {
    id: 'bram',
    name: 'BRAM',
    role: 'Pricing',
    color: '#f5d547',
    status: 'IDLE',
    desk: { x: 18, y: 58 },
  },
  {
    id: 'holt',
    name: 'HOLT',
    role: 'Scanner',
    color: '#e8eef5',
    status: 'IDLE',
    desk: { x: 38, y: 58 },
  },
  {
    id: 'rigo',
    name: 'RIGO',
    role: 'Settlement',
    color: '#ff6bb5',
    status: 'IDLE',
    desk: { x: 58, y: 58 },
  },
  {
    id: 'ilsa',
    name: 'ILSA',
    role: 'Sentiment',
    color: '#3dff7a',
    status: 'IDLE',
    desk: { x: 22, y: 78 },
  },
  {
    id: 'kett',
    name: 'KETT',
    role: 'Execution',
    color: '#4da3ff',
    status: 'IDLE',
    desk: { x: 42, y: 78 },
  },
  {
    id: 'tess',
    name: 'TESS',
    role: 'Ops',
    color: '#ff4d4d',
    status: 'OFF',
    desk: { x: 62, y: 78 },
  },
]

export type LogAction = 'FILL' | 'SETTLE' | 'RESEARCH' | 'ORDER' | 'SCAN' | 'QUOTE'

export interface ActivityEntry {
  id: string
  time: string
  agent: string
  action: LogAction
  pnl: number | null
  detail: string
}

export interface BalancePoint {
  t: number
  balance: number
}

export interface RegionalEvent {
  id: string
  region: 'AMERICAS' | 'ATLANTIC' | 'ASIA / PACIFIC'
  label: string
  intensity: number
  x: number
  y: number
}

export const PUMP_COINS = [
  'FATCOIN',
  'PEPE2',
  'BONKJR',
  'MOONDOG',
  'WIFHAT',
  'GIGACHAD',
  'TRENCH',
  'BOOKS',
] as const

export const LOG_TEMPLATES: Array<{
  action: LogAction
  agents: string[]
  detail: (coin: string) => string
  pnl?: () => number
}> = [
  {
    action: 'FILL',
    agents: ['KETT', 'BRAM'],
    detail: (c) => `filled ${c} bid · depth ${(12 + Math.random() * 30).toFixed(0)}k on the bid side`,
    pnl: () => (Math.random() - 0.35) * 120,
  },
  {
    action: 'SETTLE',
    agents: ['RIGO'],
    detail: (c) => `settled ${c} lot · spread ${(0.4 + Math.random() * 2).toFixed(1)}c`,
    pnl: () => (Math.random() - 0.2) * 80,
  },
  {
    action: 'RESEARCH',
    agents: ['ILSA', 'HOLT'],
    detail: (c) =>
      `${c} social spike · headline age ${Math.floor(1 + Math.random() * 12)}m, still ahead of the burn`,
  },
  {
    action: 'ORDER',
    agents: ['KETT', 'BRAM'],
    detail: (c) =>
      `posted ${c} limit · gap ${(2 + Math.random() * 10).toFixed(1)} pts against our line`,
  },
  {
    action: 'SCAN',
    agents: ['HOLT'],
    detail: (c) =>
      `curve scan ${c} · bonding ${(40 + Math.random() * 55).toFixed(0)}% · unique ${(80 + Math.random() * 400).toFixed(0)}`,
  },
  {
    action: 'QUOTE',
    agents: ['BRAM'],
    detail: (c) =>
      `repriced ${c} · mid ${(0.00001 + Math.random() * 0.002).toExponential(2)} SOL`,
  },
]
