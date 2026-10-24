import { useEffect, useRef, useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { useOS } from '../store'
import { appMeta, appOrder } from '../appMeta'
import useIsMobile from '../useIsMobile'
import PixelIcon from './PixelIcon'
import useTrashCount from '../useTrashCount'
import { appIconName } from '../appIconName'
import Window from './Window'
import StartMenu from './StartMenu'

const ICON_W = 92
const ICON_H = 88
const ICON_STEP_X = 102
const ICON_STEP_Y = 98
const DRAG_THRESHOLD = 4

function defaultPosition(index, desktopWidth, desktopHeight) {
  const rows = Math.max(1, Math.floor((desktopHeight - 24) / ICON_STEP_Y))
  const column = Math.floor(index / rows)
  const row = index % rows
  const maxX = Math.max(0, desktopWidth - ICON_W)
  return {
    x: Math.min(14 + column * ICON_STEP_X, maxX),
    y: Math.min(14 + row * ICON_STEP_Y, Math.max(0, desktopHeight - ICON_H)),
  }
}

export default function Desktop() {
  const desktopRef = useRef(null)
  const dragRef = useRef(null)
  const latestPositionsRef = useRef({})
  const suppressClickRef = useRef(null)
  const windows = useOS((s) => s.windows)
  const openApp = useOS((s) => s.openApp)
  const closeStart = useOS((s) => s.closeStart)
  const wallpaper = useOS((s) => s.wallpaper)
  const iconPositions = useOS((s) => s.iconPositions)
  const setIconPositions = useOS((s) => s.setIconPositions)
  const resetIconPositions = useOS((s) => s.resetIconPositions)
  const snapPreview = useOS((s) => s.snapPreview)
  const snapWindow = useOS((s) => s.snapWindow)
  const restoreWindow = useOS((s) => s.restoreWindow)
  const mobile = useIsMobile()
  const [selected, setSelected] = useState(null)
  const [dragging, setDragging] = useState(null)
  const [contextMenu, setContextMenu] = useState(null)
  const [draftPositions, setDraftPositions] = useState(iconPositions)
  const trashCount = useTrashCount()


  useEffect(() => {
    const handleWindowShortcut = (event) => {
      if (event.key === 'Escape') {
        setContextMenu(null)
        return
      }
      if (!(event.ctrlKey && event.altKey)) return
      if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) return
      const target = event.target
      if (target instanceof HTMLElement && (target.isContentEditable || target.closest('input, textarea, select, [contenteditable="true"]'))) return
      const { windows: openWindows, activeId } = useOS.getState()
      const activeWindow = openWindows.find((item) => item.id === activeId)
      if (!activeWindow) return
      event.preventDefault()
      if (event.key === 'ArrowLeft') snapWindow(activeWindow.id, 'left')
      else if (event.key === 'ArrowRight') snapWindow(activeWindow.id, 'right')
      else if (event.key === 'ArrowUp') snapWindow(activeWindow.id, 'max')
      else restoreWindow(activeWindow.id)
    }
    window.addEventListener('keydown', handleWindowShortcut)
    return () => window.removeEventListener('keydown', handleWindowShortcut)
  }, [restoreWindow, snapWindow])

  const positionFor = (id, index) => {
    const size = {
      width: window.innerWidth,
      height: window.innerHeight - 44,
    }
    const stored = draftPositions[id] ?? iconPositions[id]
    const pos = stored && Number.isFinite(stored.x) && Number.isFinite(stored.y)
      ? stored
      : defaultPosition(index, size.width, size.height)
    return {
      x: Math.max(0, Math.min(pos.x, Math.max(0, size.width - ICON_W))),
      y: Math.max(0, Math.min(pos.y, Math.max(0, size.height - ICON_H))),
    }
  }

  const handleDesktopPointerDown = (event) => {
    closeStart()
    if (event.target === desktopRef.current) {
      setSelected(null)
      setContextMenu(null)
    }
  }

  const handleContextMenu = (event) => {
    if (event.target.closest('.icon, .win, .start-menu, .desktop-context-menu')) return
    event.preventDefault()
    closeStart()
    const rect = desktopRef.current.getBoundingClientRect()
    setContextMenu({
      x: Math.min(event.clientX - rect.left, rect.width - 190),
      y: Math.min(event.clientY - rect.top, rect.height - 160),
    })
  }

  const handleIconPointerDown = (event, id, index) => {
    if (mobile || event.button !== 0) return
    event.stopPropagation()
    const bounds = desktopRef.current.getBoundingClientRect()
    const pos = positionFor(id, index)
    dragRef.current = {
      id,
      startClientX: event.clientX,
      startClientY: event.clientY,
      offsetX: event.clientX - bounds.left - pos.x,
      offsetY: event.clientY - bounds.top - pos.y,
      moved: false,
    }
    latestPositionsRef.current = { ...latestPositionsRef.current, [id]: pos }
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  const handleIconPointerMove = (event) => {
    const drag = dragRef.current
    if (!drag || mobile) return
    const dx = event.clientX - drag.startClientX
    const dy = event.clientY - drag.startClientY
    if (!drag.moved && Math.hypot(dx, dy) < DRAG_THRESHOLD) return
    if (!drag.moved) dragRef.current = { ...drag, moved: true }
    const bounds = desktopRef.current.getBoundingClientRect()
    const x = Math.max(0, Math.min(event.clientX - bounds.left - drag.offsetX, bounds.width - ICON_W))
    const y = Math.max(0, Math.min(event.clientY - bounds.top - drag.offsetY, bounds.height - ICON_H))
    const nextPosition = { x, y }
    latestPositionsRef.current = {
      ...latestPositionsRef.current,
      [drag.id]: nextPosition,
    }
    // Keep positions in component state while dragging; save once on pointer-up.
    setDraftPositions((positions) => ({ ...positions, [drag.id]: nextPosition }))
    setDragging(drag.id)
    setContextMenu(null)
  }

  const handleIconPointerUp = () => {
    const drag = dragRef.current
    if (!drag) return
    if (drag.moved) {
      suppressClickRef.current = drag.id
      setIconPositions({ ...iconPositions, ...latestPositionsRef.current })
    }
    dragRef.current = null
    setDragging(null)
  }

  const handleIconClick = (id) => {
    if (suppressClickRef.current === id) {
      suppressClickRef.current = null
      setSelected(id)
      return
    }
    setSelected(id)
    if (mobile) openApp(id)
  }

  const openPersonalization = () => {
    setContextMenu(null)
    openApp('settings')
  }

  const resetDesktop = () => {
    resetIconPositions()
    latestPositionsRef.current = {}
    setDraftPositions({})
    setSelected(null)
    setContextMenu(null)
  }

  return (
    <main
      ref={desktopRef}
      className="desktop"
      data-wp={wallpaper}
      onPointerDown={handleDesktopPointerDown}
      onContextMenu={handleContextMenu}
    >
      <div className={`icons${mobile ? ' mobile' : ''}`} onPointerDown={(e) => { e.stopPropagation(); setContextMenu(null) }}>
        {appOrder.map((id, index) => {
          const pos = positionFor(id, index)
          const iconName = appIconName(id, trashCount)
          return (
            <button
              key={id}
              type="button"
              className={`icon${selected === id ? ' selected' : ''}${dragging === id ? ' dragging' : ''}`}
              style={mobile ? undefined : { left: pos.x, top: pos.y }}
              onPointerDown={(event) => handleIconPointerDown(event, id, index)}
              onPointerMove={handleIconPointerMove}
              onPointerUp={handleIconPointerUp}
              onPointerCancel={handleIconPointerUp}
              onClick={() => handleIconClick(id)}
              onDoubleClick={() => !mobile && openApp(id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  openApp(id)
                }
              }}
              aria-label={`${appMeta[id].label}. ${mobile ? 'Tap to open.' : 'Double-click to open; drag to move.'}`}
              title={`${appMeta[id].label}${id === 'bin' ? ` — ${trashCount} item${trashCount === 1 ? '' : 's'}` : ''} — ${mobile ? 'tap to open' : 'double-click to open'}`}
            >
              <PixelIcon name={iconName} size={40} />
              <span className="icon-label">{appMeta[id].label}</span>
            </button>
          )
        })}
      </div>
      <AnimatePresence>
        {windows.map((w) => (
          <Window key={w.id} win={w} />
        ))}
      </AnimatePresence>
      {snapPreview && (
        <div
          className={`snap-preview snap-preview-${snapPreview.mode}`}
          style={(() => {
            const layouts = {
              max: { left: 0, top: 0, width: '100%', height: '100%' },
              left: { left: 0, top: 0, width: '50%', height: '100%' },
              right: { left: '50%', top: 0, width: '50%', height: '100%' },
              'top-left': { left: 0, top: 0, width: '50%', height: '50%' },
              'top-right': { left: '50%', top: 0, width: '50%', height: '50%' },
              'bottom-left': { left: 0, top: '50%', width: '50%', height: '50%' },
              'bottom-right': { left: '50%', top: '50%', width: '50%', height: '50%' },
            }
            return layouts[snapPreview.mode]
          })()}
          aria-hidden="true"
        >
          <span>{snapPreview.mode === 'max' ? 'MAXIMIZE' : `SNAP ${snapPreview.mode.replace('-', ' ').toUpperCase()}`}</span>
        </div>
      )}
      <StartMenu />
      {contextMenu && (
        <div
          className="desktop-context-menu"
          style={{ left: Math.max(4, contextMenu.x), top: Math.max(4, contextMenu.y) }}
          onPointerDown={(event) => event.stopPropagation()}
          onContextMenu={(event) => event.preventDefault()}
          role="menu"
          aria-label="Desktop options"
        >
          <div className="context-heading">Desktop</div>
          <button type="button" role="menuitem" onClick={resetDesktop}>Arrange icons</button>
          <button type="button" role="menuitem" onClick={openPersonalization}>Personalize…</button>
          <button type="button" role="menuitem" onClick={() => { setSelected(null); setContextMenu(null) }}>Refresh desktop</button>
        </div>
      )}
    </main>
  )
}
