import { useSyncExternalStore } from 'react'

const QUERY = '(max-width: 700px)'

const subscribe = (callback) => {
  const media = window.matchMedia(QUERY)
  media.addEventListener('change', callback)
  return () => media.removeEventListener('change', callback)
}

// On small screens windows go full-screen instead of floating.
export default function useIsMobile() {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(QUERY).matches,
    () => false,
  )
}
