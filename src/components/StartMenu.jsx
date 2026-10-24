import { useEffect, useMemo, useState } from 'react'
import { useOS } from '../store'
import { appMeta, appOrder } from '../appMeta'
import { profile } from '../data'
import PixelIcon from './PixelIcon'
import useTrashCount from '../useTrashCount'
import { appIconName } from '../appIconName'
import { loadPinnedApps, savePinnedApps } from '../pinStore'

export default function StartMenu() {
  const open = useOS((s) => s.startOpen)
  const openApp = useOS((s) => s.openApp)
  const recentApps = useOS((s) => s.recentApps)
  const lockOS = useOS((s) => s.lockOS)
  const restartOS = useOS((s) => s.restartOS)
  const closeStart = useOS((s) => s.closeStart)
  const [query, setQuery] = useState('')
  const [powerOpen, setPowerOpen] = useState(false)
  const [pinnedApps, setPinnedApps] = useState(loadPinnedApps)
  const trashCount = useTrashCount()

  useEffect(() => {
    if (!open) return undefined
    const onKeyDown = (event) => {
      if (event.key !== 'Escape') return
      event.preventDefault()
      if (powerOpen) {
        setPowerOpen(false)
      } else if (query) {
        setQuery('')
      } else {
        closeStart()
        document.getElementById('start-menu-trigger')?.focus()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, powerOpen, query, closeStart])

  const filteredApps = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return appOrder.filter((id) => {
      const meta = appMeta[id]
      return !needle || `${meta.title} ${meta.label} ${id}`.toLowerCase().includes(needle)
    })
  }, [query])
  const recent = recentApps.filter((id) => appMeta[id]).slice(0, 4)

  const togglePin = (id) => {
    const next = pinnedApps.includes(id) ? pinnedApps.filter((pin) => pin !== id) : [...pinnedApps, id]
    setPinnedApps(next)
    savePinnedApps(next)
  }

  if (!open) return null

  return (
    <nav id="start-menu-panel" className="start-menu" onPointerDown={(event) => event.stopPropagation()} aria-label="Start menu">
      <header className="start-user">
        <div className="start-avatar">{profile.name.split(' ').map((part) => part[0]).join('').slice(0, 2)}</div>
        <div className="start-user-copy"><strong>{profile.name}</strong><span>{profile.role}</span></div>
        <span className="start-session-dot" title="Local demo session" />
      </header>
      <label className="start-search">
        <span aria-hidden="true">⌕</span>
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search apps" aria-label="Search apps" autoComplete="off" />
        {query && <button type="button" aria-label="Clear search" onClick={() => setQuery('')}>×</button>}
      </label>

      {query ? (
        <section className="start-section">
          <div className="start-section-title"><span>SEARCH RESULTS</span><small>{filteredApps.length} apps</small></div>
          <div className="start-app-list">
            {filteredApps.length ? filteredApps.map((id) => (
              <div key={id} className="start-app-row">
                <button type="button" className="start-app-open" onClick={() => openApp(id)}>
                  <PixelIcon name={appIconName(id, trashCount)} size={21} />
                  <span><strong>{appMeta[id].title}</strong><small>{appMeta[id].label}</small></span>
                  <b aria-hidden="true">↗</b>
                </button>
                <button type="button" className="start-pin-toggle" onClick={() => togglePin(id)} aria-label={`${pinnedApps.includes(id) ? 'Unpin' : 'Pin'} ${appMeta[id].title}`} title={pinnedApps.includes(id) ? 'Unpin from Start' : 'Pin to Start'}>{pinnedApps.includes(id) ? '★' : '☆'}</button>
              </div>
            )) : <p className="start-empty">No apps found. Try another search.</p>}
          </div>
        </section>
      ) : (
        <>
          <section className="start-section">
            <div className="start-section-title"><span>Pinned</span><small>{pinnedApps.length} apps · click ★ below to edit</small></div>
            {pinnedApps.length ? (
              <div className="start-pinned">
                {pinnedApps.map((id) => (
                  <button key={id} type="button" onClick={() => openApp(id)} title={appMeta[id].title}>
                    <span className="start-pin-icon"><PixelIcon name={appIconName(id, trashCount)} size={25} /></span>
                    <span>{appMeta[id].label}</span>
                  </button>
                ))}
              </div>
            ) : <p className="start-empty">Pin your favorite apps in the All apps section below.</p>}
          </section>
          <section className="start-section start-recent-section">
            <div className="start-section-title"><span>Recent</span><small>Recently opened</small></div>
            <div className="start-recent">
              {recent.length ? recent.map((id) => (
                <button key={id} type="button" onClick={() => openApp(id)}>
                  <PixelIcon name={appIconName(id, trashCount)} size={19} />
                  <span><strong>{appMeta[id].title}</strong><small>App · Open again</small></span>
                </button>
              )) : <p className="start-empty">Your recent apps will show up here.</p>}
            </div>
          </section>
          <section className="start-section start-all-section">
            <div className="start-section-title"><span>All apps</span><small>{appOrder.length} available</small></div>
            <div className="start-all-grid">
              {appOrder.map((id) => (
                <div key={id} className="start-all-row">
                  <button type="button" className="start-all-open" onClick={() => openApp(id)}>
                    <PixelIcon name={appIconName(id, trashCount)} size={17} /><span>{appMeta[id].label}</span>
                  </button>
                  <button type="button" className="start-pin-toggle" onClick={() => togglePin(id)} aria-label={`${pinnedApps.includes(id) ? 'Unpin' : 'Pin'} ${appMeta[id].title}`} title={pinnedApps.includes(id) ? 'Unpin from Start' : 'Pin to Start'}>{pinnedApps.includes(id) ? '★' : '☆'}</button>
                </div>
              ))}
              <a className="start-github-link" href={profile.github} target="_blank" rel="noopener noreferrer"><span aria-hidden="true">↗</span><span>GitHub</span></a>
            </div>
          </section>
        </>
      )}

      <footer className="start-power-row">
        <div className="start-footer-brand"><span className="brand-mark">S</span><span>SMMSA-OS <small>PERSONAL DESKTOP</small></span></div>
        <div className="start-power-wrap">
          {powerOpen && (
            <div className="start-power-menu">
              <button type="button" onClick={() => { setPowerOpen(false); lockOS() }}><span>◉</span> Lock</button>
              <button type="button" onClick={() => { setPowerOpen(false); restartOS() }}><span>↻</span> Restart</button>
            </div>
          )}
          <button type="button" className="start-power-button" onClick={() => setPowerOpen((value) => !value)} aria-expanded={powerOpen} aria-label="Power options" title="Power options">⏻</button>
        </div>
      </footer>
    </nav>
  )
}
