import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { ICONS } from '../src/components/icons.js'
import { appMeta } from '../src/appMeta.js'
import { appIconName } from '../src/appIconName.js'
import { DEFAULT_PINS, loadPinnedApps, PIN_CHANGE_EVENT, PIN_KEY, savePinnedApps } from '../src/pinStore.js'

const readSource = (path) => readFile(new URL(path, import.meta.url), 'utf8')
const memory = new Map()
globalThis.localStorage = {
  getItem: (key) => memory.has(key) ? memory.get(key) : null,
  setItem: (key, value) => memory.set(key, String(value)),
  removeItem: (key) => memory.delete(key),
}

if (typeof globalThis.window === 'undefined') globalThis.window = new EventTarget()

test('Recycle Bin app icon changes based on the number of trashed items', () => {
  assert.equal(appIconName('bin', 0), 'trash-empty')
  assert.equal(appIconName('bin', 1), 'trash-full')
  assert.equal(appIconName('bin', 5), 'trash-full')
  assert.equal(appIconName('projects', 5), appMeta.projects.icon)
})

test('full and empty Recycle Bin pixel icons have valid matching grids', () => {
  for (const name of ['trash-empty', 'trash-full']) {
    assert.ok(ICONS[name], `${name} icon exists`)
    const width = ICONS[name][0].length
    assert.ok(ICONS[name].every((row) => row.length === width), `${name} rows have matching width`)
    assert.ok(ICONS[name].every((row) => /^[.kyYwbgprd]+$/.test(row)), `${name} only uses palette characters`)
  }
  assert.notDeepEqual(ICONS['trash-empty'], ICONS['trash-full'])
})

test('Start pin updates are persisted and announce a same-tab change', () => {
  memory.clear()
  assert.deepEqual(loadPinnedApps(), DEFAULT_PINS)
  let changeCount = 0
  const onChange = () => { changeCount += 1 }
  window.addEventListener(PIN_CHANGE_EVENT, onChange)
  savePinnedApps(['projects', 'bin', 'projects', 'not-a-real-app'])
  window.removeEventListener(PIN_CHANGE_EVENT, onChange)
  assert.deepEqual(JSON.parse(memory.get(PIN_KEY)), ['projects', 'bin'])
  assert.deepEqual(loadPinnedApps(), ['projects', 'bin'])
  assert.equal(changeCount, 1)
})

test('Recycle Bin icon stays state-aware across surfaces without desktop status badges', async () => {
  const [desktop, start, taskbar, win, hook, css] = await Promise.all([
    readSource('../src/components/Desktop.jsx'),
    readSource('../src/components/StartMenu.jsx'),
    readSource('../src/components/Taskbar.jsx'),
    readSource('../src/components/Window.jsx'),
    readSource('../src/useTrashCount.js'),
    readSource('../src/os.css'),
  ])
  assert.match(desktop, /appIconName\(id, trashCount\)/)
  assert.doesNotMatch(desktop, /icon-pin-marker|data-running=|data-active=|data-pinned=/)
  assert.doesNotMatch(desktop, /isRunning|isActive|isPinned/)
  assert.doesNotMatch(css, /\.icon-pin-marker|\.icon\.running::after|\.icon\.running\.active/)
  assert.match(start, /appIconName\(id, trashCount\)/)
  assert.match(taskbar, /appIconName\(w\.appId, trashCount\)/)
  assert.match(win, /appIconName\(win\.appId, trashCount\)/)
  assert.match(hook, /TRASH_CHANGE_EVENT/)
  assert.match(hook, /addEventListener\('storage'/)
})
