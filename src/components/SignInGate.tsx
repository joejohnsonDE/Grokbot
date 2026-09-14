import { WalletMultiButton, useLiveTrading } from '../wallet/SolanaProviders'

const PUMP_LOGIN = 'https://pump.fun/'

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.9 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34.2 6.1 29.4 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.5-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3 0 5.8 1.1 7.9 3l5.7-5.7C34.2 6.1 29.4 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.3 26.7 36 24 36c-5.3 0-9.7-3.1-11.3-7.5l-6.5 5C9.6 39.6 16.3 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-1.1 3.2-3.5 5.7-6.5 7.1l.1.1 6.2 5.2C36.9 39 44 34 44 24c0-1.3-.1-2.5-.4-3.5z" />
    </svg>
  )
}

function AppleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M16.4 12.7c0-2 1.6-3 1.7-3.1-1-1.4-2.5-1.6-3-1.7-1.3-.1-2.5.8-3.1.8-.6 0-1.6-.7-2.7-.7-1.4 0-2.7.8-3.4 2.1-1.5 2.5-.4 6.3 1 8.4.7 1 1.5 2.1 2.6 2.1 1 0 1.4-.7 2.7-.7s1.6.7 2.7.7c1.1 0 1.8-1 2.5-2 .8-1.1 1.1-2.2 1.1-2.3-.1 0-2.1-.8-2.1-3.3zM14.5 6.5c.6-.7 1-1.7.9-2.7-1 .1-2.1.6-2.7 1.4-.6.7-1.1 1.7-.9 2.7 1 .1 2-.5 2.7-1.4z" />
    </svg>
  )
}

function GitHubIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2C6.5 2 2 6.6 2 12.2c0 4.5 2.9 8.3 6.9 9.6.5.1.7-.2.7-.5v-1.9c-2.8.6-3.4-1.4-3.4-1.4-.5-1.1-1.1-1.4-1.1-1.4-.9-.6.1-.6.1-.6 1 .1 1.5 1 1.5 1 .9 1.6 2.4 1.1 3 .9.1-.7.4-1.1.6-1.4-2.2-.3-4.6-1.2-4.6-5.1 0-1.1.4-2 1-2.7-.1-.3-.4-1.3.1-2.7 0 0 .8-.3 2.8 1 .8-.2 1.6-.3 2.4-.3s1.6.1 2.4.3c1.9-1.3 2.7-1 2.7-1 .5 1.4.2 2.4.1 2.7.6.7 1 1.6 1 2.7 0 4-2.3 4.8-4.6 5.1.4.3.7.9.7 1.9v2.8c0 .3.2.6.7.5 4-1.3 6.9-5.1 6.9-9.6C22 6.6 17.5 2 12 2z" />
    </svg>
  )
}

export function SignInGate() {
  const live = useLiveTrading()
  if (live.connected) return null

  return (
    <div className="signin-gate" role="dialog" aria-modal="true" aria-labelledby="signin-title">
      <div className="signin-card pump-login">
        <div className="signin-pill" aria-hidden />
        <h2 id="signin-title">Welcome back</h2>
        <p className="signin-copy">Sign in to start trading.</p>

        <a className="signin-google" href={PUMP_LOGIN} target="_blank" rel="noreferrer">
          <GoogleIcon />
          Continue with Google
        </a>

        <div className="signin-social-row">
          <a className="signin-social" href={PUMP_LOGIN} target="_blank" rel="noreferrer" aria-label="Continue with Apple on pump.fun">
            <AppleIcon />
          </a>
          <a className="signin-social" href={PUMP_LOGIN} target="_blank" rel="noreferrer" aria-label="Continue with GitHub on pump.fun">
            <GitHubIcon />
          </a>
        </div>

        <form
          className="signin-email"
          onSubmit={(e) => {
            e.preventDefault()
            window.open(PUMP_LOGIN, '_blank', 'noopener,noreferrer')
          }}
        >
          <input type="email" placeholder="you@example.com" aria-label="Email" />
          <button type="submit" aria-label="Continue with email on pump.fun">
            →
          </button>
        </form>

        <div className="signin-note">
          Already using the pump app? Sign in on pump.fun with the same method you use in the app and
          your app wallet comes with you. Open the GitHub button above, finish login there, then
          connect the same wallet here for agent trades.
        </div>

        <div className="signin-divider">
          <span>or connect a wallet</span>
        </div>

        <div className="signin-wallet-row">
          <WalletMultiButton />
        </div>

        <p className="signin-fineprint">
          Social login happens on <strong>pump.fun</strong> (you approve it). Groktagon agents sign
          trades through the wallet you connect below that login.
        </p>
      </div>
    </div>
  )
}
