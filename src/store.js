import { create } from 'zustand'
import { appMeta } from './appMeta'
import { THEMES, WALLPAPERS } from './wallpapers'
import { playSound } from './sound'

const PREF_KEY = 'smmsa-prefs-v7'
const LEGACY_PREF_KEY = 'smmsa-prefs-v6'
const CLASSIC_DEFAULT_WALLPAPER = 'aurora'
const DEFAULTS = { wallpaper: 'glass-pixel', theme: 'glass-pixel', sound: true, iconPositions: {} }

const loadPrefs = () => {
  try {
    const currentRaw = localStorage.getItem(PREF_KEY)
    const legacyRaw = currentRaw == null ? localStorage.getItem(LEGACY_PREF_KEY) : null
    const migratingLegacy = currentRaw == null && legacyRaw != null
    const saved = JSON.parse(currentRaw ?? legacyRaw ?? '{}')
    // v21 defaulted to Classic Retro + Aurora. Upgrade that exact legacy default
    // to Glass-Pixel + Sunset Harbor, but keep saved custom themes/wallpapers.
    const migrateOldDefaults = migratingLegacy && saved.theme === 'classic' && saved.wallpaper === CLASSIC_DEFAULT_WALLPAPER
    const prefs = migrateOldDefaults
      ? { ...saved, theme: DEFAULTS.theme, wallpaper: DEFAULTS.wallpaper }
      : saved
    const iconPositions = prefs.iconPositions && typeof prefs.iconPositions === 'object'
      ? Object.fromEntries(
          Object.entries(prefs.iconPositions).filter(([, pos]) =>
            pos && Number.isFinite(pos.x) && Number.isFinite(pos.y) && pos.x >= 0 && pos.y >= 0,
          ),
        )
      : {}
    return {
      wallpaper: WALLPAPERS.some((w) => w.id === prefs.wallpaper) ? prefs.wallpaper : DEFAULTS.wallpaper,
      theme: THEMES.some((theme) => theme.id === prefs.theme) ? prefs.theme : DEFAULTS.theme,
      sound: typeof prefs.sound === 'boolean' ? prefs.sound : DEFAULTS.sound,
      iconPositions,
    }
  } catch {
    return DEFAULTS
  }
}

const savePrefs = ({ wallpaper, theme, sound, iconPositions }) => {
  try {
    localStorage.setItem(PREF_KEY, JSON.stringify({ wallpaper, theme, sound, iconPositions }))
  } catch {
    // Storage can be blocked; settings just won't persist.
  }
}

const TASKBAR = 44
let topZ = 10
let seq = 0
const bump = () => ++topZ

// The visible window with the highest z-index, or null.
const topVisible = (windows) =>
  windows.filter((w) => !w.minimized).sort((a, b) => b.z - a.z)[0]?.id ?? null

const patch = (windows, id, changes) =>
  windows.map((w) => (w.id === id ? { ...w, ...changes } : w))

