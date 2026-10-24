import { useCallback, useEffect, useRef, useState } from 'react'
import { useOS } from './store'
import Boot from './components/Boot'
import Desktop from './components/Desktop'
import LockScreen from './components/LockScreen'
import Taskbar from './components/Taskbar'

const BOOT_KEY = 'smmsa-booted'
const SIGNED_IN_KEY = 'smmsa-signed-in'

const hasSessionFlag = (key) => {
  try {
    return sessionStorage.getItem(key) === '1'
  } catch {
    return false
  }
}

export default function App() {
  const restartCount = useOS((s) => s.restartCount)
  // Keep all recruiter navigation inside the operating-system desktop.
  return <AppSession key={restartCount} isRestart={restartCount > 0} />
}

function AppSession({ isRestart }) {
  const [booted, setBooted] = useState(() => !isRestart && hasSessionFlag(BOOT_KEY))
  const [signedIn, setSignedIn] = useState(() => !isRestart && (hasSessionFlag(SIGNED_IN_KEY) || hasSessionFlag(BOOT_KEY)))
  const locked = useOS((s) => s.locked)
  const theme = useOS((s) => s.theme)
  const openApp = useOS((s) => s.openApp)
  const didAutoOpen = useRef(false)

  const finishBoot = useCallback(() => {
    try {
      sessionStorage.setItem(BOOT_KEY, '1')
      if (isRestart) sessionStorage.removeItem(SIGNED_IN_KEY)
      else sessionStorage.setItem(SIGNED_IN_KEY, '1')
    } catch {
      // The flow still works without session storage, but may repeat after reload.
    }
    setBooted(true)
    setSignedIn(!isRestart)
    // A public portfolio should not make recruiters click through a fake sign-in.
    if (!isRestart) useOS.getState().unlockOS()
  }, [isRestart])

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
    if (isRestart || !booted || !signedIn || locked || didAutoOpen.current) return
    didAutoOpen.current = true
    // Open Recruiter Desk inside the desktop so the first window gives hiring teams
    // a direct, evidence-first overview without leaving the operating-system experience.
    openApp('recruiter')
  }, [booted, signedIn, locked, openApp, isRestart])

  if (!booted) return <Boot onDone={finishBoot} />
  if (!signedIn || locked) return <LockScreen onUnlock={finishSignIn} />

  return (
    <div className="os" data-theme={theme}>
      <Desktop />
      <Taskbar />
    </div>
  )
}
