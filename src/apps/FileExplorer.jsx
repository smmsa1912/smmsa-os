import { useMemo, useState } from 'react'
import { appMeta } from '../appMeta'
import { loadExplorerFiles, saveExplorerFiles } from '../fileSystem'
import { moveFilesToTrash } from '../trashStore'

function uniqueId() {
  return globalThis.crypto?.randomUUID?.() ?? `item-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function ItemIcon({ item }) {
  return <span className={`explorer-item-icon ${item.type === 'folder' ? 'folder' : 'file'}`} aria-hidden="true">{item.type === 'folder' ? '📁' : '📄'}</span>
}

export default function FileExplorer() {
  const [files, setFiles] = useState(loadExplorerFiles)
  const [currentFolder, setCurrentFolder] = useState('home')
  const [selectedId, setSelectedId] = useState(null)
  const [query, setQuery] = useState('')
  const [createKind, setCreateKind] = useState(null)
  const [newName, setNewName] = useState('')
  const [renameId, setRenameId] = useState(null)
  const [renameName, setRenameName] = useState('')
  const [notice, setNotice] = useState('This PC · browser-local demo')

  const commitFiles = (nextFiles, successNotice = null) => {
    const saved = saveExplorerFiles(nextFiles)
    setFiles(nextFiles)
    if (!saved) {
      setNotice('Storage unavailable · changes may not persist')
    } else if (successNotice) {
      setNotice(successNotice)
    } else if (notice.startsWith('Storage unavailable')) {
      setNotice('Changes saved in this browser.')
    }
  }

  const byId = useMemo(() => new Map(files.map((item) => [item.id, item])), [files])
  const current = byId.get(currentFolder) || byId.get('home')
  const breadcrumbs = useMemo(() => {
    const trail = []
    let cursor = current
    while (cursor) {
      trail.unshift(cursor)
      cursor = cursor.parentId ? byId.get(cursor.parentId) : null
    }
    return trail
  }, [current, byId])
  const visibleFiles = useMemo(() => {
    const listing = files.filter((item) => item.parentId === currentFolder)
    const needle = query.trim().toLowerCase()
    return (needle ? listing.filter((item) => item.name.toLowerCase().includes(needle)) : listing)
      .slice()
      .sort((a, b) => (a.type === b.type ? a.name.localeCompare(b.name) : a.type === 'folder' ? -1 : 1))
  }, [files, currentFolder, query])
  const selected = selectedId ? byId.get(selectedId) : null

  const goTo = (id) => {
    if (byId.get(id)?.type !== 'folder') return
    setCurrentFolder(id)
    setSelectedId(null)
    setQuery('')
    setCreateKind(null)
    setNotice(`${byId.get(id).name} · ${files.filter((item) => item.parentId === id).length} items`)
  }

  const createItem = (event) => {
    event.preventDefault()
    const name = newName.trim()
    if (!name) return
    if (files.some((item) => item.parentId === currentFolder && item.name.toLowerCase() === name.toLowerCase())) {
      setNotice('An item with that name already exists.')
      return
    }
    const isFolder = createKind === 'folder'
    const id = uniqueId()
    const item = {
      id,
      name: isFolder || /\.[a-z0-9]{1,8}$/i.test(name) ? name : `${name}.txt`,
      type: isFolder ? 'folder' : 'file',
      parentId: currentFolder,
      modified: 'Just now',
      ...(isFolder ? {} : { content: '' }),
    }
    commitFiles([...files, item], `${isFolder ? 'Folder' : 'Text file'} created.`)
    setSelectedId(id)
    setNewName('')
    setCreateKind(null)
  }

  const beginRename = () => {
    if (!selected) return
    setRenameId(selected.id)
    setRenameName(selected.name)
  }

  const commitRename = (event) => {
    event.preventDefault()
    const name = renameName.trim()
    if (!name || !renameId) return
    if (files.some((item) => item.parentId === currentFolder && item.id !== renameId && item.name.toLowerCase() === name.toLowerCase())) {
      setNotice('An item with that name already exists.')
      return
    }
    commitFiles(files.map((item) => item.id === renameId ? { ...item, name, modified: 'Just now' } : item), 'Item renamed.')
    setRenameId(null)
    setRenameName('')
  }

  const deleteSelected = () => {
    if (!selected) return
    const descendants = new Set([selected.id])
    let changed = true
    while (changed) {
      changed = false
      for (const item of files) {
        if (item.parentId && descendants.has(item.parentId) && !descendants.has(item.id)) {
          descendants.add(item.id)
          changed = true
        }
      }
    }
    const removed = files.filter((item) => descendants.has(item.id))
    const originalPath = breadcrumbs.map((part) => part.name).join(' / ')
    moveFilesToTrash(removed, originalPath)
    commitFiles(files.filter((item) => !descendants.has(item.id)), `${removed.length} item${removed.length === 1 ? '' : 's'} moved to Recycle Bin.`)
    setSelectedId(null)
  }

  const updateContent = (content) => {
    if (!selected || selected.type !== 'file') return
    commitFiles(files.map((item) => item.id === selected.id ? { ...item, content, modified: 'Just now' } : item))
  }

  return (
    <div className="explorer-app">
      <header className="explorer-toolbar">
        <div className="explorer-nav-buttons">
          <button type="button" aria-label="Go home" title="Home" onClick={() => goTo('home')}>⌂</button>
          <button type="button" aria-label="Go up one folder" title="Up one folder" disabled={!current?.parentId} onClick={() => current?.parentId && goTo(current.parentId)}>↑</button>
        </div>
        <div className="explorer-breadcrumbs" aria-label="Current folder">
          {breadcrumbs.map((part, index) => (
            <span key={part.id}>
              {index > 0 && <b aria-hidden="true">›</b>}
              <button type="button" className={index === breadcrumbs.length - 1 ? 'current' : ''} onClick={() => goTo(part.id)}>{part.name}</button>
            </span>
          ))}
        </div>
        <label className="explorer-search"><span aria-hidden="true">⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search this folder" aria-label="Search this folder" /></label>
      </header>

      <div className="explorer-actions">
        <button type="button" onClick={() => { setCreateKind('folder'); setNewName(''); setNotice('Name your new folder.') }}>＋ Folder</button>
        <button type="button" onClick={() => { setCreateKind('file'); setNewName(''); setNotice('Name your new text file.') }}>＋ Text file</button>
        <button type="button" disabled={!selected} onClick={beginRename}>Rename</button>
        <button type="button" disabled={!selected} onClick={deleteSelected}>Delete</button>
        <span className="explorer-spacer" />
        <span className="explorer-count">{visibleFiles.length} items</span>
      </div>

      {createKind && (
        <form className="explorer-inline-form" onSubmit={createItem}>
          <label>{createKind === 'folder' ? 'Folder name' : 'Text file name'}
            <input autoFocus value={newName} onChange={(event) => setNewName(event.target.value)} placeholder={createKind === 'folder' ? 'New folder' : 'notes.txt'} />
          </label>
          <button type="submit">Create</button>
          <button type="button" className="muted" onClick={() => setCreateKind(null)}>Cancel</button>
        </form>
      )}
      {renameId && (
        <form className="explorer-inline-form" onSubmit={commitRename}>
          <label>New name<input autoFocus value={renameName} onChange={(event) => setRenameName(event.target.value)} /></label>
          <button type="submit">Save name</button>
          <button type="button" className="muted" onClick={() => setRenameId(null)}>Cancel</button>
        </form>
      )}

      <div className="explorer-layout">
        <aside className="explorer-sidebar" aria-label="Quick access">
          <div className="explorer-sidebar-heading">QUICK ACCESS</div>
          {[['home', '⌂', 'Home'], ['desktop', '▦', 'Desktop'], ['documents', '▤', 'Documents'], ['downloads', '↓', 'Downloads'], ['pictures', '▧', 'Pictures'], ['projects-folder', '▣', 'Projects']].map(([id, icon, label]) => (
            <button type="button" key={id} className={currentFolder === id ? 'active' : ''} onClick={() => byId.has(id) && goTo(id)}><span>{icon}</span>{label}</button>
          ))}
          <div className="explorer-sidebar-note">Local demo storage<br />Saved in this browser</div>
        </aside>

        <section className="explorer-main">
          <div className="explorer-list-head"><span>Name</span><span>Type</span><span>Modified</span></div>
          <div className="explorer-list" role="listbox" aria-label="Files and folders">
            {visibleFiles.map((item) => (
              <button
                type="button"
                key={item.id}
                role="option"
                aria-selected={selectedId === item.id}
                className={`explorer-row${selectedId === item.id ? ' selected' : ''}`}
                onClick={() => setSelectedId(item.id)}
                onDoubleClick={() => item.type === 'folder' ? goTo(item.id) : (setSelectedId(item.id), setNotice(`${item.name} opened in preview.`))}
              >
                <span className="explorer-name"><ItemIcon item={item} />{item.name}</span>
                <span>{item.type === 'folder' ? 'Folder' : 'Text file'}</span>
                <span>{item.modified || '—'}</span>
              </button>
            ))}
            {visibleFiles.length === 0 && <div className="explorer-empty">{query ? 'No matching items in this folder.' : 'This folder is empty. Create a folder or text file to get started.'}</div>}
          </div>
          <div className="explorer-preview">
            {selected && selected.type === 'file' ? (
              <>
                <div className="explorer-preview-title"><span>📄</span><strong>{selected.name}</strong><small>Auto-saves as you type</small></div>
                <textarea value={selected.content || ''} onChange={(event) => updateContent(event.target.value)} aria-label={`Contents of ${selected.name}`} placeholder="Start typing…" />
              </>
            ) : selected && selected.type === 'folder' ? (
              <div className="explorer-preview-empty"><strong>{selected.name}</strong><span>Folder · {files.filter((item) => item.parentId === selected.id).length} items</span><button type="button" onClick={() => goTo(selected.id)}>Open folder →</button></div>
            ) : (
              <div className="explorer-preview-empty"><strong>Choose a file</strong><span>Select an item to preview it, or double-click a folder to open it.</span></div>
            )}
          </div>
        </section>
      </div>
      <footer className="explorer-status"><span>{notice}</span><span>{appMeta.explorer.title} · v1.0</span></footer>
    </div>
  )
}
