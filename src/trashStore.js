import { loadExplorerFiles, saveExplorerFiles } from './fileSystem.js'

export const TRASH_STORAGE_KEY = 'smmsa-recycle-bin-v1'
export const TRASH_CHANGE_EVENT = 'smmsa-trash-change'

const demoTrashItems = [
  { id: 'trash-demo-bugs', name: 'bugs_final_FINAL_v2.zip', type: 'archive', sizeBytes: 2_516_582, parentId: 'documents', originalPath: 'Andrew / Documents', modified: 'Today', deletedAt: 'Demo item', content: 'A very final build archive. Possibly final this time.' },
  { id: 'trash-demo-sleep', name: 'sleep_schedule.exe', type: 'application', sizeBytes: 49_152, parentId: 'documents', originalPath: 'Andrew / Documents', modified: 'Yesterday', deletedAt: 'Demo item', content: 'Launches a better sleep routine. Requires motivation.dll.' },
  { id: 'trash-demo-tabs', name: 'stack_overflow_tabs(214).html', type: 'file', sizeBytes: 1_887_436, parentId: 'documents', originalPath: 'Andrew / Documents', modified: 'Yesterday', deletedAt: 'Demo item', content: '214 tabs. One answer. Twelve contradictory answers.' },
  { id: 'trash-demo-tutorial', name: 'tutorial_hell.mp4', type: 'video', sizeBytes: 88_080_384, parentId: 'downloads', originalPath: 'Andrew / Downloads', modified: 'Oct 21', deletedAt: 'Demo item', content: 'A playlist of tutorials bookmarked instead of completed.' },
  { id: 'trash-demo-machine', name: 'it_works_on_my_machine.txt', type: 'file', sizeBytes: 2_048, parentId: 'documents', originalPath: 'Andrew / Documents', modified: 'Oct 20', deletedAt: 'Demo item', content: 'Tested locally. Production is a different machine.' },
].map((item) => ({ ...item, deletedBatchId: item.id, demo: true }))

function emitChange() {
  if (typeof window === 'undefined') return
  const event = typeof CustomEvent === 'function'
    ? new CustomEvent(TRASH_CHANGE_EVENT)
    : new Event(TRASH_CHANGE_EVENT)
  window.dispatchEvent(event)
}

export function loadTrashItems() {
  try {
    const serialized = localStorage.getItem(TRASH_STORAGE_KEY)
    if (serialized !== null) {
      const stored = JSON.parse(serialized)
      if (Array.isArray(stored)) return stored
    }
    localStorage.setItem(TRASH_STORAGE_KEY, JSON.stringify(demoTrashItems))
  } catch {
    // Demo items still render if browser storage is unavailable.
  }
  return demoTrashItems
}

export function saveTrashItems(items) {
  try {
    localStorage.setItem(TRASH_STORAGE_KEY, JSON.stringify(items))
  } catch {
    // Keep the current in-memory UI usable even if storage is blocked.
  }
  emitChange()
}

