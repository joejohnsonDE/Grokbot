# The Groktagon

Laptop-friendly **pump.fun** trench command center — seats, wallet sign-in, and AI agents that default to **free local Ollama**.

## Requirements

- Node.js 18+ / npm 9+
- Modern browser
- Optional for AI chat: [Ollama](https://ollama.com) on the same laptop
- Optional for live trades: Phantom/Solflare + SOL

## Install

```bash
git clone https://github.com/joejohnsonDE/Grokbot.git
cd Grokbot
git checkout cursor/groktagon-pumpfun-dashboard-35c0
npm install
npm run dev
```

### Free AI on this laptop (default)

```bash
# install Ollama, then:
ollama pull llama3.2
ollama serve
```

Open the app → **SETTINGS** → provider should be **Ollama (free · local)** → **Test connection**.

## Settings (API keys)

Open **SETTINGS** in the header. Keys are stored only in **browser localStorage** (not git).

| Provider | Cost | Notes |
|----------|------|--------|
| Ollama | Free | Default · runs on your laptop |
| Gemini | Free tier | Paste API key |
| Groq | Free tier | Paste API key |
| OpenRouter | Free models | Paste API key |
| OpenAI | Paid | Paste API key |
| Rules only | Free | No LLM calls |

## Agent chat

Use **Agent Comms** to talk to the room. Examples:

- `what's moving?` → CHIEF
- `@SCAN find fresh pump.fun launches`
- `@RISK should we hold?`

## Sign in / live trades

1. Welcome gate → social login on pump.fun and/or connect Phantom
2. Track a mint
3. **ARM LIVE** for real FILLS/RISK txs (wallet approval required)
