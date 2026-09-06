# The Groktagon

Local **pump.fun** trench command center — multi-seat bonding-curve desk with a live (or simulated) launch feed.

## Run

```bash
npm install
npm run dev
```

## Protocol

One **CHIEF** who never trades + six seats:

| Seat | Owns |
|------|------|
| SCAN | Discovery on pump.fun (refuses nothing on purpose) |
| VET | Kill filter |
| BOOK | Only markets where mcap hasn't caught the headline |
| SIZE | Ticket clamp (6% max · ~2.4% working) |
| FILLS | Execute / cancel — never chase adverse curve moves |
| RISK | Only seat that can close |

## pump.fun surfaces

- Bonding curve progress toward PumpSwap graduation
- Mint / CA watch with direct pump.fun link
- Launch feed (PumpPortal websocket when available, sim fallback)
- SOL-denominated size / fill / close logs

Wire real trade execution into `useSimulation` when you're ready — the UI is local and keyless by default.
