import test, { beforeEach } from 'node:test'
import assert from 'node:assert/strict'
import { useOS } from '../src/store.js'
import { TOUR_STEPS } from '../src/recruiterTourSteps.js'
import { projects } from '../src/data.js'

globalThis.window = { innerWidth: 1440, innerHeight: 900 }
beforeEach(() => useOS.setState({
  windows: [], activeId: null, selectedProjectId: 'oscar',
  projectQuery: '', projectFilter: 'all', sound: false, recruiterTourStep: -1,
  projectNavigationRevision: 0,
}))

test('explicit project navigation clears stale search and filter, and reuses the window', () => {
  const state = useOS.getState()
  state.openProject('oscar')
  const id = useOS.getState().activeId
  const revision = useOS.getState().projectNavigationRevision
  state.setProjectQuery('KYC')
  state.setProjectFilter('Fintech')
  state.minimize(id)
  assert.equal(state.openProject('oscar'), true)
  const after = useOS.getState()
  assert.equal(after.selectedProjectId, 'oscar')
  assert.equal(after.projectQuery, '')
  assert.equal(after.projectFilter, 'all')
  assert.equal(after.activeId, id)
  assert.equal(after.projectNavigationRevision, revision + 1)
  assert.equal(after.windows.length, 1)
  assert.equal(after.windows[0].minimized, false)
})

test('each case study can be opened explicitly, regardless of prior search', () => {
  for (const project of projects) {
    const state = useOS.getState()
    state.setProjectQuery('no matches')
    state.setProjectFilter('Fintech')
    assert.equal(state.openProject(project.id), true)
    assert.equal(useOS.getState().selectedProjectId, project.id)
    assert.equal(useOS.getState().projectQuery, '')
    assert.equal(useOS.getState().projectFilter, 'all')
  }
})

test('normal window activation preserves search; directory shortcut clears it', () => {
  const state = useOS.getState()
  state.openProject('oscar')
  state.setProjectQuery('KYC')
  state.setProjectFilter('Fintech')
  state.openApp('projects')
  assert.equal(useOS.getState().projectQuery, 'KYC')
  assert.equal(useOS.getState().projectFilter, 'Fintech')
  state.openProjectDirectory()
  assert.equal(useOS.getState().projectQuery, '')
  assert.equal(useOS.getState().projectFilter, 'all')
})

test('unknown project IDs do not change navigation state', () => {
  const before = useOS.getState()
  assert.equal(before.openProject('invalid-id'), false)
  assert.equal(useOS.getState(), before)
})

test('closing Projects clears directory filters for the next session', () => {
  const state = useOS.getState()
  state.openProject('oscar')
  state.setProjectQuery('KYC')
  state.setProjectFilter('Fintech')
  state.close(useOS.getState().activeId)
  assert.equal(useOS.getState().projectQuery, '')
  assert.equal(useOS.getState().projectFilter, 'all')
})

test('tour progresses through every registered step then stays on the final step', () => {
  const state = useOS.getState()
  state.advanceRecruiterTour()
  assert.equal(useOS.getState().recruiterTourStep, -1)
  state.startRecruiterTour()
  assert.deepEqual(TOUR_STEPS.filter(step => step.appId).map(step => step.appId),
    ['projects', 'lab', 'copilot', 'skills', 'papers', 'resume', 'contact'])
  for (let index = 0; index < TOUR_STEPS.length; index++) {
    assert.equal(useOS.getState().recruiterTourStep, index)
    state.advanceRecruiterTour()
  }
  assert.equal(useOS.getState().recruiterTourStep, TOUR_STEPS.length - 1)
  state.endRecruiterTour()
  assert.equal(useOS.getState().recruiterTourStep, -1)
})
