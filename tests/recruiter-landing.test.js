import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { profile, projects, publications } from '../src/data.js'

const source = async (path) => readFile(new URL(path, import.meta.url), 'utf8')

test('public entry opens the retro OS first and brings up Recruiter Desk automatically', async () => {
  const app = await source('../src/App.jsx')
  assert.doesNotMatch(app, /RecruiterLanding/)
  assert.match(app, /hasSessionFlag\(SIGNED_IN_KEY\) \|\| hasSessionFlag\(BOOT_KEY\)/)
  assert.match(app, /openApp\('recruiter'\)/)
  assert.match(app, /A public portfolio should not make recruiters click through a fake sign-in/)
  assert.match(app, /<Taskbar \/>/)
  const welcome = await source('../src/apps/QuickView.jsx')
  assert.match(welcome, /90-sec tour/)
  assert.match(welcome, /Recruiter Desk/)
  assert.match(welcome, /Projects/)
  assert.match(welcome, /Resume/)
  assert.match(welcome, /Contact/)
})

test('recruiter landing provides direct navigation, keyboard command palette, and optional OS launch', async () => {
  const landing = await source('../src/RecruiterLanding.jsx')
  assert.match(landing, /event\.ctrlKey \|\| event\.metaKey/)
  assert.match(landing, /quick navigation command palette/)
  assert.match(landing, /Launch SMMSA-OS/)
  assert.match(landing, /Open resume PDF/)
  assert.match(landing, /Go to \$\{section\.label\}/)
})

test('recruiter cards cover three featured projects and preserve remaining project details', async () => {
  const landing = await source('../src/RecruiterLanding.jsx')
  assert.match(landing, /const FEATURED_IDS = \['oscar', 'tradeassist', 'toll-system'\]/)
  assert.match(landing, /additionalProjects\.map/)
  assert.match(landing, /What I built \/ explored/)
  assert.match(landing, /Scope & limitations/)
  assert.match(landing, /selectedProject\.implementationCaveats/)
  assert.equal(projects.length, 5)
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
  assert.match(taskbar, /Open Recruiter Desk inside SMMSA-OS/)
  assert.match(taskbar, /openApp\('recruiter'\)/)
  const menu = await source('../src/components/StartMenu.jsx')
  assert.match(menu, /start-recruiter-shortcut/)
  assert.match(menu, /openApp\('recruiter'\)/)
  const meta = await source('../src/appMeta.js')
  assert.match(meta, /export const appMeta = \{\n {2}recruiter: \{ title: 'Recruiter Desk'/)
  assert.match(meta, /title: 'Welcome to SMMSA-OS', label: 'Welcome'/)
  const pins = await source('../src/pinStore.js')
  assert.match(pins, /'recruiter', 'projects', 'resume'/)
})

test('Recruiter Desk surfaces resume, featured projects, concise proof points and in-OS shortcuts', async () => {
  const desk = await source('../src/apps/RecruiterDesk.jsx')
  assert.match(desk, /RECRUITER DESK/)
  assert.match(desk, /30 SEC/)
  assert.match(desk, /Open resume PDF/)
  assert.match(desk, /mailto:\$\{profile\.email\}/)
  assert.match(desk, /const FEATURED_IDS = \['oscar', 'toll-system', 'tradeassist'\]/)
  assert.match(desk, /openProject\(project\.id\)/)
  assert.match(desk, /startRecruiterTour/)
  assert.match(desk, /openApp\('skills'\)/)
  assert.match(desk, /openApp\('papers'\)/)
  const registry = await source('../src/apps/registry.js')
  assert.match(registry, /recruiter: RecruiterDesk/)
})

test('recruiter stylesheet includes responsive navigation, mobile cards, focus, and reduced motion', async () => {
  const css = await source('../src/recruiter.css')
  assert.match(css, /@media \(max-width: 820px\)/)
  assert.match(css, /@media \(max-width: 560px\)/)
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
  assert.match(desk, /30 SEC/)
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
