import { MetricsBar } from './components/MetricsBar'
import { BalanceChart } from './components/BalanceChart'
import { ActivityLog } from './components/ActivityLog'
import { EventFeed } from './components/EventFeed'
import { TradingFloor } from './components/TradingFloor'
import { AgentPanel } from './components/AgentPanel'
import { BondingCurve } from './components/BondingCurve'
import { MintWatch } from './components/MintWatch'
import { ProtocolPanel } from './components/ProtocolPanel'
import { LaunchFeed, usePumpLaunches } from './hooks/usePumpLaunches'
import { useSimulation } from './hooks/useSimulation'
import './App.css'

export default function App() {
  const sim = useSimulation()
  const floorAgents = sim.agents.filter((a) => a.trades)
  const { launches, live } = usePumpLaunches()

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
          <div className="row-mid">
            <BondingCurve
              coin={sim.activeCoin}
              progress={sim.curveProgress}
              mcap={sim.mcap}
            />
            <MintWatch mint={sim.mint} onWatch={sim.setMint} />
          </div>
          <LaunchFeed launches={launches} live={live} onTrack={sim.setMint} />
          <ProtocolPanel />
          <EventFeed events={sim.events} />
          <TradingFloor
            agents={floorAgents}
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
        <span className={live ? 'pos' : ''}>{live ? 'pump ws live' : 'sim live'}</span>
      </footer>
    </div>
  )
}
