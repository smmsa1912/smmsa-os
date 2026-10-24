import test from 'node:test'
import assert from 'node:assert/strict'
import { access, readFile, readdir } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const sourceRoot = fileURLToPath(new URL('../src/', import.meta.url))
const sourceFiles = []

async function walk(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const fullPath = path.join(directory, entry.name)
    if (entry.isDirectory()) await walk(fullPath)
    else if (/\.(?:js|jsx|ts|tsx|css)$/.test(entry.name)) sourceFiles.push(fullPath)
  }
}

async function fileExists(filename) {
  try {
    await access(filename)
    return true
  } catch {
    return false
  }
}

async function resolveLocalImport(fromFile, specifier) {
  const base = path.resolve(path.dirname(fromFile), specifier)
  const candidates = [
    base,
    ...['.js', '.jsx', '.ts', '.tsx', '.css', '.json', '.svg', '.png'].map((ext) => `${base}${ext}`),
    ...['.js', '.jsx', '.ts', '.tsx'].map((ext) => path.join(base, `index${ext}`)),
  ]
  for (const candidate of candidates) {
    if (await fileExists(candidate)) return candidate
  }
  return null
}

await walk(sourceRoot)

test('all relative source imports resolve to existing files', async () => {
  const missing = []
  for (const filename of sourceFiles) {
    const content = await readFile(filename, 'utf8')
    const specifiers = new Set()
    const importPattern = /\bfrom\s*['"](\.{1,2}\/[^'"]+)['"]|\bimport\s*['"](\.{1,2}\/[^'"]+)['"]/g
    for (const match of content.matchAll(importPattern)) specifiers.add(match[1] ?? match[2])
    const cssImportPattern = /@import\s+['"](\.{1,2}\/[^'"]+)['"]/g
    for (const match of content.matchAll(cssImportPattern)) specifiers.add(match[1])
    for (const specifier of specifiers) {
      if (!await resolveLocalImport(filename, specifier)) {
        missing.push(`${path.relative(sourceRoot, filename)} -> ${specifier}`)
      }
    }
  }
  assert.deepEqual(missing, [], `missing local imports:\n${missing.join('\n')}`)
})
