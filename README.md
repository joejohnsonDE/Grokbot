# The Groktagon

Local **pump.fun** trench command center — multi-seat bonding-curve desk with wallet sign-in and optional live trading.

## Requirements

- Node.js 18+ (20/22 recommended)
- npm 9+
- Phantom or Solflare for live trading
- Optional: `VITE_SOLANA_RPC` (defaults to public Solana mainnet RPC)

## Install

```bash
git clone https://github.com/joejohnsonDE/Grokbot.git
cd Grokbot
git checkout cursor/groktagon-pumpfun-dashboard-35c0
npm install
npm run dev
```

Open the Vite URL (usually `http://localhost:5173`).

## Sign in (pump.fun)

On first load you’ll see a **Welcome back** gate matching pump.fun’s login options:

1. **Google / Apple / GitHub / email** — opens [pump.fun](https://pump.fun) so **you** complete social login there (app wallet stays with that method)
2. **Or connect a wallet** — Phantom / Solflare inside Groktagon (required for agents to sign buys/sells)

Then: track a mint → set ticket size → **ARM LIVE** → approve txs in your wallet.

## Protocol

| Seat | Owns |
|------|------|
| CHIEF | Never trades |
| SCAN | Discovery |
| VET | Kill filter |
| BOOK | Only markets where mcap hasn’t caught the headline |
| SIZE | Ticket clamp |
| FILLS | Buys (live when armed) |
| RISK | Sells / close only |

Keys never leave your wallet. Groktagon builds pump.fun txs via PumpPortal `trade-local` and you sign them locally.
