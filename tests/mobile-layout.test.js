import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

const css = await readFile(new URL('../src/os.css', import.meta.url), 'utf8')
const html = await readFile(new URL('../index.html', import.meta.url), 'utf8')

test('mobile viewport is configured for modern phone safe areas', () => {
  assert.match(html, /name="viewport"[^>]*viewport-fit=cover/i)
  assert.match(css, /--taskbar-h:\s*58px/)
  assert.match(css, /env\(safe-area-inset-bottom/)
})

test('mobile taskbar keeps app switching reachable with horizontal scrolling', () => {
  assert.match(css, /\.tasks\s*\{[^}]*overflow-x:\s*auto/s)
  assert.match(css, /\.task\s*\{[^}]*flex:\s*0 0 40px/s)
  assert.match(css, /\.quick-btn::after\s*\{[^}]*content:\s*['"]⌂['"]/s)
})

test('mobile app windows use full-screen layouts with touch-sized controls', () => {
  assert.match(css, /\.win\.full\s*\{[^}]*width:\s*100%[^}]*height:\s*100%/s)
  assert.match(css, /\.win-btn\s*\{[^}]*width:\s*38px[^}]*height:\s*38px/s)
  assert.match(css, /-webkit-overflow-scrolling:\s*touch/)
})

test('mobile app navigation fits a narrow screen', () => {
  assert.match(css, /\.projects-filters\s*\{[^}]*overflow-x:\s*auto/s)
  assert.match(css, /\.explorer-layout\s*\{\s*flex-direction:\s*column/s)
  assert.match(css, /\.explorer-sidebar\s*\{[^}]*overflow-x:\s*auto/s)
  assert.match(css, /\.start-all-grid\s*\{[^}]*overflow-y:\s*auto/s)
})


test('mobile taskbar keeps a compact, readable time and date visible', () => {
  assert.match(css, /\.clock\s*\{[^}]*min-width:\s*53px[^}]*font-size:\s*11px/s)
  assert.match(css, /\.clock small\s*\{[^}]*font-size:\s*9px/s)
  assert.match(css, /@media \(max-width: 700px\)\s*\{[^}]*\.os\[data-theme='glass-pixel'\] \.clock\s*\{[^}]*flex-basis:\s*68px/s)
  assert.doesNotMatch(css, /\.task span,\s*\.clock\s*\{\s*display:\s*none/s)
})
