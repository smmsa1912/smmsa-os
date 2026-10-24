import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

const readSource = (path) => readFile(new URL(path, import.meta.url), 'utf8')

const [store, app, settings, wallpapers, css, svg] = await Promise.all([
  readSource('../src/store.js'),
  readSource('../src/App.jsx'),
  readSource('../src/apps/Settings.jsx'),
  readSource('../src/wallpapers.js'),
  readSource('../src/os.css'),
  readSource('../src/assets/hd-2d-glass-pixel.svg'),
])

test('theme preference defaults to HD-2D Glass-Pixel and is persisted', () => {
  assert.match(store, /theme: 'glass-pixel'/)
  assert.match(store, /wallpaper: 'glass-pixel'/)
  assert.match(store, /PREF_KEY = 'smmsa-prefs-v7'/)
  assert.match(store, /LEGACY_PREF_KEY = 'smmsa-prefs-v6'/)
  assert.match(store, /const migrateOldDefaults = migratingLegacy && saved\.theme === 'classic' && saved\.wallpaper === CLASSIC_DEFAULT_WALLPAPER/)
  assert.match(store, /theme: THEMES\.some\(\(theme\) => theme\.id === prefs\.theme\)/)
  assert.match(store, /JSON\.stringify\(\{ wallpaper, theme, sound, iconPositions \}\)/)
  assert.match(store, /setTheme: \(theme\)/)
})

test('Settings exposes accessible Classic Retro and HD-2D Glass-Pixel choices', () => {
  assert.match(wallpapers, /id: 'classic', label: 'Classic Retro'/)
  assert.match(wallpapers, /id: 'glass-pixel', label: 'HD-2D Glass-Pixel'/)
  assert.match(settings, /role="radiogroup" aria-label="Desktop theme"/)
  assert.match(settings, /aria-checked=\{theme === item\.id\}/)
  assert.match(settings, /onClick=\{\(\) => setTheme\(item\.id\)\}/)
})

test('selected theme is applied at the OS root and glass CSS styles the core shell', () => {
  assert.match(app, /className="os" data-theme=\{theme\}/)
  for (const selector of ['.desktop', '.icon', '.win', '.win-title', '.taskbar', '.start-menu', '.desktop-context-menu']) {
    assert.ok(css.includes(`.os[data-theme='glass-pixel'] ${selector}`), `Missing theme selector for ${selector}`)
  }
})

test('HD-2D wallpaper is included and registered as a selectable wallpaper', () => {
  assert.match(wallpapers, /id: 'glass-pixel', label: 'HD-2D Sunset Harbor'/)
  assert.match(css, /\.desktop\[data-wp='glass-pixel'\]/)
  assert.match(css, /\.wp-swatch\[data-wp='glass-pixel'\]/)
  assert.match(svg, /<svg[^>]+viewBox="0 0 1920 1080"/)
  assert.match(svg, /id="sky"/)
  assert.match(svg, /pixel cat/i)
})

test('glass theme still supports reduced-transparency preferences', () => {
  assert.match(css, /@media \(prefers-reduced-transparency: reduce\)/)
  assert.match(css, /backdrop-filter: none/)
})


test('Glass-Pixel taskbar clock has high contrast and a distinct surface', () => {
  assert.match(css, /\.os\[data-theme='glass-pixel'\] \.clock\s*\{[^}]*box-sizing:\s*border-box[^}]*color:\s*#f5f9ff[^}]*background:\s*rgb\(3 15 39 \/ 0\.46\)/s)
  assert.match(css, /\.os\[data-theme='glass-pixel'\] \.clock small\s*\{[^}]*color:\s*#d7e8ff/s)
  assert.match(css, /font-variant-numeric:\s*tabular-nums/)
})

test('theme and wallpaper radio groups support keyboard selection and visible focus', () => {
  assert.match(settings, /function handleRadioKeyDown\(event\)/)
  for (const key of ['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp', 'Home', 'End']) {
    assert.ok(settings.includes(`'${key}'`), `radio groups should handle ${key}`)
  }
  assert.equal((settings.match(/tabIndex=\{(?:theme|wallpaper) ===/g) ?? []).length, 2, 'only the selected theme and wallpaper should be tabbable')
  assert.equal((settings.match(/onKeyDown=\{handleRadioKeyDown\}/g) ?? []).length, 2, 'both radio groups should share keyboard navigation')
  assert.match(css, /\.wp-opt:focus-visible,[\s\S]*?\.theme-opt:focus-visible[\s\S]*?outline:\s*3px solid/)
  assert.match(css, /\.os\[data-theme='glass-pixel'\] \.wp-opt:focus-visible,[\s\S]*?\.os\[data-theme='glass-pixel'\] \.theme-opt:focus-visible[\s\S]*?outline-color:\s*#65d6ff/)
})
