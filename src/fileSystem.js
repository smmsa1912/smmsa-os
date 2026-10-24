export const EXPLORER_STORAGE_KEY = 'smmsa-explorer-files-v1'

export const starterFiles = [
  { id: 'home', name: 'Andrew', type: 'folder', parentId: null, modified: 'Today' },
  { id: 'desktop', name: 'Desktop', type: 'folder', parentId: 'home', modified: 'Today' },
  { id: 'documents', name: 'Documents', type: 'folder', parentId: 'home', modified: 'Today' },
  { id: 'downloads', name: 'Downloads', type: 'folder', parentId: 'home', modified: 'Today' },
  { id: 'pictures', name: 'Pictures', type: 'folder', parentId: 'home', modified: 'Today' },
  { id: 'projects-folder', name: 'Projects', type: 'folder', parentId: 'home', modified: 'Today' },
  { id: 'readme', name: 'Readme.txt', type: 'file', parentId: 'documents', modified: 'Today', content: 'Welcome to SMMSA-OS!\n\nThis is a browser-local demo filesystem. You can create folders and text files here. Changes are saved in this browser and do not touch files on your actual computer.\n\nHave fun exploring! ✨' },
  { id: 'ideas', name: 'Ideas.txt', type: 'file', parentId: 'documents', modified: 'Today', content: 'Project ideas\n============\n\n• Build something useful\n• Test it with real users\n• Iterate and improve\n' },
  { id: 'oscar-folder', name: 'OSCAR', type: 'folder', parentId: 'projects-folder', modified: 'Today' },
  { id: 'finverse-folder', name: 'FinVerse', type: 'folder', parentId: 'projects-folder', modified: 'Today' },
  { id: 'welcome-download', name: 'Welcome.txt', type: 'file', parentId: 'downloads', modified: 'Today', content: 'Your downloads folder is ready.\n\nNew files you create in this demo Explorer will stay inside the browser.' },
]

export function loadExplorerFiles() {
  try {
    const stored = JSON.parse(localStorage.getItem(EXPLORER_STORAGE_KEY) || 'null')
    if (Array.isArray(stored) && stored.some((item) => item?.id === 'home')) return stored
  } catch {
    // Keep the starter filesystem available when browser storage is blocked.
  }
  return starterFiles
}

export function saveExplorerFiles(files) {
  try {
    localStorage.setItem(EXPLORER_STORAGE_KEY, JSON.stringify(files))
    return true
  } catch {
    return false
  }
}
