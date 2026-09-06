import { MetricsBar } from './components/MetricsBar'
import { BalanceChart } from './components/BalanceChart'
import { ActivityLog } from './components/ActivityLog'
import { EventFeed } from './components/EventFeed'
import { TradingFloor } from './components/TradingFloor'
import { AgentPanel } from './components/AgentPanel'
import { useSimulation } from './hooks/useSimulation'
import './App.css'

export default function App() {
  const sim = useSimulation()

  return (
    <div className="app-shell">
      <div className="scanlines" aria-hidden />
      <div className="grid-bg" aria-hidden />

      <MetricsBar sim={sim} />

      <main className="dashboard">
        <div className="col-main">
          <div className="row-top">
            <BalanceChart history={sim.history} />
            <ActivityLog logs={sim.logs} />
          </div>
          <EventFeed events={sim.events} />
          <TradingFloor
            agents={sim.agents}
            candle={sim.candle}
            activeCoin={sim.activeCoin}
            orders={sim.orders}
          />
        </div>
        <AgentPanel agents={sim.agents} />
      </main>

      <footer className="app-foot">
        <span>GROKBOT · local command</span>
        <span className="sep">/</span>
        <span>pump.fun bonding · solana</span>
        <span className="sep">/</span>
        <span className="pos">sim live</span>
      </footer>
    </div>
  )
}