export const useOS = create((set, get) => ({
  windows: [],
  activeId: null,
  recruiterTourStep: -1,
  selectedProjectId: 'oscar',
  recentApps: [],
  startOpen: false,
  locked: false,
  restartCount: 0,
  snapPreview: null,
  ...loadPrefs(),

  setWallpaper: (wallpaper) => {
    if (!WALLPAPERS.some((item) => item.id === wallpaper)) return
    set({ wallpaper })
    savePrefs(get())
  },
  setTheme: (theme) => {
    if (!THEMES.some((item) => item.id === theme)) return
    const current = get()
    // Pair each theme with its signature wallpaper when switching from the other
    // theme's default; preserve any other wallpaper the user explicitly chose.
    const wallpaper = theme === 'glass-pixel' && current.wallpaper === CLASSIC_DEFAULT_WALLPAPER
      ? 'glass-pixel'
      : theme === 'classic' && current.wallpaper === 'glass-pixel'
        ? CLASSIC_DEFAULT_WALLPAPER
        : current.wallpaper
    set({ theme, wallpaper })
    savePrefs(get())
  },
  setIconPositions: (iconPositions) => {
    set({ iconPositions })
    savePrefs(get())
  },
  resetIconPositions: () => {
    set({ iconPositions: {} })
    savePrefs(get())
  },
  toggleSound: () => {
    set((s) => ({ sound: !s.sound }))
    savePrefs(get())
    if (get().sound) playSound('on')
  },

  setSelectedProject: (selectedProjectId) => set({ selectedProjectId }),
  startRecruiterTour: () => set({ recruiterTourStep: 0, startOpen: false }),
  advanceRecruiterTour: () => set((s) => ({ recruiterTourStep: Math.min(s.recruiterTourStep + 1, 6) })),
  endRecruiterTour: () => set({ recruiterTourStep: -1 }),
  toggleStart: () => set((s) => ({ startOpen: !s.startOpen })),
  closeStart: () => set({ startOpen: false }),
  lockOS: () => set({ locked: true, startOpen: false, snapPreview: null, recruiterTourStep: -1 }),
  unlockOS: () => set({ locked: false, startOpen: false }),
  restartOS: () => set((s) => ({
    windows: [],
    activeId: null,
    startOpen: false,
    locked: true,
    snapPreview: null,
    recruiterTourStep: -1,
    restartCount: s.restartCount + 1,
  })),

  // One window per app: opening an app that is already open brings it to the front.
  openApp: (appId) => {
    const meta = appMeta[appId]
    if (!meta) return false
    if (get().sound) playSound('open')
    set((s) => ({ recentApps: [appId, ...s.recentApps.filter((id) => id !== appId)].slice(0, 5) }))
    const found = get().windows.find((w) => w.appId === appId)
    if (found) {
      set((s) => ({
        windows: patch(s.windows, found.id, { minimized: false, z: bump() }),
        activeId: found.id,
        startOpen: false,
      }))
      return true
    }
    const vw = Math.max(320, window.innerWidth)
    const vh = Math.max(240, window.innerHeight - TASKBAR)
    const w = Math.max(280, Math.min(meta.w, vw - 24))
    const h = Math.max(200, Math.min(meta.h, vh - 20))
    // Center the first window and use a restrained cascade for later apps, keeping
    // the title bars visible and leaving the desktop feeling deliberately composed.
    const step = (seq % 4) * 22
    seq += 1
    const centeredX = (vw - w) / 2
    const centeredY = (vh - h) / 2
    const x = Math.max(8, Math.min(centeredX + step, vw - w - 8))
    const y = Math.max(8, Math.min(centeredY + step * 0.65, vh - h - 8))
    const id = `${appId}-${seq}`
    set((s) => ({
      windows: [...s.windows, { id, appId, x, y, w, h, z: bump(), minimized: false, maximized: false, snap: null, restore: null }],
      activeId: id,
      startOpen: false,
    }))
    return true
  },

  focus: (id) =>
    set((s) => (s.activeId === id ? s : { activeId: id, windows: patch(s.windows, id, { z: bump() }) })),

  setSnapPreview: (preview) => set((s) => {
    if (s.snapPreview?.id === preview?.id && s.snapPreview?.mode === preview?.mode) return s
    return { snapPreview: preview }
  }),

  snapWindow: (id, mode) => set((s) => ({
    windows: s.windows.map((w) => {
      if (w.id !== id) return w
      const restore = w.restore ?? { x: w.x, y: w.y, w: w.w, h: w.h }
      if (mode === 'max') return { ...w, restore, maximized: true, snap: null, minimized: false, z: bump() }
      return { ...w, restore, maximized: false, snap: mode, minimized: false, z: bump() }
    }),
    activeId: id,
    snapPreview: null,
  })),

  restoreWindow: (id) => set((s) => ({
    windows: s.windows.map((w) => {
      if (w.id !== id) return w
      return {
        ...w,
        ...(w.restore ?? {}),
        restore: null,
        maximized: false,
        snap: null,
        minimized: false,
        z: bump(),
      }
    }),
    activeId: id,
    snapPreview: null,
  })),

  close: (id) => {
    if (get().sound) playSound('close')
    set((s) => {
      const windows = s.windows.filter((w) => w.id !== id)
      return { windows, activeId: s.activeId === id ? topVisible(windows) : s.activeId }
    })
  },

  minimize: (id) => {
    if (get().sound) playSound('min')
    set((s) => {
      const windows = patch(s.windows, id, { minimized: true })
      return { windows, activeId: s.activeId === id ? topVisible(windows) : s.activeId }
    })
  },

  toggleMax: (id) => set((s) => ({
    windows: s.windows.map((w) => {
      if (w.id !== id) return w
      if (w.maximized) {
        return { ...w, ...(w.restore ?? {}), restore: null, maximized: false, snap: null, z: bump() }
      }
      return { ...w, restore: w.restore ?? { x: w.x, y: w.y, w: w.w, h: w.h }, maximized: true, snap: null, z: bump() }
    }),
    activeId: id,
    snapPreview: null,
  })),

  move: (id, x, y) => set((s) => ({ windows: patch(s.windows, id, { x, y }) })),
  resize: (id, rect) => set((s) => ({ windows: patch(s.windows, id, rect) })),

  // Taskbar buttons: restore if minimized, minimize if already active, otherwise focus.
  taskbarClick: (id) => {
    const win = get().windows.find((w) => w.id === id)
    if (!win) return
    if (win.minimized) set((s) => ({ windows: patch(s.windows, id, { minimized: false, z: bump() }), activeId: id }))
    else if (get().activeId === id) get().minimize(id)
    else get().focus(id)
  },
}))
