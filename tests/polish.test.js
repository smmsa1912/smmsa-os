import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

const readSource = (path) => readFile(new URL(path, import.meta.url), 'utf8')

const [boot, home, startMenu, taskbar, windowComponent, contact, resume, quickView, projects, publications, desktop] = await Promise.all([
  readSource('../src/components/Boot.jsx'),
  readSource('../src/apps/QuickView.jsx'),
  readSource('../src/components/StartMenu.jsx'),
  readSource('../src/components/Taskbar.jsx'),
  readSource('../src/components/Window.jsx'),
  readSource('../src/apps/Contact.jsx'),
  readSource('../src/apps/Resume.jsx'),
  readSource('../src/apps/QuickView.jsx'),
  readSource('../src/apps/Projects.jsx'),
  readSource('../src/apps/Publications.jsx'),
  readSource('../src/components/Desktop.jsx'),
])

const resumePdf = await readFile(new URL('../public/resume.pdf', import.meta.url))

test('boot and portfolio home do not display stale release markers', () => {
  assert.doesNotMatch(boot, /PORTFOLIO BUILD v\d+/i)
  assert.match(boot, /const finishOnce = useCallback/)
  assert.match(boot, /event\.stopPropagation\(\); finishOnce\(\)/)
  assert.doesNotMatch(home, /SMMSA-OS\s*\/\s*\d+/i)
  assert.match(home, /SMMSA-OS\s*\/\s*PORTFOLIO/i)
})

test('every literal external new-tab link uses noopener and noreferrer', () => {
  for (const [label, source] of [['Start Menu', startMenu], ['Resume', resume], ['Home', quickView], ['Projects', projects], ['Publications', publications]]) {
    const links = source.match(/<a\b[^>]*target="_blank"[^>]*>/g) ?? []
    assert.ok(links.length > 0, `${label} should expose at least one external link`)
    for (const link of links) {
      assert.match(link, /rel="noopener noreferrer"/, `${label} external link needs noopener noreferrer: ${link}`)
    }
  }
  assert.match(contact, /target=\{row\.label === 'Email' \? undefined : '_blank'\}/)
  assert.match(contact, /rel=\{row\.label === 'Email' \? undefined : 'noopener noreferrer'\}/)
})

test('Start Menu has an Escape path and returns focus to its trigger', () => {
  assert.match(startMenu, /event\.key !== 'Escape'/)
  assert.match(startMenu, /closeStart\(\)/)
  assert.match(startMenu, /getElementById\('start-menu-trigger'\)\?\.focus\(\)/)
  assert.match(taskbar, /id="start-menu-trigger"/)
  assert.match(taskbar, /aria-controls="start-menu-panel"/)
  assert.match(desktop, /event\.key === 'Escape'[\s\S]*?setContextMenu\(null\)/)
})

test('windows have accessible titles and respect reduced-motion settings', () => {
  assert.match(windowComponent, /useReducedMotion/)
  assert.match(windowComponent, /duration: shouldReduceMotion \? 0 : 0\.18/)
  assert.match(windowComponent, /aria-labelledby=\{`window-title-\$\{win\.id\}`\}/)
  assert.match(windowComponent, /onFocusCapture=\{\(\) => focus\(win\.id\)\}/)
  assert.match(windowComponent, /aria-label=\{`Close \$\{meta\.title\}`\}/)
})

test('resume download points to a bundled PDF file', () => {
  assert.equal(resumePdf.subarray(0, 5).toString('ascii'), '%PDF-')
  assert.ok(resumePdf.length > 10_000, 'bundled resume should not be an empty placeholder')
  assert.match(resume, /href=\{profile\.resume\} download/)
  assert.match(contact, /mailto:\$\{profile\.email\}/)
})


test('architecture diagrams are rendered with accessible viewports and source links', () => {
  assert.match(projects, /selectedProject\.diagrams\?\.length/)
  assert.match(projects, /project-architecture-viewport/)
  assert.match(projects, /aria-label=\{`\$\{diagram\.title\} diagram`\}/)
  assert.match(projects, /sourcePaper\.href/)
  assert.match(projects, /diagram\.sourceUrl/)
  assert.match(projects, /High-level architecture based on available reports and source links/)
})


test('taskbar clock updates as one local timestamp and exposes an accessible label', () => {
  assert.match(taskbar, /const \[now, setNow\] = useState\(\(\) => new Date\(\)\)/)
  assert.match(taskbar, /setInterval\(\(\) => setNow\(new Date\(\)\), 15000\)/)
  assert.match(taskbar, /dateTime=\{now\.toISOString\(\)\}/)
  assert.match(taskbar, /aria-label=\{`Local time \$\{clock\}, \$\{calendarDate\}`\}/)
})
