import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { BalancePoint } from '../data/agents'

function money(n: number) {
  return n.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  })
}

export function BalanceChart({ history }: { history: BalancePoint[] }) {
  const last = history[history.length - 1]?.balance ?? 0

  return (
    <section className="panel chart-panel">
      <div className="panel-head">
        <h2>Balance History</h2>
        <span className="panel-meta pos">{money(last)}</span>
      </div>
      <div className="chart-wrap">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={history} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="balFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3dff7a" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#3dff7a" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="rgba(61,255,122,0.08)" vertical={false} />
            <XAxis dataKey="t" hide />
            <YAxis
              domain={['dataMin - 40', 'dataMax + 40']}
              tickFormatter={(v) => `$${Math.round(v / 1000)}k`}
              width={42}
              tick={{ fill: '#6b8f76', fontSize: 10, fontFamily: 'IBM Plex Mono' }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                background: '#0b120e',
                border: '1px solid #1e3d2a',
                borderRadius: 0,
                fontFamily: 'IBM Plex Mono',
                fontSize: 11,
              }}
              labelFormatter={() => 'balance'}
              formatter={(value) => [money(Number(value ?? 0)), '']}
            />
            <Area
              type="monotone"
              dataKey="balance"
              stroke="#3dff7a"
              strokeWidth={2}
              fill="url(#balFill)"
              isAnimationActive={false}
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </section>
  )
}
