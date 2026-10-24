import { useCallback, useEffect, useRef, useState } from 'react'

const LINES = [
  'SMMSA-OS PORTFOLIO BUILD',
  'Checking system memory.... OK',
  'Loading portfolio profile.. OK',
  'Loading sandboxed demo files. OK',
  'Loading desktop shell..... OK',
  'Starting window manager... OK',
  'Preparing portfolio desktop. OK',
]

export default function Boot({ onDone }) {
  const [shown, setShown] = useState(0)
  const finishedRef = useRef(false)
  const finishOnce = useCallback(() => {
    if (finishedRef.current) return
    finishedRef.current = true
    onDone()
  }, [onDone])

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const timer = window.setInterval(() => setShown((n) => Math.min(n + 1, LINES.length + 1)), reduce ? 50 : 300)
    return () => window.clearInterval(timer)
  }, [])

  useEffect(() => {
    if (shown <= LINES.length) return undefined
    const timer = window.setTimeout(finishOnce, 300)
    return () => window.clearTimeout(timer)
  }, [shown, finishOnce])

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === 'Tab') return
      finishOnce()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [finishOnce])

  const filled = Math.round((Math.min(shown, LINES.length) / LINES.length) * 20)

  return (
    <main className="boot" onClick={finishOnce} aria-label="SMMSA-OS startup screen">
      <div className="boot-inner">
        <div className="boot-brand-mark" aria-hidden="true">S</div>
        <h1 className="boot-title">SMMSA-OS</h1>
        <p className="boot-subtitle">INTERACTIVE DEVELOPER PORTFOLIO</p>
        <div className="boot-log" aria-live="polite">
          {LINES.slice(0, shown).map((line) => (
            <div key={line}>{line}</div>
          ))}
        </div>
        <div className="boot-progress-copy"><span>Starting your session</span><span>{filled * 5}%</span></div>
        <div className="boot-bar" aria-hidden="true">
          {Array.from({ length: 20 }, (_, i) => (
            <span key={i} className={i < filled ? 'on' : ''} />
          ))}
        </div>
        <button type="button" className="boot-skip" onClick={(event) => { event.stopPropagation(); finishOnce() }}>Skip startup →</button>
        <small className="boot-note">Press any key to continue</small>
      </div>
    </main>
  )
}
