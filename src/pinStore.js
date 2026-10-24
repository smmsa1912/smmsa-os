import { appMeta } from './appMeta.js'

export const PIN_KEY = 'smmsa-pinned-apps-v1'
export const PIN_CHANGE_EVENT = 'smmsa-pins-change'
export const DEFAULT_PINS = ['quick', 'projects', 'papers', 'resume', 'skills', 'contact']

export function loadPinnedApps() {
  try {
    const value = JSON.parse(localStorage.getItem(PIN_KEY) || 'null')
    if (Array.isArray(value)) {
      const valid = [...new Set(value.filter((id) => appMeta[id]))]
      // Migrate the previous seven-item default layout so its third row no longer
      // gets clipped into the Recent section. Custom pin sets remain untouched.
      const oldDefaults = ['quick', 'projects', 'papers', 'resume', 'skills', 'contact', 'terminal']
      if (valid.length === oldDefaults.length && oldDefaults.every((id, index) => valid[index] === id)) return DEFAULT_PINS
      return valid
    }
  } catch {
    // Use default pins when browser storage is blocked or malformed.
  }
  return DEFAULT_PINS
}

export function savePinnedApps(apps) {
  const valid = [...new Set(apps.filter((id) => appMeta[id]))]
  try {
    localStorage.setItem(PIN_KEY, JSON.stringify(valid))
  } catch {
    // Pin preferences remain updated for the current mounted session.
  }
  if (typeof window !== 'undefined') {
    const event = typeof CustomEvent === 'function' ? new CustomEvent(PIN_CHANGE_EVENT) : new Event(PIN_CHANGE_EVENT)
    window.dispatchEvent(event)
  }
}
