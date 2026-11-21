import { education, experience, highlights, profile, projects, publications, skills } from '../data'
import { useOS } from '../store'

const FEATURED_IDS = ['oscar', 'research-agent', 'tradeassist']
const SKILL_GROUPS = ['Agentic AI and LLM engineering', 'Backend and data', 'Automation and computer use']

export default function RecruiterDesk() {
  const openApp = useOS((state) => state.openApp)
  const setSelectedProject = useOS((state) => state.setSelectedProject)
  const startRecruiterTour = useOS((state) => state.startRecruiterTour)
  const featuredProjects = FEATURED_IDS.map((id) => projects.find((project) => project.id === id)).filter(Boolean)
  const currentRole = experience[0]

  const openProject = (projectId) => {
    setSelectedProject(projectId)
    openApp('projects')
  }

  return (
    <main className="recruiter-desk-app">
      <header className="recruiter-desk-topbar">
        <span className="recruiter-desk-mark" aria-hidden="true">AN</span>
        <div className="recruiter-desk-topcopy">
          <strong>ENGINEERING DASHBOARD</strong>
          <span>SMMSA-OS / Portfolio workspace</span>
        </div>
        <span className="recruiter-desk-time">● AVAILABLE · REMOTE / MUMBAI</span>
      </header>

      <section className="recruiter-desk-hero">
        <div className="recruiter-desk-identity">
          <div className="recruiter-desk-monogram" aria-hidden="true">AN</div>
          <div>
            <p className="recruiter-desk-eyebrow">AGENTIC AI · PYTHON ENGINEERING</p>
            <h1>{profile.name}</h1>
            <p className="recruiter-desk-role">{profile.role}</p>
            <p className="recruiter-desk-summary">I build AI agents that act, verify, and recover — with typed tools, policy controls and reliable Python backends.</p>
          </div>
        </div>
        <div className="recruiter-desk-actions">
          <a className="recruiter-desk-action is-primary" href={profile.resume} target="_blank" rel="noopener noreferrer">Open resume PDF <span aria-hidden="true">↗</span></a>
          <a className="recruiter-desk-action" href={`mailto:${profile.email}`}>Email Andrew <span aria-hidden="true">↗</span></a>
          <button className="recruiter-desk-action" type="button" onClick={startRecruiterTour}>90-sec tour <span aria-hidden="true">→</span></button>
        </div>
      </section>

      <section className="recruiter-desk-proof" aria-label="Quick facts">
        <div><span className="recruiter-desk-proof-label">OSCAR 3.0</span><strong>{projects.find(project => project.id === 'oscar')?.verification?.value}</strong><small>Recorded tests passed</small></div>
        <div><span className="recruiter-desk-proof-label">TRADEASSIST 2.0</span><strong>{projects.find(project => project.id === 'tradeassist')?.verification?.value}</strong><small>Recorded tests passed</small></div>
        <div><span className="recruiter-desk-proof-label">RESEARCH</span><strong>{publications.length}</strong><small>Published papers</small></div>
        <div><span className="recruiter-desk-proof-label">FREELANCE</span><strong>2 × 5★</strong><small>Upwork client reviews</small></div>
      </section>

      <section className="dashboard-action-grid" aria-label="Interactive engineering applications">
        <button type="button" onClick={() => openApp('lab')}><span className="dashboard-action-icon" aria-hidden="true">⌘</span><span><small>LIVE SIMULATION</small><strong>Agent Execution Lab</strong><em>Inspect policy decisions and execution traces.</em></span><b aria-hidden="true">↗</b></button>
        <button type="button" onClick={() => openApp('copilot')}><span className="dashboard-action-icon" aria-hidden="true">✦</span><span><small>LOCAL-FIRST ASSISTANT</small><strong>Recruiter Copilot</strong><em>Ask technical questions or compare a job description.</em></span><b aria-hidden="true">↗</b></button>
      </section>

      <section className="recruiter-desk-section">
        <div className="recruiter-desk-section-heading">
          <div><p className="recruiter-desk-eyebrow">SELECTED WORK</p><h2>Selected projects</h2></div>
          <button type="button" onClick={() => openApp('projects')}>All projects <span aria-hidden="true">↗</span></button>
        </div>
        <div className="recruiter-desk-project-grid">
          {featuredProjects.map((project, index) => (
            <button type="button" className={`recruiter-desk-project recruiter-desk-project-${index + 1}`} key={project.id} onClick={() => openProject(project.id)}>
              <span className="recruiter-desk-project-meta">0{index + 1} / {project.kind}</span>
              <strong>{project.name}</strong>
              <span className="recruiter-desk-project-summary">{project.summary}</span>
              <span className="recruiter-desk-tags">{project.tags.slice(0, 3).join(' · ')}</span>
              <span className="recruiter-desk-open">Open case study <span aria-hidden="true">↗</span></span>
            </button>
          ))}
        </div>
      </section>

      <section className="recruiter-desk-lower-grid">
        <div className="recruiter-desk-panel">
          <div className="recruiter-desk-section-heading compact"><div><p className="recruiter-desk-eyebrow">TECHNICAL TOOLBOX</p><h2>Core areas</h2></div><button type="button" onClick={() => openApp('skills')}>All skills ↗</button></div>
          <div className="recruiter-desk-skill-groups">
            {SKILL_GROUPS.map((group) => (
              <div key={group}>
                <strong>{group}</strong>
                <p>{(skills[group] ?? []).slice(0, 5).join(' · ')}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="recruiter-desk-panel recruiter-desk-highlights">
          <div className="recruiter-desk-section-heading compact"><div><p className="recruiter-desk-eyebrow">HIGHLIGHTS</p><h2>Other work</h2></div></div>
          <ul>{highlights.slice(0, 4).map((highlight) => <li key={highlight}>{highlight}</li>)}</ul>
          <div className="recruiter-desk-link-row">
            <button type="button" onClick={() => openApp('papers')}>Publications ↗</button>
            <button type="button" onClick={() => openApp('about')}>Background ↗</button>
            <button type="button" onClick={() => openApp('assistant')}>Ask My Portfolio ↗</button>
          </div>
        </div>
      </section>

      <section className="dashboard-background"><div><p className="recruiter-desk-eyebrow">ENGINEERING EXPERIENCE</p><strong>{currentRole.role} · {currentRole.org}</strong><small>{currentRole.when}</small><p>{currentRole.points[0]}</p></div><div><p className="recruiter-desk-eyebrow">EDUCATION</p><strong>{education.degree}</strong><small>{education.school} · {education.when}</small><p>CGPA {education.cgpa}</p></div></section>

      <footer className="recruiter-desk-footer">
        <div className="recruiter-desk-socials">
          <a href={profile.github} target="_blank" rel="noopener noreferrer">GitHub ↗</a>
          {profile.linkedin && <a href={profile.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn ↗</a>}
          <a href={`mailto:${profile.email}`}>Email ↗</a>
        </div>
      </footer>
    </main>
  )
}
