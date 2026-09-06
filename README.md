# The Groktagon

Local **pump.fun** trench command center — a live-sim dashboard inspired by multi-agent trading floors.

## Run

```bash
npm install
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`).

## What’s included

- **Metrics bar** — balance, P&L, win rate, uptime, trench/books tags
- **Balance history** — live area chart
- **Activity stream** — FILL / SETTLE / RESEARCH / ORDER / SCAN / QUOTE from desk agents
- **Global event feed** — Americas / Atlantic / Asia-Pacific heat maps
- **Trading floor** — pixel-art war room with candlestick screen + agent sprites
- **Agent roster** — BRAM, HOLT, RIGO, ILSA, KETT, TESS with live status

Data is simulated client-side so the UI runs with zero API keys. Wire real pump.fun / Solana feeds into `useSimulation` when you’re ready.
