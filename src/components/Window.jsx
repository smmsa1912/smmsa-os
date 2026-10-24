import { useRef } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { useOS } from '../store'
import { appMeta } from '../appMeta'
import { appComponents } from '../apps/registry'
import useIsMobile from '../useIsMobile'
import PixelIcon from './PixelIcon'
import useTrashCount from '../useTrashCount'
import { appIconName } from '../appIconName'

// Four-frame easing keeps the desktop's retro, pixel-like motion.
const pixelEase = (t) => Math.round(t * 4) / 4
const MIN_W = 300
const MIN_H = 200
const clamp = (value, min, max) => Math.min(Math.max(value, min), Math.max(min, max))

function snapModeAt(event, desktop) {
  const rect = desktop.getBoundingClientRect()
  const x = event.clientX - rect.left
  const y = event.clientY - rect.top
  const edge = 22
  const cornerY = 32
  if (x <= edge && y <= cornerY) return 'top-left'
  if (x >= rect.width - edge && y <= cornerY) return 'top-right'
  if (x <= edge && y >= rect.height - cornerY) return 'bottom-left'
  if (x >= rect.width - edge && y >= rect.height - cornerY) return 'bottom-right'
  if (y <= 18) return 'max'
  if (x <= edge) return 'left'
  if (x >= rect.width - edge) return 'right'
  return null
}

