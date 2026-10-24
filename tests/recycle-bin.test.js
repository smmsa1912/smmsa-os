import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import {
  emptyTrash,
  loadTrashItems,
  moveFilesToTrash,
  permanentlyDeleteTrashItem,
  restoreTrashItem,
  saveTrashItems,
  TRASH_STORAGE_KEY,
} from '../src/trashStore.js'
import { EXPLORER_STORAGE_KEY, saveExplorerFiles } from '../src/fileSystem.js'

const memory = new Map()
globalThis.localStorage = {
  getItem: (key) => memory.has(key) ? memory.get(key) : null,
  setItem: (key, value) => memory.set(key, String(value)),
  removeItem: (key) => memory.delete(key),
}
if (typeof globalThis.window === 'undefined') globalThis.window = new EventTarget()

function resetStorage() {
  memory.clear()
  saveTrashItems([])
}

test('Recycle Bin seeds the playful demo contents only when storage has never been initialized', () => {
  memory.clear()
  const first = loadTrashItems()
  assert.equal(first.length, 5)
  assert.ok(first.every((item) => item.demo && item.deletedBatchId))
  emptyTrash()
  assert.deepEqual(loadTrashItems(), [])
})

test('deleting a File Explorer item moves it to the browser-local Recycle Bin and restore brings it back', () => {
  resetStorage()
  saveExplorerFiles([
    { id: 'home', name: 'Andrew', type: 'folder', parentId: null },
    { id: 'documents', name: 'Documents', type: 'folder', parentId: 'home' },
    { id: 'note-1', name: 'Notes.txt', type: 'file', parentId: 'documents', content: 'keep this', modified: 'Today' },
  ])
  const deleted = { id: 'note-1', name: 'Notes.txt', type: 'file', parentId: 'documents', content: 'keep this', modified: 'Today' }
  moveFilesToTrash([deleted], 'Andrew / Documents')
  assert.equal(loadTrashItems().length, 1)
  const result = restoreTrashItem('note-1')
  assert.equal(result.restored, 1)
  assert.deepEqual(result.remaining, [])
  const files = JSON.parse(memory.get(EXPLORER_STORAGE_KEY))
  assert.equal(files.find((item) => item.id === 'note-1')?.content, 'keep this')
  assert.deepEqual(JSON.parse(memory.get(TRASH_STORAGE_KEY)), [])
})

test('restoring a deleted folder batch restores its descendants with their parent relationships', () => {
  resetStorage()
  saveExplorerFiles([
    { id: 'home', name: 'Andrew', type: 'folder', parentId: null },
    { id: 'documents', name: 'Documents', type: 'folder', parentId: 'home' },
  ])
  const removed = [
    { id: 'folder-1', name: 'Drafts', type: 'folder', parentId: 'documents' },
    { id: 'child-1', name: 'Plan.txt', type: 'file', parentId: 'folder-1', content: 'plan' },
  ]
  moveFilesToTrash(removed, 'Andrew / Documents')
  saveExplorerFiles(JSON.parse(memory.get(EXPLORER_STORAGE_KEY)))
  const result = restoreTrashItem('folder-1')
  assert.equal(result.restored, 2)
  const files = JSON.parse(memory.get(EXPLORER_STORAGE_KEY))
  assert.equal(files.find((item) => item.id === 'child-1')?.parentId, 'folder-1')
  assert.equal(files.find((item) => item.id === 'folder-1')?.parentId, 'documents')
})

test('permanent delete removes the whole related folder batch', () => {
  resetStorage()
  moveFilesToTrash([
    { id: 'folder-2', name: 'Old', type: 'folder', parentId: 'documents' },
    { id: 'child-2', name: 'Old.txt', type: 'file', parentId: 'folder-2' },
  ], 'Andrew / Documents')
  const result = permanentlyDeleteTrashItem('folder-2')
  assert.equal(result.deleted, 2)
  assert.deepEqual(result.remaining, [])
})

test('Recycle Bin has an explicit confirmation, restore, permanent delete, and empty state', async () => {
  const [component, explorer, appMeta, css] = await Promise.all([
    readFile(new URL('../src/apps/RecycleBin.jsx', import.meta.url), 'utf8'),
    readFile(new URL('../src/apps/FileExplorer.jsx', import.meta.url), 'utf8'),
    readFile(new URL('../src/appMeta.js', import.meta.url), 'utf8'),
    readFile(new URL('../src/os.css', import.meta.url), 'utf8'),
  ])
  assert.match(component, /role="dialog" aria-modal="true"/)
  assert.match(component, /restoreTrashItem\(selected\.id\)/)
  assert.match(component, /permanentlyDeleteTrashItem\(selected\.id\)/)
  assert.match(component, /emptyTrash\(\)/)
  assert.match(component, /Nothing to see here\./)
  assert.match(explorer, /moveFilesToTrash\(removed, originalPath\)/)
  assert.match(appMeta, /bin: \{[^}]*w: 900, h: 700/s)
  assert.match(css, /\.trash-masthead/)
  assert.match(css, /\.trash-empty-state/)
  assert.match(css, /@media \(max-width: 700px\)[\s\S]*?\.trash-workspace \{ grid-template-columns: minmax\(0, 1fr\);/)
})
