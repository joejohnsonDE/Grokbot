import {
  Connection,
  PublicKey,
  VersionedTransaction,
  type SendOptions,
} from '@solana/web3.js'

export type TradeAction = 'buy' | 'sell'

export interface TradeRequest {
  publicKey: string
  mint: string
  action: TradeAction
  /** SOL for buys; for sells use percent string like "100%" when selling all */
  amount: number | string
  denominatedInSol: boolean
  slippage?: number
  priorityFee?: number
  pool?: 'pump' | 'auto' | 'raydium' | 'pump-amm'
}

export interface TradeResult {
  signature: string
  explorerUrl: string
}

const TRADE_URL = '/api/pumpportal/trade-local'

export function getRpcEndpoint() {
  return (
    import.meta.env.VITE_SOLANA_RPC?.trim() ||
    'https://api.mainnet-beta.solana.com'
  )
}

export function getConnection() {
  return new Connection(getRpcEndpoint(), 'confirmed')
}

export async function buildAndSendTrade(
  req: TradeRequest,
  signAndSend: (
    tx: VersionedTransaction,
    opts?: SendOptions,
  ) => Promise<string>,
): Promise<TradeResult> {
  if (!req.mint || req.mint.length < 32) {
    throw new Error('Set a real pump.fun mint / CA before live trading')
  }
  let pubkey: PublicKey
  try {
    pubkey = new PublicKey(req.publicKey)
  } catch {
    throw new Error('Invalid wallet public key')
  }
  void pubkey

  const body = {
    publicKey: req.publicKey,
    action: req.action,
    mint: req.mint,
    denominatedInSol: req.denominatedInSol ? 'true' : 'false',
    amount: req.amount,
    slippage: req.slippage ?? 12,
    priorityFee: req.priorityFee ?? 0.00005,
    pool: req.pool ?? 'auto',
  }

  const response = await fetch(TRADE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    const text = await response.text().catch(() => response.statusText)
    throw new Error(`PumpPortal trade-local failed: ${text || response.status}`)
  }

  const data = new Uint8Array(await response.arrayBuffer())
  const tx = VersionedTransaction.deserialize(data)
  const signature = await signAndSend(tx)
  return {
    signature,
    explorerUrl: `https://solscan.io/tx/${signature}`,
  }
}

/** Working stake as SOL from wallet bank balance and percent clamp. */
export function sizeTicketSol(bankSol: number, stakePct: number, maxPct: number) {
  const pct = Math.min(Math.max(stakePct, 0.1), maxPct)
  const sol = (bankSol * pct) / 100
  // Floor tiny tickets; cap insane ones for safety
  return Number(Math.min(Math.max(sol, 0.001), bankSol * 0.95).toFixed(4))
}
