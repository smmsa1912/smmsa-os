import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { profile, projects, publications } from '../src/data.js'

const source = async (path) => readFile(new URL(path, import.meta.url), 'utf8')

test('public entry opens the OS desktop immediately without a separate landing or boot', async () => {
  const app = await source('../src/App.jsx')
  const os = await source('../src/OSExperience.jsx')
  assert.match(app, /return <OSExperience \/>/)
  assert.doesNotMatch(app, /RecruiterLanding|desktopMode|switchMode/)
  assert.match(os, /const \[booted, setBooted\] = useState\(\(\) => !isRestart\)/)
  assert.match(os, /const \[signedIn, setSignedIn\] = useState\(\(\) => !isRestart\)/)
  assert.match(os, /openApp\('recruiter', \{ silent: true \}\)/)
  assert.match(os, /A public portfolio should not make recruiters click through a fake sign-in/)
  assert.match(os, /<Taskbar \/>/)
  const welcome = await source('../src/apps/QuickView.jsx')
  assert.match(welcome, /90-sec tour/)
  assert.match(welcome, /Engineering Dashboard/)
  assert.match(welcome, /Projects/)
  assert.match(welcome, /Resume/)
  assert.match(welcome, /Contact/)
})

test('agent lab and copilot are true desktop applications with registered windows and navigation', async () => {
  const meta = await source('../src/appMeta.js')
  const registry = await source('../src/apps/registry.js')
  const copilot = await source('../src/apps/EngineeringCopilot.jsx')
  const desk = await source('../src/apps/RecruiterDesk.jsx')
  assert.match(meta, /lab: \{ title: 'Agent Execution Lab'/)
  assert.match(meta, /copilot: \{ title: 'Recruiter Copilot'/)
  assert.match(registry, /lab: EngineeringLab/)
  assert.match(registry, /copilot: EngineeringCopilot/)
  assert.match(copilot, /setSelectedProject\(id\); openApp\('projects'\)/)
  assert.match(copilot, /onNavigate=\{openApp\}/)
  assert.match(desk, /openApp\('lab'\)/)
  assert.match(desk, /openApp\('copilot'\)/)
})

test('recruiter cards cover three featured projects and preserve remaining project details', async () => {
  const desk = await source('../src/apps/RecruiterDesk.jsx')
  const explorer = await source('../src/apps/Projects.jsx')
  assert.match(desk, /const FEATURED_IDS = \['oscar', 'research-agent', 'tradeassist'\]/)
  assert.match(explorer, /projects\.filter/)
  assert.match(explorer, /What I built/)
  assert.match(explorer, /Scope & caveats/)
  assert.match(explorer, /selectedProject\.implementationCaveats/)
  assert.ok(projects.length >= 7)
  assert.ok(projects.some(project => project.id === 'language-identification'))
  assert.equal(publications.length, 3)
  assert.ok(profile.resume.startsWith('/'))
})

test('the OS includes a guided recruiter tour that navigates projects, skills, papers, resume and contact', async () => {
  const tour = await source('../src/components/RecruiterTour.jsx')
  assert.match(tour, /90-SECOND RECRUITER TOUR/)
  assert.match(tour, /appId: 'projects'/)
  assert.match(tour, /appId: 'skills'/)
  assert.match(tour, /appId: 'papers'/)
  assert.match(tour, /appId: 'resume'/)
  assert.match(tour, /appId: 'contact'/)
  assert.match(tour, /Skip guided tour/)
  const desktop = await source('../src/components/Desktop.jsx')
  assert.match(desktop, /<RecruiterTour \/>/)
  const store = await source('../src/store.js')
  assert.match(store, /startRecruiterTour/)
  assert.match(store, /advanceRecruiterTour/)
  assert.match(store, /endRecruiterTour/)
})

test('Recruiter Desk is the primary in-OS app, with taskbar and Start access', async () => {
  const quickView = await source('../src/apps/QuickView.jsx')
  assert.match(quickView, /90-sec tour/)
  assert.match(quickView, /startRecruiterTour/)
  const taskbar = await source('../src/components/Taskbar.jsx')
  assert.match(taskbar, /Open Engineering Dashboard inside SMMSA-OS/)
  assert.match(taskbar, /openApp\('recruiter'\)/)
  const menu = await source('../src/components/StartMenu.jsx')
  assert.match(menu, /start-recruiter-shortcut/)
  assert.match(menu, /openApp\('recruiter'\)/)
  const meta = await source('../src/appMeta.js')
  assert.match(meta, /export const appMeta = \{\n {2}recruiter: \{ title: 'Engineering Dashboard'/)
  assert.match(meta, /title: 'Welcome to SMMSA-OS', label: 'Welcome'/)
  const pins = await source('../src/pinStore.js')
  assert.match(pins, /'recruiter', 'projects', 'resume'/)
})

test('Recruiter Desk surfaces resume, featured projects, concise proof points and in-OS shortcuts', async () => {
  const desk = await source('../src/apps/RecruiterDesk.jsx')
  assert.match(desk, /ENGINEERING DASHBOARD/)
  assert.match(desk, /AVAILABLE · REMOTE \/ MUMBAI/)
  assert.match(desk, /Open resume PDF/)
  assert.match(desk, /mailto:\$\{profile\.email\}/)
  assert.match(desk, /const FEATURED_IDS = \['oscar', 'research-agent', 'tradeassist'\]/)
  assert.match(desk, /Agentic AI and LLM engineering/)
  assert.match(desk, /openProject\(project\.id\)/)
  assert.match(desk, /startRecruiterTour/)
  assert.match(desk, /openApp\('skills'\)/)
  assert.match(desk, /openApp\('papers'\)/)
  const registry = await source('../src/apps/registry.js')
  assert.match(registry, /recruiter: RecruiterDesk/)
})

test('recruiter stylesheet includes responsive navigation, mobile cards, focus, and reduced motion', async () => {
  const css = await source('../src/engineering.css')
  assert.match(css, /@container \(max-width: 650px\)/)
  assert.match(css, /@container \(max-width: 380px\)/)
  assert.match(css, /:focus-visible/)
  assert.match(css, /prefers-reduced-motion: reduce/)
})


test('visible UI copy stays concise and removes redundant instructions', async () => {
  const [desk, welcome, assistant, tour, settings, skillsApp, contact] = await Promise.all([
    source('../src/apps/RecruiterDesk.jsx'),
    source('../src/apps/QuickView.jsx'),
    source('../src/apps/PortfolioAssistant.jsx'),
    source('../src/components/RecruiterTour.jsx'),
    source('../src/apps/Settings.jsx'),
    source('../src/apps/Skills.jsx'),
    source('../src/apps/Contact.jsx'),
  ])
  assert.match(desk, /ENGINEERING DASHBOARD/)
  assert.doesNotMatch(desk, /This desk puts the strongest evidence first|Want to explore further\?/)
  assert.match(welcome, /90-sec tour/)
  assert.doesNotMatch(welcome, /Take the guided tour to jump through selected work|This desktop is a hands-on way to explore my work/)
  assert.match(assistant, /Ask about Andrew’s projects, skills, experience or research/)
  assert.doesNotMatch(assistant, /Open-ended and reasoning questions use the local model|Quick answers work immediately; local AI is optional/)
  assert.match(tour, /Three published papers with source links/)
  assert.doesNotMatch(tour, /I’ll take you through the most useful parts first|You can close this tour at any time/)
  assert.doesNotMatch(settings, /Your choices are saved in this browser|Switch the whole desktop between/)
  assert.doesNotMatch(skillsApp, /A practical overview of technologies used across my projects/)
  assert.doesNotMatch(contact, /Have a project, internship, or interesting problem in mind/)
})
