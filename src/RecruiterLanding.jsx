import { useEffect, useMemo, useState } from 'react'
import { education, experience, highlights, profile, projects, publications, skills } from './data'
import { useOS } from './store'
import './recruiter.css'

const FEATURED_IDS = ['oscar', 'tradeassist', 'toll-system']
const featuredNotes = {
  oscar: { eyebrow: 'FLAGSHIP · AI AUTOMATION', proof: 'Browser, desktop UI and terminal agents', action: 'Explore automation case study' },
  tradeassist: { eyebrow: 'QUANT RESEARCH', proof: 'Recorded 86-trade historical backtest', action: 'Explore research case study' },
  'toll-system': { eyebrow: 'COMPETITION WINNER', proof: 'YOLOv8 + OCR/ANPR + RFID prototype', action: 'Explore vision case study' },
  finverse: { eyebrow: 'FINAL-YEAR PROJECT', proof: 'Web, backend, mobile and IoT prototype', action: 'Explore FinVerse case study' },
  'kyc-smartcard': { eyebrow: 'IOT + RESEARCH', proof: 'RFID and Bluetooth LE authentication designs', action: 'Explore KYC case study' },
}

const sections = [
  { id: 'top', label: 'Overview', keywords: 'home intro about Andrew' },
  { id: 'work', label: 'Selected work', keywords: 'projects case studies OSCAR TradeAssist FinVerse toll KYC' },
  { id: 'experience', label: 'Experience', keywords: 'internship Upwork education college CGPA' },
  { id: 'skills', label: 'Skills', keywords: 'tools stack Python Django React LangChain' },
  { id: 'research', label: 'Research', keywords: 'papers publications IJIRT' },
  { id: 'contact', label: 'Contact', keywords: 'email LinkedIn GitHub reach out' },
]

function externalProps() {
  return { target: '_blank', rel: 'noopener noreferrer' }
}

function getProjectHighlights(project) {
  const note = featuredNotes[project.id]
  if (note) return note
  return { eyebrow: project.kind.toUpperCase(), proof: project.tags.join(' · '), action: `Explore ${project.name} case study` }
}

