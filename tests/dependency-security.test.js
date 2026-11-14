import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

const lockfile = JSON.parse(
  await readFile(new URL('../package-lock.json', import.meta.url), 'utf8'),
)

const atLeast = (actual, minimum) => {
  const left = actual.split('.').map(Number)
  const right = minimum.split('.').map(Number)
  for (let index = 0; index < Math.max(left.length, right.length); index += 1) {
    const difference = (left[index] ?? 0) - (right[index] ?? 0)
    if (difference !== 0) return difference > 0
  }
  return true
}

test('minimatch is locked past GHSA-g3hv-75wg-m249', () => {
  const entry = lockfile.packages['node_modules/minimatch']
  assert.ok(entry, 'minimatch must be present in the lockfile')
  assert.ok(
    atLeast(entry.version, '11.0.1'),
    `minimatch ${entry.version} is affected by GHSA-g3hv-75wg-m249; expected 11.0.1 or newer`,
  )
})