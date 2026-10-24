import { useEffect, useMemo, useState } from 'react'
import {
  emptyTrash,
  formatBytes,
  loadTrashItems,
  permanentlyDeleteTrashItem,
  restoreTrashItem,
  TRASH_CHANGE_EVENT,
} from '../trashStore'

function glyphFor(item) {
  if (item.type === 'folder') return '▰'
  if (item.type === 'archive') return '▣'
  if (item.type === 'application') return '⌘'
  if (item.type === 'video') return '▶'
  return '▤'
}

function displayDeletedDate(item) {
  if (item.demo) return 'Demo item'
  const date = new Date(item.deletedAt)
  if (Number.isNaN(date.getTime())) return 'Recently'
  return date.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
}

function groupSize(items, selected) {
  if (!selected) return 0
  return selected.deletedBatchId
    ? items.filter((item) => item.deletedBatchId === selected.deletedBatchId).length
    : 1
}

export default function RecycleBin() {
  const [items, setItems] = useState(loadTrashItems)
  const [selectedId, setSelectedId] = useState(() => loadTrashItems()[0]?.id ?? null)
  const [confirmation, setConfirmation] = useState(null)
  const [notice, setNotice] = useState('Local demo bin · nothing on your actual device is affected.')

  useEffect(() => {
    const refresh = () => {
      const next = loadTrashItems()
      setItems(next)
      setSelectedId((current) => (next.some((item) => item.id === current) ? current : next[0]?.id ?? null))
    }
    window.addEventListener(TRASH_CHANGE_EVENT, refresh)
    window.addEventListener('storage', refresh)
    return () => {
      window.removeEventListener(TRASH_CHANGE_EVENT, refresh)
      window.removeEventListener('storage', refresh)
    }
  }, [])

  const selected = items.find((item) => item.id === selectedId) ?? null
  const stats = useMemo(() => ({
    folders: items.filter((item) => item.type === 'folder').length,
    files: items.filter((item) => item.type !== 'folder').length,
    bytes: items.reduce((total, item) => total + (Number(item.sizeBytes) || 0), 0),
  }), [items])
  const selectedGroupSize = groupSize(items, selected)

  const restoreSelected = () => {
    if (!selected) return
    const result = restoreTrashItem(selected.id)
    setItems(result.remaining)
    setSelectedId(result.remaining[0]?.id ?? null)
    setConfirmation(null)
    setNotice(`${result.restored} item${result.restored === 1 ? '' : 's'} restored to File Explorer.`)
  }

  const confirmAction = () => {
    if (!confirmation) return
    if (confirmation.mode === 'empty') {
      emptyTrash()
      setItems([])
      setSelectedId(null)
      setNotice('Bin emptied. A fresh start. The questionable decisions are still canon.')
    } else if (confirmation.mode === 'delete' && selected) {
      const result = permanentlyDeleteTrashItem(selected.id)
      setItems(result.remaining)
      setSelectedId(result.remaining[0]?.id ?? null)
      setNotice(`${result.deleted} item${result.deleted === 1 ? '' : 's'} permanently removed from this demo bin.`)
    }
    setConfirmation(null)
  }

  return (
    <section className="trash-app" aria-label="Recycle Bin demo">
      <header className="trash-masthead">
        <div className="trash-masthead-copy">
          <p className="trash-kicker">SMMSA-OS // STORAGE UTILITIES</p>
          <h2>Recycle Bin</h2>
          <p className="trash-subtitle">The final resting place for old builds, questionable filenames, and unfinished side quests.</p>
        </div>
        <div className="trash-can-art" aria-hidden="true">
          <span className="trash-spark trash-spark-a">✦</span>
          <span className="trash-spark trash-spark-b">+</span>
          <span className="trash-can-lid" />
          <span className="trash-can-body"><i /><i /><i /></span>
          <span className="trash-can-label">TRASH<br />SYS.01</span>
        </div>
      </header>

      <div className="trash-stats" aria-label="Recycle Bin summary">
        <div className="trash-stat"><span>ITEMS</span><strong>{items.length.toString().padStart(2, '0')}</strong><small>in quarantine</small></div>
        <div className="trash-stat"><span>FILES</span><strong>{stats.files.toString().padStart(2, '0')}</strong><small>loose artifacts</small></div>
        <div className="trash-stat"><span>FOLDERS</span><strong>{stats.folders.toString().padStart(2, '0')}</strong><small>full batches</small></div>
        <div className="trash-stat trash-stat-space"><span>EST. SIZE</span><strong>{formatBytes(stats.bytes)}</strong><small>browser-local records</small></div>
      </div>

      <div className="trash-toolbar">
        <div className="trash-toolbar-label"><span className="trash-led" /> BIN CONTENTS <small>{items.length} item{items.length === 1 ? '' : 's'}</small></div>
        <div className="trash-toolbar-actions">
          <button type="button" className="btn trash-restore" onClick={restoreSelected} disabled={!selected} title={selectedGroupSize > 1 ? `Restore all ${selectedGroupSize} items from this folder batch` : 'Restore selected item'}>↶ Restore{selectedGroupSize > 1 ? ` (${selectedGroupSize})` : ''}</button>
          <button type="button" className="btn trash-delete" onClick={() => setConfirmation({ mode: 'delete' })} disabled={!selected}>× Delete</button>
          <button type="button" className="btn trash-empty" onClick={() => setConfirmation({ mode: 'empty' })} disabled={!items.length}>Empty Bin</button>
        </div>
      </div>

      {items.length ? (
        <div className="trash-workspace">
          <section className="trash-list-panel" aria-label="Items in Recycle Bin">
            <div className="trash-list-head"><span>NAME</span><span>SIZE</span><span>DELETED</span></div>
            <div className="trash-items" role="listbox" aria-label="Deleted demo files">
              {items.map((item) => (
                <button
                  type="button"
                  role="option"
                  aria-selected={selected?.id === item.id}
                  key={item.id}
                  className={`trash-item${selected?.id === item.id ? ' selected' : ''}`}
                  onClick={() => setSelectedId(item.id)}
                >
                  <span className={`trash-item-glyph trash-glyph-${item.type}`} aria-hidden="true">{glyphFor(item)}</span>
                  <span className="trash-item-name"><strong>{item.name}</strong><small>{item.type === 'folder' ? 'Folder' : item.type === 'archive' ? 'Compressed archive' : item.type === 'application' ? 'Application' : item.type === 'video' ? 'Video file' : 'Document'} · {item.originalPath || 'Unknown location'}</small></span>
                  <span className="trash-item-size">{formatBytes(item.sizeBytes)}</span>
                  <span className="trash-item-date">{displayDeletedDate(item)}</span>
                </button>
              ))}
            </div>
          </section>

          <aside className="trash-details" aria-label="Selected item details">
            <div className="trash-details-top"><span>SELECTED OBJECT</span><span className="trash-object-id">#{String(items.findIndex((item) => item.id === selected?.id) + 1).padStart(2, '0')}</span></div>
            {selected && <>
              <div className={`trash-detail-glyph trash-glyph-${selected.type}`} aria-hidden="true">{glyphFor(selected)}</div>
              <h3>{selected.name}</h3>
              <p className="trash-detail-kind">{selected.type === 'folder' ? 'Directory object' : selected.type === 'archive' ? 'Compressed archive' : selected.type === 'application' ? 'Application file' : selected.type === 'video' ? 'Media object' : 'File object'}</p>
              <dl className="trash-meta">
                <div><dt>Original path</dt><dd>{selected.originalPath || 'Unknown location'}</dd></div>
                <div><dt>Size</dt><dd>{formatBytes(selected.sizeBytes)}</dd></div>
                <div><dt>Modified</dt><dd>{selected.modified || 'Unknown'}</dd></div>
                <div><dt>Deleted</dt><dd>{displayDeletedDate(selected)}</dd></div>
              </dl>
              <p className="trash-item-note">{selected.demo ? 'Demo item · browser-local.' : 'Browser-local item.'}</p>
              <button type="button" className="btn trash-details-restore" onClick={restoreSelected}>↶ Restore {selected.type === 'folder' && selectedGroupSize > 1 ? 'folder + contents' : 'selected'}</button>
            </>}
          </aside>
        </div>
      ) : (
        <div className="trash-empty-state">
          <div className="trash-empty-art" aria-hidden="true"><span>✓</span><i>✦</i></div>
          <p className="trash-kicker">ALL CLEAR // 0 OBJECTS</p>
          <h3>Nothing to see here.</h3>
          <p>Nothing here yet.</p>
          <span className="trash-empty-stamp">SYSTEM STATUS: SPOTLESS</span>
        </div>
      )}

      <footer className="trash-status" role="status" aria-live="polite"><span className="trash-led" />{notice}<span className="trash-local-note">LOCAL DEMO ONLY</span></footer>

      {confirmation && (
        <div className="trash-confirm-scrim">
          <section className="trash-confirm" role="dialog" aria-modal="true" aria-labelledby="trash-confirm-title" aria-describedby="trash-confirm-copy">
            <div className="trash-confirm-bar"><span>⚠ SYSTEM CONFIRMATION</span><button type="button" aria-label="Close confirmation" onClick={() => setConfirmation(null)}>×</button></div>
            <div className="trash-confirm-body">
              <div className="trash-confirm-icon" aria-hidden="true">{confirmation.mode === 'empty' ? '▤' : '×'}</div>
              <div><h3 id="trash-confirm-title">{confirmation.mode === 'empty' ? 'Empty the Recycle Bin?' : 'Delete this item permanently?'}</h3>
                <p id="trash-confirm-copy">{confirmation.mode === 'empty' ? `This removes ${items.length} demo item${items.length === 1 ? '' : 's'} from this browser-local bin. This cannot be undone.` : `This permanently removes ${selectedGroupSize} item${selectedGroupSize === 1 ? '' : 's'} from this browser-local bin. This cannot be undone.`}</p>
              </div>
            </div>
            <div className="trash-confirm-actions"><button type="button" className="btn trash-cancel" onClick={() => setConfirmation(null)}>Cancel</button><button type="button" className="btn trash-confirm-danger" onClick={confirmAction}>Yes, remove</button></div>
          </section>
        </div>
      )}
    </section>
  )
}
