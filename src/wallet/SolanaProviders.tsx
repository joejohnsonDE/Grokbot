import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  ConnectionProvider,
  WalletProvider,
  useConnection,
  useWallet,
} from '@solana/wallet-adapter-react'
import { WalletModalProvider, WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom'
import { SolflareWalletAdapter } from '@solana/wallet-adapter-solflare'
import { VersionedTransaction, type SendOptions } from '@solana/web3.js'
import { getRpcEndpoint, buildAndSendTrade, type TradeAction, type TradeResult } from '../lib/pumpTrade'

import '@solana/wallet-adapter-react-ui/styles.css'

interface LiveTradingContextValue {
  connected: boolean
  publicKey: string | null
  solBalance: number | null
  liveArmed: boolean
  setLiveArmed: (v: boolean) => void
  ticketSol: number
  setTicketSol: (v: number) => void
  slippage: number
  setSlippage: (v: number) => void
  lastError: string | null
  lastTrade: TradeResult | null
  busy: boolean
  execute: (args: {
    action: TradeAction
    mint: string
    amount?: number | string
    denominatedInSol?: boolean
  }) => Promise<TradeResult | null>
  refreshBalance: () => Promise<void>
}

const LiveTradingContext = createContext<LiveTradingContextValue | null>(null)

function LiveTradingInner({ children }: { children: ReactNode }) {
  const { connection } = useConnection()
  const wallet = useWallet()
  const [liveArmed, setLiveArmed] = useState(false)
  const [ticketSol, setTicketSol] = useState(0.05)
  const [slippage, setSlippage] = useState(12)
  const [solBalance, setSolBalance] = useState<number | null>(null)
  const [lastError, setLastError] = useState<string | null>(null)
  const [lastTrade, setLastTrade] = useState<TradeResult | null>(null)
  const [busy, setBusy] = useState(false)

  const publicKey = wallet.publicKey?.toBase58() ?? null
  const connected = Boolean(wallet.connected && publicKey)

  const refreshBalance = useCallback(async () => {
    if (!wallet.publicKey) {
      setSolBalance(null)
      return
    }
    try {
      const lamports = await connection.getBalance(wallet.publicKey, 'confirmed')
      setSolBalance(lamports / 1e9)
    } catch {
      setSolBalance(null)
    }
  }, [connection, wallet.publicKey])

  useEffect(() => {
    void refreshBalance()
    if (!connected) {
      setLiveArmed(false)
      return
    }
    const id = window.setInterval(() => void refreshBalance(), 15_000)
    return () => window.clearInterval(id)
  }, [connected, refreshBalance])

  const execute = useCallback(
    async (args: {
      action: TradeAction
      mint: string
      amount?: number | string
      denominatedInSol?: boolean
    }) => {
      setLastError(null)
      if (!connected || !publicKey) {
        setLastError('Connect Phantom (or Solflare) first')
        return null
      }
      if (!liveArmed) {
        setLastError('Arm LIVE trading to send real txs')
        return null
      }
      if (!wallet.signTransaction) {
        setLastError('Wallet cannot sign transactions')
        return null
      }

      const amount =
        args.amount ??
        (args.action === 'buy' ? ticketSol : '100%')
      const denominatedInSol =
        args.denominatedInSol ?? args.action === 'buy'

      setBusy(true)
      try {
        const result = await buildAndSendTrade(
          {
            publicKey,
            mint: args.mint,
            action: args.action,
            amount,
            denominatedInSol,
            slippage,
            priorityFee: 0.00008,
            pool: 'auto',
          },
          async (tx: VersionedTransaction, _opts?: SendOptions) => {
            const signed = await wallet.signTransaction!(tx)
            const sig = await connection.sendRawTransaction(signed.serialize(), {
              skipPreflight: false,
              maxRetries: 3,
            })
            await connection.confirmTransaction(sig, 'confirmed')
            return sig
          },
        )
        setLastTrade(result)
        await refreshBalance()
        return result
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err)
        setLastError(msg)
        return null
      } finally {
        setBusy(false)
      }
    },
    [
      connected,
      publicKey,
      liveArmed,
      wallet,
      ticketSol,
      slippage,
      connection,
      refreshBalance,
    ],
  )

  const value: LiveTradingContextValue = {
    connected,
    publicKey,
    solBalance,
    liveArmed,
    setLiveArmed,
    ticketSol,
    setTicketSol,
    slippage,
    setSlippage,
    lastError,
    lastTrade,
    busy,
    execute,
    refreshBalance,
  }

  return (
    <LiveTradingContext.Provider value={value}>{children}</LiveTradingContext.Provider>
  )
}

export function SolanaProviders({ children }: { children: ReactNode }) {
  const endpoint = useMemo(() => getRpcEndpoint(), [])
  const wallets = useMemo(
    () => [new PhantomWalletAdapter(), new SolflareWalletAdapter()],
    [],
  )

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <LiveTradingInner>{children}</LiveTradingInner>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  )
}

export function useLiveTrading() {
  const ctx = useContext(LiveTradingContext)
  if (!ctx) throw new Error('useLiveTrading must be used inside SolanaProviders')
  return ctx
}

export { WalletMultiButton }
