import { useEffect, useState } from 'react'
import { loadTrashItems, TRASH_CHANGE_EVENT, TRASH_STORAGE_KEY } from './trashStore.js'

const readCount = () => loadTrashItems().length

/** Keep desktop, Start, and taskbar icons in sync with browser-local trash state. */
export default function useTrashCount() {
  const [count, setCount] = useState(readCount)

  useEffect(() => {
    const update = () => setCount(readCount())
    const onStorage = (event) => {
      if (!event || event.key === TRASH_STORAGE_KEY || event.key === null) update()
    }
    window.addEventListener(TRASH_CHANGE_EVENT, update)
    window.addEventListener('storage', onStorage)
    update()
    return () => {
      window.removeEventListener(TRASH_CHANGE_EVENT, update)
      window.removeEventListener('storage', onStorage)
    }
  }, [])

  return count
}