export default function RecruiterLanding({ onLaunchDesktop }) {
  const setSelectedProject = useOS((state) => state.setSelectedProject)
  const [caseStudyId, setCaseStudyId] = useState(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [commandOpen, setCommandOpen] = useState(false)
  const [commandQuery, setCommandQuery] = useState('')
  const [commandIndex, setCommandIndex] = useState(0)

  const featuredProjects = FEATURED_IDS.map((id) => projects.find((project) => project.id === id)).filter(Boolean)
  const additionalProjects = projects.filter((project) => !FEATURED_IDS.includes(project.id))
  const selectedProject = projects.find((project) => project.id === caseStudyId) ?? null
  const projectPapers = selectedProject?.paperIds?.map((id) => publications.find((paper) => paper.id === id)).filter(Boolean) ?? []

  const commands = useMemo(() => [
    ...sections.map((section) => ({ id: `section-${section.id}`, title: `Go to ${section.label}`, detail: section.keywords, kind: 'section', value: section.id })),
    { id: 'resume', title: 'Open resume PDF', detail: 'CV resume download', kind: 'resume' },
    { id: 'desktop', title: 'Launch the retro desktop', detail: 'SMMSA-OS interactive experience games desktop', kind: 'desktop' },
    ...projects.map((project) => ({ id: `project-${project.id}`, title: `Open ${project.name} case study`, detail: `${project.summary} ${project.tags.join(' ')}`, kind: 'project', value: project.id })),
  ], [])

  const filteredCommands = useMemo(() => {
    const query = commandQuery.trim().toLowerCase()
    if (!query) return commands
    return commands.filter((command) => `${command.title} ${command.detail}`.toLowerCase().includes(query))
  }, [commandQuery, commands])

  useEffect(() => {
    const handleShortcut = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        const target = event.target
        if (target instanceof HTMLElement && target.isContentEditable) return
        event.preventDefault()
        setCommandOpen(true)
        setCommandQuery('')
        setCommandIndex(0)
      }
    }
    window.addEventListener('keydown', handleShortcut)
    return () => window.removeEventListener('keydown', handleShortcut)
  }, [])

  useEffect(() => {
    if (commandOpen) window.requestAnimationFrame(() => document.querySelector('.recruiter-command-search input')?.focus())
  }, [commandOpen])

  useEffect(() => {
    if (!selectedProject && !commandOpen) return undefined
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setCaseStudyId(null)
        setCommandOpen(false)
        setMobileMenuOpen(false)
      }
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [selectedProject, commandOpen])

  const safeCommandIndex = Math.min(commandIndex, Math.max(0, filteredCommands.length - 1))

  const goToSection = (id) => {
    setMobileMenuOpen(false)
    setCommandOpen(false)
    document.getElementById(id)?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' })
  }

  const openProject = (id) => {
    setSelectedProject(id)
    setCaseStudyId(id)
    setCommandOpen(false)
    setMobileMenuOpen(false)
  }

  const runCommand = (command) => {
    if (!command) return
    if (command.kind === 'section') goToSection(command.value)
    else if (command.kind === 'resume') {
      setCommandOpen(false)
      window.open(profile.resume, '_blank', 'noopener,noreferrer')
    } else if (command.kind === 'desktop') {
      setCommandOpen(false)
      onLaunchDesktop()
    } else if (command.kind === 'project') openProject(command.value)
  }

  const onCommandKeyDown = (event) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setCommandIndex((index) => Math.min(index + 1, Math.max(0, filteredCommands.length - 1)))
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setCommandIndex((index) => Math.max(index - 1, 0))
    } else if (event.key === 'Enter') {
      event.preventDefault()
      runCommand(filteredCommands[safeCommandIndex])
    } else if (event.key === 'Escape') {
      event.preventDefault()
      setCommandOpen(false)
    }
  }

  return (
    <main className="recruiter-shell">
      <a className="recruiter-skip-link" href="#main-content">Skip to main content</a>
      <header className="recruiter-header">
        <a className="recruiter-brand" href="#top" onClick={(event) => { event.preventDefault(); goToSection('top') }} aria-label="Andrew Neil — back to overview">
          <span className="recruiter-brand-mark">AN</span>
          <span className="recruiter-brand-name">Andrew Neil<small>DEVELOPER PORTFOLIO</small></span>
        </a>
        <nav className={`recruiter-nav${mobileMenuOpen ? ' is-open' : ''}`} aria-label="Main navigation">
          {sections.slice(1).map((section) => (
            <a key={section.id} href={`#${section.id}`} onClick={() => setMobileMenuOpen(false)}>{section.label}</a>
          ))}
        </nav>
        <div className="recruiter-header-actions">
          <button type="button" className="recruiter-command-trigger" onClick={() => { setCommandOpen(true); setCommandQuery(''); setCommandIndex(0) }} aria-label="Open quick navigation command palette">
            <span aria-hidden="true">⌕</span><span>Quick nav</span><kbd>Ctrl K</kbd>
          </button>
          <a className="recruiter-header-resume" href={profile.resume} target="_blank" rel="noopener noreferrer">Resume <span aria-hidden="true">↗</span></a>
        </div>
        <button type="button" className="recruiter-mobile-menu" onClick={() => setMobileMenuOpen((open) => !open)} aria-expanded={mobileMenuOpen} aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}>
          {mobileMenuOpen ? '×' : '☰'}
        </button>
      </header>

      <div id="main-content" className="recruiter-content">
        <section className="recruiter-hero" id="top" aria-labelledby="hero-heading">
          <div className="recruiter-hero-copy">
            <p className="recruiter-eyebrow"><span className="recruiter-online-dot" /> COMPUTER ENGINEERING · XIE MUMBAI · CLASS OF {profile.grad}</p>
            <h1 id="hero-heading">I build tools that do more than look good in a demo.</h1>
            <p className="recruiter-hero-lead">Hey, I&apos;m <strong>{profile.name}</strong> — a computer engineering student and backend intern in Mumbai. I work on AI-assisted automation, Python backends, and practical prototypes that connect software with real workflows.</p>
            <div className="recruiter-hero-actions">
              <a className="recruiter-button recruiter-button-primary" href="#work" onClick={(event) => { event.preventDefault(); goToSection('work') }}>See selected work <span aria-hidden="true">↓</span></a>
              <a className="recruiter-button recruiter-button-light" href={profile.resume} target="_blank" rel="noopener noreferrer">Read resume <span aria-hidden="true">↗</span></a>
            </div>
            <div className="recruiter-focus-line"><span>FOCUS</span><p>Agentic AI · Workflow automation · Python backend engineering</p></div>
          </div>
          <aside className="recruiter-hero-card" aria-label="Current profile summary">
            <div className="recruiter-hero-card-top"><span className="recruiter-mono-mark">AN</span><span className="recruiter-card-status">OPEN TO OPPORTUNITIES</span></div>
            <p className="recruiter-card-label">CURRENT ROLE</p>
            <h2>{experience[0].role}</h2>
            <p className="recruiter-card-org">{experience[0].org} <span>·</span> {experience[0].when}</p>
            <div className="recruiter-card-divider" />
            <p className="recruiter-card-label">EDUCATION</p>
            <h3>{education.degree}</h3>
            <p className="recruiter-card-org">{education.school} · {education.when}</p>
            <div className="recruiter-card-links">
              <a href={profile.github} {...externalProps()}>GitHub <span>↗</span></a>
              <a href={profile.linkedin} {...externalProps()}>LinkedIn <span>↗</span></a>
              <a href={`mailto:${profile.email}`}>Email <span>↗</span></a>
            </div>
          </aside>
        </section>

        <section className="recruiter-proof-row" aria-label="Experience highlights">
          <div><strong>{projects.length.toString().padStart(2, '0')}</strong><span>PROJECTS DOCUMENTED</span></div>
          <div><strong>{publications.length.toString().padStart(2, '0')}</strong><span>IJIRT PAPERS</span></div>
          <div><strong>01</strong><span>BACKEND INTERNSHIP</span></div>
          <div><strong>02</strong><span>UPWORK 5-STAR REVIEWS</span></div>
        </section>

        <section className="recruiter-section" id="work" aria-labelledby="work-heading">
          <div className="recruiter-section-heading">
            <div><p className="recruiter-section-kicker">THE WORK</p><h2 id="work-heading">Selected projects</h2></div>
            <span className="recruiter-section-index">01 — 03</span>
          </div>
          <div className="recruiter-project-grid">
            {featuredProjects.map((project, index) => {
              const note = getProjectHighlights(project)
              return (
                <article className={`recruiter-project-card recruiter-project-card-${index + 1}`} key={project.id}>
                  <div className="recruiter-project-card-top"><span>{note.eyebrow}</span><span aria-hidden="true">0{index + 1}</span></div>
                  <h3>{project.name}</h3>
                  <p>{project.summary}</p>
                  <div className="recruiter-project-proof"><span className="recruiter-proof-marker" />{note.proof}</div>
                  <div className="recruiter-tag-row">{project.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
                  <button type="button" className="recruiter-card-action" onClick={() => openProject(project.id)}>{note.action} <span aria-hidden="true">↗</span></button>
                </article>
              )
            })}
          </div>
          <div className="recruiter-more-work">
            <div><p className="recruiter-section-kicker">ALSO EXPLORED</p><h3>More projects, different problem spaces.</h3></div>
            <div className="recruiter-more-list">
              {additionalProjects.map((project) => {
                const note = getProjectHighlights(project)
                return <button type="button" key={project.id} onClick={() => openProject(project.id)}><span><small>{note.eyebrow}</small><strong>{project.name}</strong><em>{project.summary}</em></span><b aria-hidden="true">↗</b></button>
              })}
            </div>
          </div>
        </section>

        <section className="recruiter-section recruiter-experience-section" id="experience" aria-labelledby="experience-heading">
          <div className="recruiter-section-heading">
            <div><p className="recruiter-section-kicker">BACKGROUND</p><h2 id="experience-heading">Experience & education</h2></div>
            <span className="recruiter-section-index">04 — 05</span>
          </div>
          <div className="recruiter-experience-layout">
            <div className="recruiter-timeline">
              {experience.map((item, index) => (
                <article className="recruiter-timeline-item" key={item.id}>
                  <div className="recruiter-timeline-marker"><span>0{index + 1}</span></div>
                  <div className="recruiter-timeline-body">
                    <div className="recruiter-timeline-meta"><span>{item.when}</span><span>{item.org}</span></div>
                    <h3>{item.role}</h3>
                    <ul>{item.points.slice(0, 3).map((point) => <li key={point}>{point}</li>)}</ul>
                    <div className="recruiter-tag-row">{item.tech.map((tool) => <span key={tool}>{tool}</span>)}</div>
                  </div>
                </article>
              ))}
            </div>
            <aside className="recruiter-education-card">
              <p className="recruiter-section-kicker">EDUCATION</p>
              <h3>{education.degree}</h3>
              <p>{education.school}</p>
              <div className="recruiter-education-stat"><strong>{education.cgpa}</strong><span>THROUGH SEMESTER VI</span></div>
              <div className="recruiter-card-divider" />
              <p className="recruiter-card-label">RELEVANT COURSEWORK</p>
              <p className="recruiter-coursework">{education.courses}</p>
              <div className="recruiter-card-divider" />
              <p className="recruiter-card-label">OTHER HIGHLIGHTS</p>
              <ul className="recruiter-highlight-list">{highlights.slice(2).map((highlight) => <li key={highlight}>{highlight}</li>)}</ul>
            </aside>
          </div>
        </section>

        <section className="recruiter-section" id="skills" aria-labelledby="skills-heading">
          <div className="recruiter-section-heading">
            <div><p className="recruiter-section-kicker">THE TOOLKIT</p><h2 id="skills-heading">Skills I use to build</h2></div>
            <span className="recruiter-section-index">06</span>
          </div>
          <div className="recruiter-skill-grid">
            {Object.entries(skills).map(([group, items], index) => (
              <article className={`recruiter-skill-card recruiter-skill-card-${index % 4 + 1}`} key={group}>
                <div className="recruiter-skill-card-top"><span>0{index + 1}</span><span>{String(items.length).padStart(2, '0')} TOOLS</span></div>
                <h3>{group}</h3>
                <div className="recruiter-tag-row">{items.map((item) => <span key={item}>{item}</span>)}</div>
              </article>
            ))}
          </div>
        </section>

        <section className="recruiter-section recruiter-research-section" id="research" aria-labelledby="research-heading">
          <div className="recruiter-section-heading">
            <div><p className="recruiter-section-kicker">RESEARCH & WRITING</p><h2 id="research-heading">Published work</h2></div>
            <span className="recruiter-section-index">07</span>
          </div>
          <div className="recruiter-publication-list">
            {publications.map((paper, index) => (
              <article className="recruiter-publication-row" key={paper.id}>
                <span className="recruiter-publication-number">0{index + 1}</span>
                <div className="recruiter-publication-copy"><h3>{paper.title}</h3><p>{paper.summary}</p><span>{paper.where}</span></div>
                <a href={paper.href} {...externalProps()} aria-label={`Read ${paper.title}`}>Read paper <span aria-hidden="true">↗</span></a>
              </article>
            ))}
          </div>
        </section>

        <section className="recruiter-contact-section" id="contact" aria-labelledby="contact-heading">
          <div className="recruiter-contact-copy"><p className="recruiter-section-kicker">NEXT STEP</p><h2 id="contact-heading">Have a role or problem in mind?</h2><a className="recruiter-button recruiter-button-contact" href={`mailto:${profile.email}`}>Email Andrew <span aria-hidden="true">↗</span></a></div>
          <div className="recruiter-contact-links"><a href={`mailto:${profile.email}`}> <span>Email</span><strong>{profile.email}</strong><b>↗</b></a><a href={profile.github} {...externalProps()}><span>GitHub</span><strong>github.com/{profile.handle}</strong><b>↗</b></a><a href={profile.linkedin} {...externalProps()}><span>LinkedIn</span><strong>Connect professionally</strong><b>↗</b></a><a href={profile.resume} target="_blank" rel="noopener noreferrer"><span>Resume</span><strong>Open PDF</strong><b>↗</b></a></div>
        </section>

        <footer className="recruiter-footer"><a href="#top" onClick={(event) => { event.preventDefault(); goToSection('top') }}>Andrew Neil</a><span>Mumbai, India · Computer Engineering · Class of {profile.grad}</span><button type="button" onClick={onLaunchDesktop}>Explore the retro desktop ↗</button></footer>
      </div>

      <button type="button" className="recruiter-floating-desktop" onClick={onLaunchDesktop}><span aria-hidden="true">▦</span><span>Launch SMMSA-OS</span></button>

      {commandOpen && (
        <div className="recruiter-overlay recruiter-command-overlay" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setCommandOpen(false) }}>
          <section className="recruiter-command-panel" role="dialog" aria-modal="true" aria-labelledby="command-title">
            <div className="recruiter-command-title"><div><span className="recruiter-command-glyph">⌘</span><div><h2 id="command-title">Go anywhere</h2><p></p></div></div><kbd>ESC</kbd></div>
            <label className="recruiter-command-search"><span aria-hidden="true">⌕</span><input value={commandQuery} onChange={(event) => { setCommandQuery(event.target.value); setCommandIndex(0) }} onKeyDown={onCommandKeyDown} placeholder="Search work, skills, resume…" aria-label="Search navigation commands" /><kbd>↵</kbd></label>
            <div className="recruiter-command-results" role="listbox" aria-label="Navigation commands">
              {filteredCommands.length ? filteredCommands.map((command, index) => <button type="button" role="option" aria-selected={safeCommandIndex === index} className={safeCommandIndex === index ? 'is-selected' : ''} key={command.id} onMouseEnter={() => setCommandIndex(index)} onClick={() => runCommand(command)}><span className="recruiter-command-result-icon">{command.kind === 'project' ? '↗' : command.kind === 'resume' ? 'PDF' : command.kind === 'desktop' ? '▦' : '→'}</span><span><strong>{command.title}</strong><small>{command.detail}</small></span><span className="recruiter-command-enter">↵</span></button>) : <p className="recruiter-command-empty">No matches. Try “OSCAR”, “resume” or “contact”.</p>}
            </div>
            <div className="recruiter-command-footer"><span><kbd>↑</kbd><kbd>↓</kbd> to navigate</span><span><kbd>ENTER</kbd> to open</span><span>ESC to close</span></div>
          </section>
        </div>
      )}

      {selectedProject && (
        <div className="recruiter-overlay recruiter-case-overlay" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setCaseStudyId(null) }}>
          <article className="recruiter-case-modal" role="dialog" aria-modal="true" aria-labelledby="case-study-title">
            <div className="recruiter-case-modal-header"><div><span>{getProjectHighlights(selectedProject).eyebrow}</span><p>PROJECT CASE STUDY</p></div><button type="button" onClick={() => setCaseStudyId(null)} aria-label="Close case study">×</button></div>
            <div className="recruiter-case-modal-content">
              <h2 id="case-study-title">{selectedProject.name}</h2>
              <p className="recruiter-case-summary">{selectedProject.summary}</p>
              <div className="recruiter-tag-row">{selectedProject.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
              {selectedProject.metrics?.length > 0 && <div className="recruiter-case-metrics">{selectedProject.metrics.map((metric) => <div key={metric.label}><strong>{metric.value}</strong><span>{metric.label}</span></div>)}</div>}
              {selectedProject.metricsNote && <p className="recruiter-case-note">{selectedProject.metricsNote}</p>}
              <h3>What I built / explored</h3>
              <ul className="recruiter-case-bullets">{selectedProject.points.map((point) => <li key={point}>{point}</li>)}</ul>
              {selectedProject.workflow?.length > 0 && <><h3>How it works</h3><ol className="recruiter-case-workflow">{selectedProject.workflow.map((step, index) => <li key={step.title}><span>0{index + 1}</span><div><strong>{step.title}</strong><p>{step.detail}</p></div></li>)}</ol></>}
              <h3>Technology</h3><div className="recruiter-tag-row recruiter-case-stack">{selectedProject.stack.map((tool) => <span key={tool}>{tool}</span>)}</div>
              {selectedProject.scopeNote && <div className="recruiter-scope-note"><strong>Scope & limitations</strong><p>{selectedProject.scopeNote}</p>{selectedProject.implementationCaveats?.length > 0 && <ul>{selectedProject.implementationCaveats.map((caveat) => <li key={caveat}>{caveat}</li>)}</ul>}</div>}
              {projectPapers.length > 0 && <><h3>Related publication{projectPapers.length > 1 ? 's' : ''}</h3><div className="recruiter-case-links">{projectPapers.map((paper) => <a href={paper.href} {...externalProps()} key={paper.id}>{paper.title} ↗</a>)}</div></>}
              <div className="recruiter-case-footer">{selectedProject.repo ? <a className="recruiter-button recruiter-button-primary" href={selectedProject.repo} {...externalProps()}>Inspect source code ↗</a> : <span className="recruiter-no-repo">No public code link.</span>}{selectedProject.demo && <a className="recruiter-button recruiter-button-light" href={selectedProject.demo} {...externalProps()}>Open demo ↗</a>}</div>
            </div>
          </article>
        </div>
      )}
    </main>
  )
}
