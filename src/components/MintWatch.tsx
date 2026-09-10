import { useEffect, useState } from 'react'

export function MintWatch({
  mint,
  onWatch,
}: {
  mint: string
  onWatch: (mint: string) => void
}) {
  const [value, setValue] = useState(mint)

  useEffect(() => {
    setValue(mint)
  }, [mint])

  const href = mint ? `https://pump.fun/coin/${mint}` : 'https://pump.fun'

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
          placeholder="Token mint / CA"
          spellCheck={false}
          aria-label="Token mint address"
        />
        <button type="submit" className="mint-btn">
          TRACK
        </button>
      </form>
      <div className="mint-footer">
        <p className="mint-hint">Seats bias SCAN / FILLS toward this CA · sizes still owned by SIZE.</p>
        <a className="mint-open" href={href} target="_blank" rel="noreferrer">
          open on pump.fun ↗
        </a>
      </div>
    </section>
  )
}
