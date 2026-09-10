import { useMemo, useState } from 'react'
import { MetricsBar } from './components/MetricsBar'
import { BalanceChart } from './components/BalanceChart'
import { ActivityLog } from './components/ActivityLog'
import { EventFeed } from './components/EventFeed'
import { TradingFloor } from './components/TradingFloor'
import { AgentPanel } from './components/AgentPanel'
import { BondingCurve } from './components/BondingCurve'
import { MintWatch } from './components/MintWatch'
import { ProtocolPanel } from './components/ProtocolPanel'
import { LiveControls } from './components/LiveControls'
import { SignInGate } from './components/SignInGate'
import { SettingsMenu } from './components/SettingsMenu'
import { AgentChat } from './components/AgentChat'
import { LaunchFeed, usePumpLaunches } from './hooks/usePumpLaunches'
import { useSimulation } from './hooks/useSimulation'
import { useSettings } from './hooks/useSettings'
import { useAgentRuntime } from './hooks/useAgentRuntime'
import { useLiveTrading } from './wallet/SolanaProviders'
import { providerLabel } from './lib/settings'
import './App.css'

export default function App() {
  const wallet = useLiveTrading()
  const { launches, live: feedLive } = usePumpLaunches()
  const { settings, update, reset } = useSettings()
  const [settingsOpen, setSettingsOpen] = useState(false)

  const liveHooks = useMemo(
    () => ({
      enabled: wallet.liveArmed && wallet.connected,
      mint: '',
      ticketSol: wallet.ticketSol,
      cooldownMs: 45_000,
      onBuy: async (mint: string, sol: number) => {
        const res = await wallet.execute({
          action: 'buy',
          mint,
          amount: sol,
          denominatedInSol: true,
        })
        return res ? { signature: res.signature } : null
      },
      onSell: async (mint: string) => {
        const res = await wallet.execute({
          action: 'sell',
          mint,
          amount: '100%',
          denominatedInSol: false,
        })
        return res ? { signature: res.signature } : null
      },
    }),
    [wallet],
  )

  const sim = useSimulation(liveHooks)
  liveHooks.mint = sim.mint

  const agents = useAgentRuntime({
    settings,
    mint: sim.mint,
    liveArmed: wallet.liveArmed,
    activeCoin: sim.activeCoin,
  })

  const floorAgents = sim.agents.filter((a) => a.trades)
  const brain = settings.agentsEnabled ? providerLabel(settings.provider) : 'rules only'

  return (
    <div className="app-shell">
      <div className="scanlines" aria-hidden />
      <div className="grid-bg" aria-hidden />
      <SignInGate />
      <SettingsMenu
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        settings={settings}
        update={update}
        reset={reset}
      />

      <MetricsBar
        sim={sim}
        brainLabel={settings.provider}
        onOpenSettings={() => setSettingsOpen(true)}
      />

      <main className="dashboard">
        <div className="col-main">
          <div className="row-top">
            <BalanceChart history={sim.history} />
            <ActivityLog logs={sim.logs} />
          </div>
          <div className="row-mid">
            <LiveControls
              mint={sim.mint}
              onManualBuy={async () => {
                if (!sim.mint) return
                await wallet.execute({
                  action: 'buy',
                  mint: sim.mint,
                  amount: wallet.ticketSol,
                  denominatedInSol: true,
                })
              }}
              onManualSell={async () => {
                if (!sim.mint) return
                await wallet.execute({
                  action: 'sell',
                  mint: sim.mint,
                  amount: '100%',
                  denominatedInSol: false,
                })
              }}
            />
            <AgentChat
              messages={agents.messages}
              busy={agents.busy}
              status={agents.status}
              error={agents.error}
              providerLabel={brain}
              onSend={agents.sendUser}
            />
          </div>
          <div className="row-mid">
            <BondingCurve
              coin={sim.activeCoin}
              progress={sim.curveProgress}
              mcap={sim.mcap}
            />
            <MintWatch mint={sim.mint} onWatch={sim.setMint} />
          </div>
          <LaunchFeed launches={launches} live={feedLive} onTrack={sim.setMint} />
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
        <span>GROKBOT · laptop desk</span>
        <span className="sep">/</span>
        <span>{brain}</span>
        <span className="sep">/</span>
        <span>{wallet.connected ? 'signed in' : 'sign in with wallet'}</span>
        <span className="sep">/</span>
        <span className={wallet.liveArmed ? 'neg' : feedLive ? 'pos' : ''}>
          {wallet.liveArmed ? 'LIVE ARMED' : feedLive ? 'feed live' : 'sim seats'}
        </span>
      </footer>
    </div>
  )
}
