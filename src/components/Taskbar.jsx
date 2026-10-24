import { useEffect, useState } from 'react'
import { useOS } from '../store'
import { appMeta } from '../appMeta'
import PixelIcon from './PixelIcon'
import useTrashCount from '../useTrashCount'
import { appIconName } from '../appIconName'

const formatTime = (value) => value.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
const formatDate = (value) => value.toLocaleDateString([], { month: 'short', day: 'numeric' })

export default function Taskbar() {
  const windows = useOS((s) => s.windows)
  const activeId = useOS((s) => s.activeId)
  const startOpen = useOS((s) => s.startOpen)
  const toggleStart = useOS((s) => s.toggleStart)
  const taskbarClick = useOS((s) => s.taskbarClick)
  const openApp = useOS((s) => s.openApp)
  const sound = useOS((s) => s.sound)
  const toggleSound = useOS((s) => s.toggleSound)
  const [now, setNow] = useState(() => new Date())
  const clock = formatTime(now)
  const calendarDate = formatDate(now)
  const trashCount = useTrashCount()

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 15000)
    return () => clearInterval(timer)
  }, [])

  return (
    <footer className="taskbar">
      <button
        type="button"
        id="start-menu-trigger"
        className={`start-btn${startOpen ? ' pressed' : ''}`}
        onPointerDown={(e) => e.stopPropagation()}
        onClick={toggleStart}
        aria-expanded={startOpen}
        aria-controls="start-menu-panel"
      >
        <PixelIcon name="start" size={16} />
        Start
      </button>
      <div className="tasks">
        {windows.map((w) => (
          <button
            key={w.id}
            type="button"
            className={`task${w.id === activeId && !w.minimized ? ' on' : ''}`}
            onClick={() => taskbarClick(w.id)}
            aria-label={`${appMeta[w.appId].label}${w.minimized ? ' (minimized)' : w.id === activeId ? ' (active)' : ''}`}
            aria-pressed={w.id === activeId && !w.minimized}
          >
            <PixelIcon name={appIconName(w.appId, trashCount)} size={16} />
            <span>{appMeta[w.appId].label}</span>
          </button>
        ))}
      </div>
      <button type="button" className="quick-btn" onClick={() => openApp('quick')} aria-label="Open portfolio home">
        Home
      </button>
      <button
        type="button"
        className={`sound-btn${sound ? ' on' : ''}`}
        onClick={toggleSound}
        aria-label={`Turn sound effects ${sound ? 'off' : 'on'}`}
        aria-pressed={sound}
        title={`Sound effects: ${sound ? 'on' : 'off'}`}
      >
        {sound ? '◖))' : '◖×'}
      </button>
      <time
        className="clock"
        dateTime={now.toISOString()}
        aria-label={`Local time ${clock}, ${calendarDate}`}
        title={`${clock} · ${calendarDate}`}
      >
        <span>{clock}</span>
        <small>{calendarDate}</small>
      </time>
    </footer>
  )
}