function newId() {
  return globalThis.crypto?.randomUUID?.() ?? `trash-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export function moveFilesToTrash(items, originalPath) {
  if (!items.length) return
  const deletedBatchId = newId()
  const deletedAt = new Date().toISOString()
  const byId = new Map(items.map((item) => [item.id, item]))
  const pathFor = (item) => {
    const ancestors = []
    let parent = byId.get(item.parentId)
    while (parent) {
      ancestors.unshift(parent.name)
      parent = byId.get(parent.parentId)
    }
    return [originalPath, ...ancestors].filter(Boolean).join(' / ')
  }
  const moved = items.map((item) => ({
    ...item,
    originalPath: pathFor(item),
    deletedAt,
    deletedBatchId,
    sizeBytes: item.sizeBytes ?? Math.max(1, (item.content?.length ?? 0) * 2),
    demo: false,
  }))
  saveTrashItems([...loadTrashItems(), ...moved])
}

function makeUniqueName(item, siblings) {
  const siblingNames = new Set(siblings.filter((sibling) => sibling.parentId === item.parentId).map((sibling) => sibling.name.toLowerCase()))
  if (!siblingNames.has(item.name.toLowerCase())) return item.name
  const lastDot = item.name.lastIndexOf('.')
  const hasExtension = lastDot > 0 && lastDot < item.name.length - 1
  const stem = hasExtension ? item.name.slice(0, lastDot) : item.name
  const extension = hasExtension ? item.name.slice(lastDot) : ''
  let suffix = 1
  while (siblingNames.has(`${stem} (restored ${suffix})${extension}`.toLowerCase())) suffix += 1
  return `${stem} (restored ${suffix})${extension}`
}

function batchFor(items, item) {
  if (!item) return []
  return item.deletedBatchId
    ? items.filter((entry) => entry.deletedBatchId === item.deletedBatchId)
    : [item]
}

export function restoreTrashItem(itemId) {
  const trash = loadTrashItems()
  const item = trash.find((entry) => entry.id === itemId)
  if (!item) return { restored: 0, remaining: trash }

  const batch = batchFor(trash, item)
  const batchIds = new Set(batch.map((entry) => entry.id))
  const explorerFiles = loadExplorerFiles().map((entry) => ({ ...entry }))
  const pending = [...batch]
  const restored = []
  let progress = true

  while (pending.length && progress) {
    progress = false
    for (let index = pending.length - 1; index >= 0; index -= 1) {
      const entry = pending[index]
      let parentId = entry.parentId
      const parentAvailable = parentId == null || explorerFiles.some((file) => file.id === parentId) || restored.some((file) => file.id === parentId)
      if (!parentAvailable) continue
      const restoredItem = { ...entry, name: makeUniqueName({ ...entry, parentId }, [...explorerFiles, ...restored]), parentId }
      delete restoredItem.originalPath
      delete restoredItem.deletedAt
      delete restoredItem.deletedBatchId
      delete restoredItem.sizeBytes
      delete restoredItem.demo
      restored.push(restoredItem)
      pending.splice(index, 1)
      progress = true
    }
  }

  // If a parent was removed separately, preserve the item under Documents (or the root).
  for (const entry of pending) {
    const fallbackParent = explorerFiles.find((file) => file.id === 'documents') ?? explorerFiles.find((file) => file.id === 'home')
    const parentId = fallbackParent?.id ?? null
    const restoredItem = { ...entry, parentId, name: makeUniqueName({ ...entry, parentId }, [...explorerFiles, ...restored]) }
    delete restoredItem.originalPath
    delete restoredItem.deletedAt
    delete restoredItem.deletedBatchId
    delete restoredItem.sizeBytes
    delete restoredItem.demo
    restored.push(restoredItem)
  }

  const newFiles = [...explorerFiles, ...restored]
  saveExplorerFiles(newFiles)
  const remaining = trash.filter((entry) => !batchIds.has(entry.id))
  saveTrashItems(remaining)
  return { restored: restored.length, remaining }
}

export function permanentlyDeleteTrashItem(itemId) {
  const trash = loadTrashItems()
  const item = trash.find((entry) => entry.id === itemId)
  if (!item) return { deleted: 0, remaining: trash }
  const batch = batchFor(trash, item)
  const ids = new Set(batch.map((entry) => entry.id))
  const remaining = trash.filter((entry) => !ids.has(entry.id))
  saveTrashItems(remaining)
  return { deleted: batch.length, remaining }
}

export function emptyTrash() {
  saveTrashItems([])
  return []
}

export function formatBytes(bytes = 0) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(1)} KB`
  if (bytes < 1024 ** 3) return `${(bytes / 1024 ** 2).toFixed(bytes >= 10 * 1024 ** 2 ? 0 : 1)} MB`
  return `${(bytes / 1024 ** 3).toFixed(1)} GB`
}
