import type { Agent } from '../data/agents'

function AgentSprite({ agent, x, y }: { agent: Agent; x: number; y: number }) {
  const offline = !agent.trades
  return (
    <g transform={`translate(${x}, ${y})`} opacity={offline ? 0.35 : 1}>
      {/* desk */}
      <rect x="-10" y="8" width="28" height="6" fill="#1a2420" stroke="#2a3d32" strokeWidth="0.5" />
      <rect x="-6" y="0" width="8" height="8" fill="#0d1511" stroke="#3dff7a" strokeWidth="0.4" opacity="0.7" />
      <rect x="4" y="1" width="7" height="7" fill="#0d1511" stroke="#4da3ff" strokeWidth="0.4" opacity="0.55" />
      {/* character body */}
      <circle cx="4" cy="-2" r="5" fill={agent.color} />
      <rect x="1" y="2" width="6" height="6" fill={agent.color} opacity="0.85" />
      {/* eyes */}
      {!offline && (
        <>
          <circle cx="2.2" cy="-2.5" r="0.9" fill="#0a0f0a" />
          <circle cx="5.8" cy="-2.5" r="0.9" fill="#0a0f0a" />
          {agent.status !== 'IDLE' && (
            <circle cx="4" cy="-6.5" r="1.2" fill="#3dff7a" className="status-blink" />
          )}
        </>
      )}
      {offline && (
        <path d="M1,-5 L7,1 M7,-5 L1,1" stroke="#ff4d4d" strokeWidth="1.2" />
      )}
      <text
        x="4"
        y="22"
        textAnchor="middle"
        fill={agent.color}
        fontSize="4.5"
        fontFamily="IBM Plex Mono"
        fontWeight="700"
      >
        {agent.name}
      </text>
    </g>
  )
}

export function TradingFloor({
  agents,
  candle,
  activeCoin,
  orders,
}: {
  agents: Agent[]
  candle: number[]
  activeCoin: string
  orders: number
}) {
  const max = Math.max(...candle, 1)

  return (
    <section className="panel floor-panel">
      <div className="panel-head">
        <h2>Trading Floor</h2>
        <span className="ticker">
          <span className="ticker-scroll">
            {activeCoin} — {agents.filter((a) => a.trades).length} AGENTS — {orders}{' '}
            ORDERS — pump.fun trench — {activeCoin} —
          </span>
        </span>
      </div>

      <div className="floor-stage">
        <svg viewBox="0 0 320 180" className="floor-svg" role="img" aria-label="Trading floor">
          <defs>
            <linearGradient id="wallGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0c1610" />
              <stop offset="100%" stopColor="#060a08" />
            </linearGradient>
            <linearGradient id="screenGlow" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#14301c" />
              <stop offset="100%" stopColor="#0a140e" />
            </linearGradient>
          </defs>

          {/* room */}
          <rect width="320" height="180" fill="url(#wallGrad)" />
          <rect x="0" y="120" width="320" height="60" fill="#080c0a" />
          <path d="M0,120 L160,95 L320,120" fill="#0a110d" stroke="#1a2e22" strokeWidth="0.5" />

          {/* flag */}
          <g transform="translate(18,28)">
            <rect width="28" height="16" fill="#1a2a4a" stroke="#3a5080" strokeWidth="0.5" />
            <rect width="10" height="8" fill="#2a3a6a" />
            {[0, 1, 2, 3].map((i) => (
              <rect key={i} x="10" y={i * 4} width="18" height="2" fill={i % 2 ? '#8a2030' : '#c8c8d0'} />
            ))}
          </g>

          {/* world map wall */}
          <g transform="translate(250, 22)">
            <rect width="52" height="32" fill="#0a120e" stroke="#1e3d2a" strokeWidth="0.6" />
            <ellipse cx="18" cy="16" rx="10" ry="8" fill="#14301c" />
            <ellipse cx="36" cy="14" rx="8" ry="7" fill="#12281a" />
            <circle cx="22" cy="12" r="1.5" fill="#ff4d4d" opacity="0.7" />
            <circle cx="38" cy="18" r="1.2" fill="#f5d547" opacity="0.7" />
          </g>

          {/* pentagon logo */}
          <g transform="translate(160, 28)">
            <polygon
              points="0,-16 15,-5 10,14 -10,14 -15,-5"
              fill="none"
              stroke="#3dff7a"
              strokeWidth="1.4"
            />
            <text
              y="3"
              textAnchor="middle"
              fill="#3dff7a"
              fontSize="5"
              fontFamily="Orbitron"
              fontWeight="700"
            >
              GROK
            </text>
          </g>

          {/* helicopter / jet silhouettes */}
          <g transform="translate(55, 36)" opacity="0.45">
            <ellipse cx="10" cy="6" rx="10" ry="3" fill="#2a3d32" />
            <rect x="8" y="0" width="4" height="6" fill="#2a3d32" />
            <line x1="0" y1="1" x2="20" y2="1" stroke="#3dff7a" strokeWidth="0.5" />
          </g>
          <g transform="translate(210, 40)" opacity="0.4">
            <path d="M0,8 L18,4 L28,8 L18,7 Z" fill="#2a3d32" />
            <path d="M10,4 L14,0 L16,4" fill="#2a3d32" />
          </g>

          {/* main monitor */}
          <g transform="translate(95, 42)">
            <rect width="130" height="58" rx="1" fill="#050805" stroke="#3dff7a" strokeWidth="1.2" />
            <rect x="3" y="3" width="124" height="52" fill="url(#screenGlow)" />
            {/* candles */}
            {candle.map((v, i) => {
              const h = (v / max) * 40
              const x = 8 + i * 4.8
              const y = 48 - h
              const up = i === 0 || v >= candle[i - 1]
              return (
                <g key={i}>
                  <line
                    x1={x + 1.2}
                    y1={y - 3}
                    x2={x + 1.2}
                    y2={y + h + 2}
                    stroke={up ? '#3dff7a' : '#ff4d4d'}
                    strokeWidth="0.5"
                    opacity="0.6"
                  />
                  <rect
                    x={x}
                    y={y}
                    width="2.4"
                    height={Math.max(h, 1)}
                    fill={up ? '#3dff7a' : '#ff4d4d'}
                  />
                </g>
              )
            })}
            <text
              x="8"
              y="12"
              fill="#6b8f76"
              fontSize="4"
              fontFamily="IBM Plex Mono"
            >
              {activeCoin}/SOL · bonding curve
            </text>
          </g>

          {/* agents at desks */}
          <AgentSprite agent={agents[0]} x={55} y={130} />
          <AgentSprite agent={agents[1]} x={115} y={128} />
          <AgentSprite agent={agents[2]} x={175} y={130} />
          <AgentSprite agent={agents[3]} x={85} y={158} />
          <AgentSprite agent={agents[4]} x={145} y={156} />
          <AgentSprite agent={agents[5]} x={205} y={158} />

          {/* floor lights */}
          <circle cx={40} cy={170} r="8" fill="#3dff7a" opacity="0.04" className="floor-glow" />
          <circle cx={280} cy={165} r="10" fill="#4da3ff" opacity="0.05" className="floor-glow" />
        </svg>
      </div>
    </section>
  )
}
