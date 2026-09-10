import { useCallback, useEffect, useRef, useState } from 'react'
import { chatCompletion } from '../lib/llm'
import type { AppSettings } from '../lib/settings'
import type { SeatName } from '../data/agents'

export interface AgentChatMessage {
  id: string
  at: number
  from: 'you' | SeatName | 'ROOM'
  text: string
}

const SEAT_VOICES: SeatName[] = ['SCAN', 'VET', 'BOOK', 'SIZE', 'FILLS', 'RISK', 'CHIEF']

function systemForSeat(seat: SeatName, mint: string, liveArmed: boolean) {
  return `You are ${seat}, one seat in The Groktagon pump.fun command center.
Speak in short trader ops tone (1-3 sentences). Never invent transaction signatures.
Tracked mint: ${mint || '(none)'}. Live trading armed: ${liveArmed ? 'yes' : 'no'}.
Seat job:
- SCAN: surfaces movers on pump.fun
- VET: kills weak ideas
- BOOK: only takes markets where price hasn't caught the headline
- SIZE: clamps tickets; never sizes own idea
- FILLS: executes / cancels; never chases
- RISK: only seat that can close; often argues to hold
- CHIEF: never trades; coordinates the room
If asked to buy/sell, remind the human that ARM LIVE + wallet approval is required.`
}

export function useAgentRuntime(opts: {
  settings: AppSettings
  mint: string
  liveArmed: boolean
  activeCoin: string
}) {
  const [messages, setMessages] = useState<AgentChatMessage[]>(() => [
    {
      id: 'boot',
      at: Date.now(),
      from: 'ROOM',
      text: 'Desk online. Default brain is local Ollama (free). Open Settings to switch providers or paste optional API keys.',
    },
  ])
  const [busy, setBusy] = useState(false)
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState<string | null>(null)
  const optsRef = useRef(opts)
  optsRef.current = opts
  const roster = useRef(0)

  const push = useCallback((from: AgentChatMessage['from'], text: string) => {
    setMessages((prev) =>
      [
        {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          at: Date.now(),
          from,
          text,
        },
        ...prev,
      ].slice(0, 80),
    )
  }, [])

  const askSeat = useCallback(
    async (seat: SeatName, userText: string) => {
      const { settings, mint, liveArmed } = optsRef.current
      if (!settings.agentsEnabled || settings.provider === 'rules') {
        push(seat, `(rules) acknowledged: ${userText.slice(0, 120)}`)
        return
      }
      setBusy(true)
      setError(null)
      setStatus(`${seat} thinking…`)
      try {
        const reply = await chatCompletion(settings, [
          { role: 'system', content: systemForSeat(seat, mint, liveArmed) },
          { role: 'user', content: userText },
        ])
        push(seat, reply)
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err)
        setError(msg)
        push('ROOM', msg)
      } finally {
        setBusy(false)
        setStatus('idle')
      }
    },
    [push],
  )

  const sendUser = useCallback(
    async (text: string) => {
      const trimmed = text.trim()
      if (!trimmed) return
      push('you', trimmed)
      // Route to CHIEF by default; user can @SEAT
      const mention = trimmed.match(/^@(\w+)\s+([\s\S]+)/i)
      if (mention) {
        const seat = mention[1].toUpperCase() as SeatName
        if (SEAT_VOICES.includes(seat)) {
          await askSeat(seat, mention[2])
          return
        }
      }
      await askSeat('CHIEF', trimmed)
    },
    [askSeat, push],
  )

  // Lightweight ambient seat chatter on a slow laptop-friendly interval
  useEffect(() => {
    const id = window.setInterval(() => {
      const { settings, mint, liveArmed, activeCoin } = optsRef.current
      if (!settings.agentsEnabled || settings.provider === 'rules' || busy) return
      const seat = SEAT_VOICES[roster.current % SEAT_VOICES.length]
      roster.current += 1
      // Skip CHIEF ambient spam most of the time
      if (seat === 'CHIEF' && Math.random() > 0.3) return

      void (async () => {
        setBusy(true)
        setStatus(`${seat} pulse…`)
        try {
          const reply = await chatCompletion(settings, [
            { role: 'system', content: systemForSeat(seat, mint, liveArmed) },
            {
              role: 'user',
              content: `Give a brief status pulse for the desk. Active coin label: ${activeCoin}. Keep it under 40 words.`,
            },
          ])
          push(seat, reply)
          setError(null)
        } catch (err) {
          // Soft-fail ambient so the UI stays usable offline
          const msg = err instanceof Error ? err.message : String(err)
          setError(msg)
        } finally {
          setBusy(false)
          setStatus('idle')
        }
      })()
    }, 55_000)

    return () => window.clearInterval(id)
  }, [busy, push])

  return { messages, busy, status, error, sendUser, askSeat, push }
}