export default function Window({ win }) {
  const trashCount = useTrashCount()
  const active = useOS((s) => s.activeId === win.id)
  const focus = useOS((s) => s.focus)
  const close = useOS((s) => s.close)
  const minimize = useOS((s) => s.minimize)
  const toggleMax = useOS((s) => s.toggleMax)
  const move = useOS((s) => s.move)
  const resize = useOS((s) => s.resize)
  const restoreWindow = useOS((s) => s.restoreWindow)
  const snapWindow = useOS((s) => s.snapWindow)
  const setSnapPreview = useOS((s) => s.setSnapPreview)
  const mobile = useIsMobile()
  const shouldReduceMotion = useReducedMotion()
  const dragRef = useRef(null)
  const resizeRef = useRef(null)
  const snapModeRef = useRef(null)

  const meta = appMeta[win.appId]
  const App = appComponents[win.appId]
  const full = win.maximized || mobile
  const snapped = Boolean(win.snap)

  const onTitleDown = (e) => {
    focus(win.id)
    if (mobile || e.target.closest('button')) return
    const desktop = e.currentTarget.closest('.desktop')
    const bounds = desktop.getBoundingClientRect()
    e.currentTarget.setPointerCapture(e.pointerId)

    if (win.maximized || win.snap) {
      const restored = win.restore ?? { x: win.x, y: win.y, w: win.w, h: win.h }
      // Wait for actual movement before restoring, so a simple click never unsnaps a window.
      const dx = clamp((e.clientX / Math.max(1, window.innerWidth)) * restored.w, 28, restored.w - 28)
      dragRef.current = {
        dx,
        dy: 15,
        startClientX: e.clientX,
        startClientY: e.clientY,
        moved: false,
        restoreOnMove: true,
      }
    } else {
      dragRef.current = {
        dx: e.clientX - bounds.left - win.x,
        dy: e.clientY - bounds.top - win.y,
        startClientX: e.clientX,
        startClientY: e.clientY,
        moved: false,
        restoreOnMove: false,
      }
    }
    snapModeRef.current = null
  }

  const onTitleMove = (e) => {
    const drag = dragRef.current
    if (!drag || mobile) return
    if (!drag.moved && Math.hypot(e.clientX - drag.startClientX, e.clientY - drag.startClientY) < 2) return
    if (!drag.moved) {
      dragRef.current = { ...drag, moved: true, restoreOnMove: false }
      if (drag.restoreOnMove) restoreWindow(win.id)
    }

    const desktop = e.currentTarget.closest('.desktop')
    const bounds = desktop.getBoundingClientRect()
    const x = clamp(e.clientX - bounds.left - drag.dx, 32 - win.w, bounds.width - 32)
    const y = clamp(e.clientY - bounds.top - drag.dy, 0, bounds.height - 34)
    move(win.id, x, y)

    const mode = snapModeAt(e, desktop)
    snapModeRef.current = mode
    setSnapPreview(mode ? { id: win.id, mode } : null)
  }

  const onTitleUp = () => {
    const drag = dragRef.current
    const mode = snapModeRef.current
    dragRef.current = null
    snapModeRef.current = null
    setSnapPreview(null)
    if (drag?.moved && mode) snapWindow(win.id, mode)
  }

  const onGripDown = (e) => {
    e.stopPropagation()
    focus(win.id)
    if (win.snap || win.maximized) return
    const desktop = e.currentTarget.closest('.desktop')
    const bounds = desktop.getBoundingClientRect()
    const direction = e.currentTarget.dataset.direction
    e.currentTarget.setPointerCapture(e.pointerId)
    resizeRef.current = {
      direction,
      pointerX: e.clientX,
      pointerY: e.clientY,
      x: win.x,
      y: win.y,
      w: win.w,
      h: win.h,
      maxW: bounds.width,
      maxH: bounds.height,
    }
  }

  const onGripMove = (e) => {
    const start = resizeRef.current
    if (!start) return
    const dx = e.clientX - start.pointerX
    const dy = e.clientY - start.pointerY
    let { x, y, w, h } = start
    const west = start.direction.includes('w')
    const east = start.direction.includes('e')
    const north = start.direction.includes('n')
    const south = start.direction.includes('s')

    if (east) w = clamp(start.w + dx, MIN_W, start.maxW - start.x)
    if (south) h = clamp(start.h + dy, MIN_H, start.maxH - start.y)
    if (west) {
      w = clamp(start.w - dx, MIN_W, start.x + start.w)
      x = start.x + start.w - w
    }
    if (north) {
      h = clamp(start.h - dy, MIN_H, start.y + start.h)
      y = start.y + start.h - h
    }
    resize(win.id, { x, y, w, h })
  }

  const onGripUp = () => { resizeRef.current = null }

  let style
  if (full) {
    style = { left: 0, top: 0, width: '100%', height: '100%', zIndex: win.z }
  } else if (win.snap === 'left') {
    style = { left: 0, top: 0, width: '50%', height: '100%', zIndex: win.z }
  } else if (win.snap === 'right') {
    style = { left: '50%', top: 0, width: '50%', height: '100%', zIndex: win.z }
  } else if (win.snap === 'top-left') {
    style = { left: 0, top: 0, width: '50%', height: '50%', zIndex: win.z }
  } else if (win.snap === 'top-right') {
    style = { left: '50%', top: 0, width: '50%', height: '50%', zIndex: win.z }
  } else if (win.snap === 'bottom-left') {
    style = { left: 0, top: '50%', width: '50%', height: '50%', zIndex: win.z }
  } else if (win.snap === 'bottom-right') {
    style = { left: '50%', top: '50%', width: '50%', height: '50%', zIndex: win.z }
  } else {
    style = { left: win.x, top: win.y, width: win.w, height: win.h, zIndex: win.z }
  }

  return (
    <motion.section
      className={`win${active ? ' active' : ''}${full ? ' full' : ''}${snapped ? ` snapped snap-${win.snap}` : ''}`}
      style={{ ...style, display: win.minimized ? 'none' : 'flex' }}
      initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.94 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={shouldReduceMotion
        ? { opacity: 0, transition: { duration: 0 } }
        : { opacity: 0, scale: 0.94 }}
      transition={{ duration: shouldReduceMotion ? 0 : 0.18, ease: pixelEase }}
      onPointerDown={() => focus(win.id)}
      onFocusCapture={() => focus(win.id)}
      role="region"
      aria-labelledby={`window-title-${win.id}`}
    >
      <header
        className="win-title"
        onPointerDown={onTitleDown}
        onPointerMove={onTitleMove}
        onPointerUp={onTitleUp}
        onPointerCancel={onTitleUp}
        onDoubleClick={(e) => { if (!mobile && !e.target.closest('button')) toggleMax(win.id) }}
      >
        <PixelIcon name={appIconName(win.appId, trashCount)} size={16} />
        <span id={`window-title-${win.id}`} className="win-name">{meta.title}</span>
        <button type="button" className="win-btn" aria-label={`Minimize ${meta.title}`} title="Minimize" onClick={() => minimize(win.id)}>
          _
        </button>
        {!mobile && (
          <button type="button" className="win-btn" aria-label={win.maximized ? `Restore ${meta.title}` : `Maximize ${meta.title}`} title={win.maximized ? 'Restore' : 'Maximize'} onClick={() => toggleMax(win.id)}>
            {win.maximized ? '❐' : '□'}
          </button>
        )}
        <button type="button" className="win-btn close" aria-label={`Close ${meta.title}`} title="Close" onClick={() => close(win.id)}>
          ×
        </button>
      </header>
      <div className="win-body">
        <App />
      </div>
      {!full && !snapped && ['n', 'e', 's', 'w', 'ne', 'nw', 'se', 'sw'].map((direction) => (
        <div
          key={direction}
          className={`win-grip grip-${direction}`}
          data-direction={direction}
          onPointerDown={onGripDown}
          onPointerMove={onGripMove}
          onPointerUp={onGripUp}
          onPointerCancel={onGripUp}
          aria-hidden="true"
        />
      ))}
    </motion.section>
  )
}
