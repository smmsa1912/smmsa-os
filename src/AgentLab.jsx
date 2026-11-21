import { useState } from 'react'
import { resolveTrace, scenarios, startTrace } from './agentLabModel.js'

export default function AgentLab() {
  const [scenarioId, setScenarioId] = useState('inventory')
  const [trace, setTrace] = useState(null)
  const scenario = scenarios[scenarioId]
  const status = trace?.phase === 'complete' ? 'Verified' : trace?.phase === 'blocked' ? 'Blocked safely' : trace?.phase === 'approval' ? 'Approval needed' : 'Ready'

  return <section className="recruiter-section agent-lab" id="lab" aria-labelledby="lab-heading">
    <div className="recruiter-section-heading"><div><p className="recruiter-section-kicker">INTERACTIVE ENGINEERING DEMO</p><h2 id="lab-heading">Agent execution lab</h2></div><span className="recruiter-section-index">SIMULATION</span></div>
    <div className="lab-console">
      <div className="lab-controls">
        <div className="lab-label"><span className="lab-dot" /> OSCAR / POLICY CONSOLE</div>
        <h3>Can this agent act safely?</h3>
        <p>Choose a scenario and inspect how typed actions, permission checks and human approval affect admission.</p>
        <label htmlFor="lab-scenario">Scenario</label>
        <select id="lab-scenario" value={scenarioId} onChange={event => { setScenarioId(event.target.value); setTrace(null) }}>{Object.entries(scenarios).map(([id, item]) => <option key={id} value={id}>{item.label}</option>)}</select>
        <pre className="lab-payload">{JSON.stringify({ action: scenario.action, risk: scenario.risk, mode: 'simulation' }, null, 2)}</pre>
        <button type="button" className="lab-run" onClick={() => setTrace(startTrace(scenarioId))}>{trace ? 'Restart simulation' : 'Run simulation'} <span aria-hidden="true">▶</span></button>
        {trace?.phase === 'approval' && <div className="lab-decisions"><button type="button" onClick={() => setTrace(current => resolveTrace(current, 'approve'))}>Approve exact action</button><button type="button" onClick={() => setTrace(current => resolveTrace(current, 'reject'))}>Reject</button></div>}
      </div>
      <div className="lab-output" aria-live="polite">
        <div className="lab-output-head"><span>EXECUTION TRACE</span><strong data-status={trace?.phase || 'idle'}>{status}</strong></div>
        {trace ? <ol>{trace.events.map(event => <li key={event.stage} data-status={event.status}><span className="lab-event-icon" aria-hidden="true">{event.status === 'pass' ? '✓' : event.status === 'block' ? '×' : '…'}</span><div><strong>{event.stage}</strong><p>{event.detail}</p></div></li>)}</ol> : <div className="lab-idle"><span aria-hidden="true">◎</span><p>Run a scenario to see the decision path.</p></div>}
      </div>
    </div>
    <p className="lab-disclaimer">Illustrative policy simulation inspired by OSCAR’s architecture. It does not execute real tools or assert that every scenario is implemented in the current OSCAR 3.0 release.</p>
  </section>
}
