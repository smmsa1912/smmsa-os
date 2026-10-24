import { useEffect, useRef, useState } from 'react'

function loadBest() {
  try { return Number(localStorage.getItem('smmsa-reaction-best')) || 0 } catch { return 0 }
}

export default function ReactionRush() {
  const [status, setStatus] = useState('idle')
  const [reaction, setReaction] = useState(null)
  const [best, setBest] = useState(loadBest)
  const timeout = useRef(null)
  const startAt = useRef(0)

  const start = () => {
    clearTimeout(timeout.current)
    setReaction(null)
    setStatus('waiting')
    timeout.current = setTimeout(() => {
      timeout.current = null
      startAt.current = performance.now()
      setStatus('ready')
    }, 1500 + Math.random() * 2200)
  }

  const hit = () => {
    if (status === 'waiting') {
      if (timeout.current === null) {
        start()
        return
      }
      clearTimeout(timeout.current)
      timeout.current = null
      setStatus('early')
      return
    }
    if (status === 'ready') {
      const time = Math.round(performance.now() - startAt.current)
      setReaction(time)
      setStatus('result')
      if (best === 0 || time < best) {
        setBest(time)
        try { localStorage.setItem('smmsa-reaction-best', String(time)) } catch { /* Best score remains in memory. */ }
      }
      return
    }
    if (status === 'idle' || status === 'early' || status === 'result') start()
  }

  useEffect(() => () => clearTimeout(timeout.current), [])
  return (
    <section className="game arcade-game reaction-game" aria-label="Reaction Rush game">
      <div className="game-intro">
        <div><span className="game-kicker">REFLEX CHALLENGE</span><h3>Reaction Rush</h3><p>Wait for green. Tap as fast as you can.</p></div>
        <div className="game-stats"><span>Personal best <strong>{best ? `${best} ms` : '—'}</strong></span></div>
      </div>
      <button type="button" className={`reaction-zone reaction-${status}`} onClick={hit} aria-live="polite" aria-label="Reaction game button">
        {status === 'idle' && <><span className="reaction-light">✦</span><strong>Ready?</strong><span>Tap to begin</span></>}
        {status === 'waiting' && <><span className="reaction-light">…</span><strong>Wait for green</strong><span>Don't click yet!</span></>}
        {status === 'ready' && <><span className="reaction-light">⚡</span><strong>NOW!</strong><span>Click as fast as possible</span></>}
        {status === 'early' && <><span className="reaction-light">!</span><strong>Too soon!</strong><span>Tap to try again</span></>}
        {status === 'result' && <><span className="reaction-light">✓</span><strong>{reaction} ms</strong><span>{reaction < 220 ? 'Pixel-fast reflexes!' : reaction < 320 ? 'Nice reaction!' : 'Try to beat your best.'}</span><span className="reaction-repeat">Tap to go again</span></>}
      </button>
      <div className="reaction-metrics">
        <div><span>YOUR LAST RUN</span><strong>{reaction ? `${reaction} ms` : 'Not yet'}</strong></div>
        <div><span>HINT</span><strong>Anticipating counts as a false start</strong></div>
      </div>
      <p className="game-hint">The timer starts only when the target turns green. Best time is saved on this device.</p>
    </section>
  )
}
