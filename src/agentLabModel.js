// A deterministic, browser-only illustration of an agent admission workflow.
// These scenarios never invoke a real tool, OS API, or language model.
export const scenarios = {
  inventory: { label: 'Read-only process inventory', action: 'process.inventory', risk: 'Sensitive read', requiresApproval: true, allowed: true },
  launch: { label: 'Launch allowlisted application', action: 'application.launch', risk: 'State change', requiresApproval: true, allowed: true },
  denied: { label: 'Run an unauthorized shell command', action: 'shell.execute', risk: 'Unrestricted execution', requiresApproval: false, allowed: false },
  stale: { label: 'Attempt to reuse a stale approval', action: 'application.launch', risk: 'State change', requiresApproval: true, allowed: true, stale: true },
}

const entry = (stage, status, detail) => ({ stage, status, detail })

export function startTrace(id) {
  const scenario = scenarios[id]
  if (!scenario) throw new Error('Unknown simulation scenario')
  const events = [entry('Plan', 'pass', `Resolved illustrative action: ${scenario.action}`), entry('Contract', 'pass', 'Typed payload validated and bound to the action.'), entry('Risk', 'pass', scenario.risk)]
  if (!scenario.allowed) return { id, phase: 'blocked', events: [...events, entry('Policy', 'block', 'No matching permission grant. Dispatch prohibited.')] }
  return { id, phase: 'approval', events: [...events, entry('Policy', 'pass', 'Capability and grant matched.'), entry('Approval', 'waiting', 'Exact-action approval required before dispatch.')] }
}

export function resolveTrace(trace, decision) {
  if (trace.phase !== 'approval' || !['approve', 'reject'].includes(decision)) return trace
  const scenario = scenarios[trace.id]
  const events = trace.events.slice(0, -1)
  if (decision === 'reject') return { ...trace, phase: 'blocked', events: [...events, entry('Approval', 'block', 'User rejected the exact action. No dispatch.')] }
  if (scenario.stale) return { ...trace, phase: 'blocked', events: [...events, entry('Approval', 'pass', 'Approval received for original action.'), entry('Admission', 'block', 'Freshness check failed; authorization is stale. No dispatch.')] }
  return { ...trace, phase: 'complete', events: [...events, entry('Approval', 'pass', 'Exact action approved.'), entry('Admission', 'pass', 'Fresh state and authorization bindings matched.'), entry('Dispatch', 'pass', 'One simulated tool execution.'), entry('Verification', 'pass', 'Illustrative outcome matched the success condition.')] }
}
