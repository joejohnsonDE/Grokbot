import { useState } from 'react'

export function MintWatch({
  mint,
  onWatch,
}: {
  mint: string
  onWatch: (mint: string) => void
}) {
  const [value, setValue] = useState(mint)

  return (
    <section className="panel mint-panel">
      <div className="panel-head">
        <h2>Watch Mint</h2>
        <span className="panel-meta">pump.fun CA</span>
      </div>
      <form
        className="mint-form"
        onSubmit={(e) => {
          e.preventDefault()
          const next = value.trim()
          if (next) onWatch(next)
        }}
      >
        <input
          className="mint-input"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Token mint address"
          spellCheck={false}
          aria-label="Token mint address"
        />
        <button type="submit" className="mint-btn">
          TRACK
        </button>
      </form>
      <p className="mint-hint">Agents will bias research / fills toward this CA.</p>
    </section>
  )
}
