import test from 'node:test'
import assert from 'node:assert/strict'
import { scenarios, startTrace, resolveTrace } from '../src/agentLabModel.js'
import { capabilities, matchRole } from '../src/roleFit.js'
import { projects } from '../src/data.js'

test('all allowed lab scenarios require explicit approval before dispatch', () => {
  for (const id of ['inventory', 'launch', 'stale']) {
    const trace = startTrace(id)
    assert.equal(trace.phase, 'approval')
    assert.ok(!trace.events.some(event => event.stage === 'Dispatch'))
  }
})
test('valid approval causes exactly one simulated dispatch and outcome verification', () => {
  const original = startTrace('inventory')
  const approved = resolveTrace(original, 'approve')
  assert.equal(approved.phase, 'complete')
  assert.equal(approved.events.filter(event => event.stage === 'Dispatch').length, 1)
  assert.equal(approved.events.at(-1).stage, 'Verification')
  assert.equal(resolveTrace(approved, 'approve'), approved)
  assert.equal(original.phase, 'approval')
})
test('policy denial, rejected approval and stale approval cannot dispatch', () => {
  const traces = [startTrace('denied'), resolveTrace(startTrace('launch'), 'reject'), resolveTrace(startTrace('stale'), 'approve')]
  for (const trace of traces) {
    assert.equal(trace.phase, 'blocked')
    assert.ok(!trace.events.some(event => event.stage === 'Dispatch'))
    assert.equal(resolveTrace(trace, 'approve'), trace)
  }
})
test('unknown scenario and invalid decisions fail safely', () => {
  assert.throws(() => startTrace('unknown'))
  const trace = startTrace('launch')
  assert.equal(resolveTrace(trace, 'unexpected'), trace)
  assert.equal(Object.keys(scenarios).length, 4)
})
test('role mapping finds relevant evidence and explicit infrastructure gaps', () => {
  const matches = matchRole('Python, RAG, LangGraph, Playwright, Kubernetes, policy guardrails')
  assert.ok(matches.some(item => item.label === 'Python backend and APIs'))
  assert.ok(matches.some(item => item.label === 'Retrieval and LLM applications'))
  assert.ok(matches.some(item => item.label === 'Browser and computer-use automation'))
  assert.ok(matches.some(item => item.gap && item.label === 'Deployment and infrastructure'))
  assert.ok(matches.some(item => item.label === 'Reliability, evaluation and testing'))
})
test('role mapping uses whole terms and does not claim undocumented project links', () => {
  assert.deepEqual(matchRole(''), [])
  assert.deepEqual(matchRole('rawger unusual unrelated'), [])
  for (const item of capabilities) if (item.project) assert.ok(projects.some(project => project.id === item.project))
})
