import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

const source = async (path) => readFile(new URL(path, import.meta.url), 'utf8')

test('restart remounts the session controller instead of synchronously resetting state in an effect', async () => {
  const app = await source('../src/App.jsx')
  assert.match(app, /<AppSession key=\{restartCount\} isRestart=\{restartCount > 0\} \/>/)
  const effects = [...app.matchAll(/useEffect\(\(\) => \{([\s\S]*?)\n {2}\}, \[[^\]]*\]\)/g)].map((match) => match[1])
  assert.ok(effects.length > 0, 'expected effects to be present')
  for (const effect of effects) {
    assert.doesNotMatch(effect, /setBooted\(|setSignedIn\(/, 'effects should not synchronously reset session state')
  }
})

test('File Explorer persists mutations through a single commit path, not a state-sync effect', async () => {
  const explorer = await source('../src/apps/FileExplorer.jsx')
  assert.doesNotMatch(explorer, /\buseEffect\b/)
  assert.match(explorer, /const commitFiles = \(nextFiles, successNotice = null\) => \{/)
  assert.match(explorer, /saveExplorerFiles\(nextFiles\)/)
  assert.match(explorer, /Storage unavailable · changes may not persist/)
})

test('Settings keyboard navigation computes a single destination without a redundant initial assignment', async () => {
  const settings = await source('../src/apps/Settings.jsx')
  assert.match(settings, /let nextIndex\s+if \(event\.key === 'Home'\)/)
  assert.doesNotMatch(settings, /let nextIndex = currentIndex/)
})
