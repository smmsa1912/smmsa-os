import { useEffect, useRef } from 'react'
import { useOS } from '../store'

const TOUR_STEPS = [
  {
    title: 'Welcome to SMMSA-OS',
    kicker: '90-SECOND RECRUITER TOUR',
    body: 'Projects, skills, research, resume and contact.',
    next: 'Projects',
  },
  {
    title: 'Start with the work',
    kicker: '01 / SELECTED PROJECTS',
    appId: 'projects',
    projectId: 'oscar',
    body: 'OSCAR: browser, desktop and terminal automation. Review the workflow and test evidence.',
    next: 'Skills',
  },
  {
    title: 'The tools behind it',
    kicker: '02 / SKILLS & TOOLS',
    appId: 'skills',
    body: 'AI, backend, ML/vision and developer tools.',
    next: 'Publications',
  },
  {
    title: 'Research and publications',
    kicker: '03 / RESEARCH',
    appId: 'papers',
    body: 'Three published papers with source links.',
    next: 'Resume',
  },
  {
    title: 'Resume in one click',
    kicker: '04 / RESUME',
    appId: 'resume',
    body: 'Open or download the resume PDF.',
    next: 'Contact',
  },
  {
    title: 'Contact Andrew',
    kicker: '05 / CONTACT',
    appId: 'contact',
    body: 'Email, GitHub and LinkedIn.',
    next: 'Finish',
  },
  {
    title: 'You’re all set',
    kicker: 'TOUR COMPLETE',
    body: 'You’re all set. Explore the desktop.',
    next: 'Explore desktop',
  },
]

export default function RecruiterTour() {
  const stepIndex = useOS((state) => state.recruiterTourStep)
  const advance = useOS((state) => state.advanceRecruiterTour)
  const endTour = useOS((state) => state.endRecruiterTour)
  const previouslyOpenedApp = useRef(null)
  const tourCreatedApps = useRef(new Set())

  useEffect(() => {
    const previousAppId = previouslyOpenedApp.current
    if (previousAppId && tourCreatedApps.current.has(previousAppId)) {
      const previousWindow = useOS.getState().windows.find((win) => win.appId === previousAppId)
      if (previousWindow) useOS.getState().close(previousWindow.id)
      tourCreatedApps.current.delete(previousAppId)
    }
    previouslyOpenedApp.current = null

    if (stepIndex < 0) return
    const step = TOUR_STEPS[stepIndex]
    if (!step?.appId) return

    const state = useOS.getState()
    const alreadyOpen = state.windows.some((win) => win.appId === step.appId)
    if (step.projectId) state.setSelectedProject(step.projectId)
    state.openApp(step.appId)
    if (!alreadyOpen) tourCreatedApps.current.add(step.appId)
    previouslyOpenedApp.current = step.appId
  }, [stepIndex])

  useEffect(() => {
    if (stepIndex >= 0) return undefined
    const createdApps = [...tourCreatedApps.current]
    createdApps.forEach((appId) => {
      const win = useOS.getState().windows.find((item) => item.appId === appId)
      if (win) useOS.getState().close(win.id)
    })
    tourCreatedApps.current.clear()
    previouslyOpenedApp.current = null
    return undefined
  }, [stepIndex])

  useEffect(() => {
    if (stepIndex < 0) return undefined
    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        endTour()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [stepIndex, endTour])

  if (stepIndex < 0) return null
  const step = TOUR_STEPS[stepIndex] ?? TOUR_STEPS[0]
  const isFinal = stepIndex === TOUR_STEPS.length - 1

  return (
    <aside className="recruiter-tour" role="dialog" aria-modal="false" aria-labelledby="recruiter-tour-title" aria-describedby="recruiter-tour-body">
      <div className="recruiter-tour-topline">
        <span className="recruiter-tour-mark" aria-hidden="true">AN</span>
        <span>{step.kicker}</span>
        <button type="button" className="recruiter-tour-close" onClick={endTour} aria-label="Skip guided tour" title="Skip tour">×</button>
      </div>
      <div className="recruiter-tour-progress" aria-label={`Step ${stepIndex + 1} of ${TOUR_STEPS.length}`}>
        {TOUR_STEPS.map((tourStep, index) => <span key={tourStep.kicker} className={index <= stepIndex ? 'is-complete' : ''} />)}
      </div>
      <h2 id="recruiter-tour-title">{step.title}</h2>
      <p id="recruiter-tour-body">{step.body}</p>
      <div className="recruiter-tour-footer">
        <span>{isFinal ? 'Tour complete' : `STEP ${String(stepIndex + 1).padStart(2, '0')} / ${String(TOUR_STEPS.length).padStart(2, '0')}`}</span>
        <button type="button" className="recruiter-tour-next" onClick={isFinal ? endTour : advance}>
          {step.next} <span aria-hidden="true">→</span>
        </button>
      </div>
    </aside>
  )
}
