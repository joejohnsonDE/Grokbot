export type AgentStatus = 'IDLE' | 'ACTIVE' | 'HOLD' | 'KILL'

export type SeatName = 'SCAN' | 'VET' | 'BOOK' | 'SIZE' | 'FILLS' | 'RISK' | 'CHIEF'

export interface Agent {
  id: string
  name: SeatName
  role: string
  rule: string
  color: string
  status: AgentStatus
  /** false for the chief — never trades */
  trades: boolean
}

export const INITIAL_AGENTS: Agent[] = [
  {
    id: 'scan',
    name: 'SCAN',
    role: 'Discovery',
    rule: 'finds what moves and refuses nothing, on purpose',
    color: '#e8eef5',
    status: 'IDLE',
    trades: true,
  },
  {
    id: 'vet',
    name: 'VET',
    role: 'Filter',
    rule: "kills most of SCAN's list before it reaches the book",
    color: '#f5d547',
    status: 'IDLE',
    trades: true,
  },
  {
    id: 'book',
    name: 'BOOK',
    role: 'Selection',
    rule: 'only takes markets where price has not caught the headline yet',
    color: '#4da3ff',
    status: 'IDLE',
    trades: true,
  },
  {
    id: 'size',
    name: 'SIZE',
    role: 'Sizing',
    rule: 'clamps every ticket to 6% of bank · working stake ~2.4%',
    color: '#ff6bb5',
    status: 'IDLE',
    trades: true,
  },
  {
    id: 'fills',
    name: 'FILLS',
    role: 'Execution',
    rule: 'cancels instead of chasing when the book moves 3¢ against',
    color: '#3dff7a',
    status: 'IDLE',
    trades: true,
  },
  {
    id: 'risk',
    name: 'RISK',
    role: 'Close',
    rule: 'only seat that can close · wins every argument to hold',
    color: '#ff9a4d',
    status: 'IDLE',
    trades: true,
  },
  {
    id: 'chief',
    name: 'CHIEF',
    role: 'Ops',
    rule: 'never trades · owns the room, not the ticket',
    color: '#ff4d4d',
    status: 'HOLD',
    trades: false,
  },
]

export type LogAction =
  | 'SCAN'
  | 'VET'
  | 'BOOK'
  | 'SIZE'
  | 'FILL'
  | 'CANCEL'
  | 'HOLD'
  | 'CLOSE'

export interface ActivityEntry {
  id: string
  time: string
  agent: SeatName
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

export const MAX_TICKET_PCT = 6
export const WORKING_STAKE_PCT = 2.4

export const DAY_REPORT = {
  day: 10,
  open: 12010.97,
  close: 14713.44,
  pct: 22.5,
  coinDrawdownPct: 24,
  coinName: 'FATCOIN',
  coinPnl: 1728.47,
  predictionPnl: 974.0,
  predictionCount: 12,
  thesis: 'the bag was red and the shift was green',
  protocol:
    'nobody sizes their own idea, so a bad read costs one ticket instead of the bank',
}

export const LOG_TEMPLATES: Array<{
  action: LogAction
  agent: SeatName
  status: AgentStatus
  detail: (coin: string) => string
  pnl?: () => number
}> = [
  {
    action: 'SCAN',
    agent: 'SCAN',
    status: 'ACTIVE',
    detail: (c) =>
      `surfaced ${c} · bonding ${(35 + Math.random() * 55).toFixed(0)}% · refuses nothing on purpose`,
  },
  {
    action: 'VET',
    agent: 'VET',
    status: 'KILL',
    detail: (c) =>
      Math.random() > 0.35
        ? `killed ${c} · same headline ${1 + Math.floor(Math.random() * 3)}× already tonight`
        : `passed ${c} · story still ahead of the burn`,
  },
  {
    action: 'BOOK',
    agent: 'BOOK',
    status: 'ACTIVE',
    detail: (c) =>
      `booked ${c} · price has not caught the headline · gap ${(1.2 + Math.random() * 8).toFixed(1)} pts`,
  },
  {
    action: 'SIZE',
    agent: 'SIZE',
    status: 'ACTIVE',
    detail: (c) =>
      `sized ${c} · ticket ${WORKING_STAKE_PCT.toFixed(1)}% of bank (cap ${MAX_TICKET_PCT}%) · not own idea`,
  },
  {
    action: 'FILL',
    agent: 'FILLS',
    status: 'ACTIVE',
    detail: (c) => `filled ${c} · depth ${(10 + Math.random() * 28).toFixed(0)}k · no chase`,
    pnl: () => (Math.random() - 0.32) * 110,
  },
  {
    action: 'CANCEL',
    agent: 'FILLS',
    status: 'KILL',
    detail: (c) =>
      `canceled ${c} · book moved ${(3 + Math.random() * 4).toFixed(1)}¢ against · refuse chase`,
  },
  {
    action: 'HOLD',
    agent: 'RISK',
    status: 'HOLD',
    detail: (c) => `hold wins on ${c} · bag red / shift green · RISK keeps the seat`,
  },
  {
    action: 'CLOSE',
    agent: 'RISK',
    status: 'ACTIVE',
    detail: (c) => `closed ${c} · only RISK can · realized into the bank`,
    pnl: () => (Math.random() - 0.25) * 160,
  },
]
