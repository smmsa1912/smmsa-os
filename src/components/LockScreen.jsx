import { useEffect, useState } from 'react'
import { profile } from '../data'

const readClock = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
const readDate = () => new Date().toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })

export default function LockScreen({ onUnlock }) {
  const [clock, setClock] = useState(readClock)
  const [date, setDate] = useState(readDate)

  useEffect(() => {
    const tick = () => {
      setClock(readClock())
      setDate(readDate())
    }
    const timer = window.setInterval(tick, 15000)
    return () => window.clearInterval(timer)
  }, [])

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === 'Tab' || event.key === 'Shift' || event.key === 'Control' || event.key === 'Alt') return
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        onUnlock()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onUnlock])

  return (
    <main className="lock-screen" onClick={onUnlock}>
      <div className="lock-topline"><span>SMMSA-OS</span><span>PORTFOLIO READY</span></div>
      <section className="lock-center" aria-label="Lock screen">
        <div className="lock-time">{clock}</div>
        <div className="lock-date">{date}</div>
        <div className="lock-profile">
          <div className="lock-avatar" aria-hidden="true">{profile.name.split(' ').map((part) => part[0]).join('').slice(0, 2)}</div>
          <h1>{profile.name}</h1>
          <p>{profile.role}</p>
          <button type="button" className="lock-signin" onClick={(event) => { event.stopPropagation(); onUnlock() }}>
            Enter portfolio <span aria-hidden="true">→</span>
          </button>
        </div>
      </section>
    </main>
  )
}
