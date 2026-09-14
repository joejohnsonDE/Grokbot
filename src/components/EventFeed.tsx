import type { RegionalEvent } from '../data/agents'

const REGIONS: RegionalEvent['region'][] = ['AMERICAS', 'ATLANTIC', 'ASIA / PACIFIC']

function MiniMap({
  region,
  events,
}: {
  region: RegionalEvent['region']
  events: RegionalEvent[]
}) {
  const dots = events.filter((e) => e.region === region)

  return (
    <div className="event-map">
      <div className="event-map-label">{region}</div>
      <svg viewBox="0 0 100 70" className="event-svg" aria-hidden>
        <rect width="100" height="70" fill="#07100b" />
        <path
          d="M8,40 C18,28 28,22 40,30 C52,38 58,20 72,28 C82,34 90,42 94,50 L90,58 C70,62 40,60 20,55 Z"
          fill="#12261a"
          stroke="#1e3d2a"
          strokeWidth="0.6"
        />
        <path
          d="M12,52 C22,48 30,50 38,55 C46,60 55,52 65,54"
          fill="none"
          stroke="#1a3324"
          strokeWidth="0.8"
        />
        {dots.map((d) => (
          <g key={d.id}>
            <circle
              cx={d.x}
              cy={d.y}
              r={3 + d.intensity * 5}
              fill={d.intensity > 0.7 ? '#ff4d4d' : '#f5d547'}
              opacity={0.25 + d.intensity * 0.45}
              className="heat-pulse"
            />
            <circle
              cx={d.x}
              cy={d.y}
              r={1.4}
              fill={d.intensity > 0.7 ? '#ff8a8a' : '#ffe08a'}
            />
          </g>
        ))}
      </svg>
      <div className="event-captions">
        {dots.map((d) => (
          <span key={d.id} className={d.intensity > 0.7 ? 'hot' : ''}>
            {d.label}
          </span>
        ))}
      </div>
    </div>
  )
}

export function EventFeed({ events }: { events: RegionalEvent[] }) {
  return (
    <section className="panel event-panel">
      <div className="panel-head">
        <h2>Global Event Feed</h2>
        <span className="panel-meta">pump.fun · geo heat</span>
      </div>
      <div className="event-grid">
        {REGIONS.map((region) => (
          <MiniMap key={region} region={region} events={events} />
        ))}
      </div>
    </section>
  )
}
