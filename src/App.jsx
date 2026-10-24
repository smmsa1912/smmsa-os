import { useCallback, useEffect, useRef, useState } from 'react'
import { useOS } from './store'
import Boot from './components/Boot'
import Desktop from './components/Desktop'
import LockScreen from './components/LockScreen'
import Taskbar from './components/Taskbar'

const BOOT_KEY = 'smmsa-booted'
const SIGNED_IN_KEY = 'smmsa-signed-in'
const WELCOME_KEY = 'smmsa-welcome-seen-v1'

const hasSessionFlag = (key) => {
  try {
    return sessionStorage.getItem(key) === '1'
  } catch {
    return false
  }
}

export default function App() {
  const restartCount = useOS((s) => s.restartCount)
  // Remount the session controller on restart so boot state is initialized cleanly.
  // This avoids synchronously resetting state from an effect.
  return <AppSession key={restartCount} isRestart={restartCount > 0} />
}

function AppSession({ isRestart }) {
  const [booted, setBooted] = useState(() => !isRestart && hasSessionFlag(BOOT_KEY))
  const [signedIn, setSignedIn] = useState(() => !isRestart && hasSessionFlag(SIGNED_IN_KEY))
  const locked = useOS((s) => s.locked)
  const theme = useOS((s) => s.theme)
  const openApp = useOS((s) => s.openApp)
  const didAutoOpen = useRef(false)

  const finishBoot = useCallback(() => {
    try {
      sessionStorage.setItem(BOOT_KEY, '1')
      sessionStorage.removeItem(SIGNED_IN_KEY)
    } catch {
      // The flow still works without session storage, but may repeat after reload.
    }
    setBooted(true)
    setSignedIn(false)
  }, [])

  const finishSignIn = useCallback(() => {
    try {
      sessionStorage.setItem(SIGNED_IN_KEY, '1')
      sessionStorage.setItem(BOOT_KEY, '1')
    } catch {
      // A blocked storage implementation should not prevent signing in.
    }
    setSignedIn(true)
    useOS.getState().unlockOS()
  }, [])

  useEffect(() => {
    if (!isRestart) return
    try {
      sessionStorage.removeItem(BOOT_KEY)
      sessionStorage.removeItem(SIGNED_IN_KEY)
    } catch {
      // Restart still works in memory if storage is unavailable.
    }
  }, [isRestart])

  useEffect(() => {
    if (!booted || !signedIn || locked || didAutoOpen.current) return
    didAutoOpen.current = true

    // Show Portfolio Home automatically only on the first visit to this browser.
    // Returning visitors can still open it from the Home taskbar button or Start.
    let welcomeSeen = false
    try {
      welcomeSeen = localStorage.getItem(WELCOME_KEY) === '1'
      if (!welcomeSeen) localStorage.setItem(WELCOME_KEY, '1')
    } catch {
      // If storage is blocked, keep the friendly first-session behavior.
    }
    if (!welcomeSeen) openApp('quick')
  }, [booted, signedIn, locked, openApp])

  if (!booted) return <Boot onDone={finishBoot} />
  if (!signedIn || locked) return <LockScreen onUnlock={finishSignIn} />

  return (
    <div className="os" data-theme={theme}>
      <Desktop />
      <Taskbar />
    </div>
  )
}
