import { useMemo, useState } from 'react'
import { projects, publications } from '../data'
import { useOS } from '../store'

const FILTERS = [
  { label: 'All work', value: 'all' },
  { label: 'AI & agents', value: 'AI agents' },
  { label: 'Quant / risk', value: 'Quant research' },
  { label: 'Fintech', value: 'Fintech' },
  { label: 'Vision', value: 'Computer vision' },
  { label: 'Security / IoT', value: 'Security / IoT' },
]

function projectMatchesFilter(project, filter) {
  if (filter === 'all') return true
  if (filter === 'Security / IoT') {
    const facets = [...project.tags, ...project.stack].join(' ').toLowerCase()
    return /security|\biot\b|esp32|rfid|bluetooth|\bnfc\b|\bjwt\b/.test(facets)
  }
  if (filter === 'AI agents') return project.tags.some((tag) => ['AI agents', 'Automation'].includes(tag))
  if (filter === 'Computer vision') return project.tags.some((tag) => ['Computer vision', 'Vision'].includes(tag))
  if (filter === 'Quant research') return project.tags.some((tag) => ['Quant research', 'Risk'].includes(tag))
  return project.tags.includes(filter)
}

export default function Projects() {
  const selectedProjectId = useOS((state) => state.selectedProjectId)
  const setSelectedProject = useOS((state) => state.setSelectedProject)
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('all')

  const filteredProjects = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return projects.filter((project) => {
      const searchable = [project.name, project.kind, project.summary, ...project.tags, ...project.stack, ...project.points].join(' ').toLowerCase()
      return projectMatchesFilter(project, filter) && (!needle || searchable.includes(needle))
    })
  }, [filter, query])
  const selectedProject = filteredProjects.find((project) => project.id === selectedProjectId) ?? filteredProjects[0]
  const relatedPapers = selectedProject?.paperIds?.map((id) => publications.find((paper) => paper.id === id)).filter(Boolean) ?? []

  const chooseFilter = (value) => {
    setFilter(value)
    const firstMatch = projects.find((project) => projectMatchesFilter(project, value))
    if (firstMatch) setSelectedProject(firstMatch.id)
  }

  return (
    <section className="projects-app">
      <header className="projects-toolbar">
        <div>
          <p className="portfolio-kicker">PROJECT DIRECTORY</p>
          <h2>Selected work</h2>
          <p>{projects.length} case studies · engineering, experimentation, and prototypes</p>
        </div>
        <label className="projects-search">
          <span aria-hidden="true">⌕</span>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Find a project or tool…" aria-label="Search projects" />
          {query && <button type="button" onClick={() => setQuery('')} aria-label="Clear project search">×</button>}
        </label>
      </header>

      <div className="projects-filters" role="group" aria-label="Filter projects">
        {FILTERS.map((item) => (
          <button key={item.value} type="button" className={filter === item.value ? 'active' : ''} onClick={() => chooseFilter(item.value)} aria-pressed={filter === item.value}>
            {item.label}
          </button>
        ))}
      </div>

      <div className="projects-workspace">
        <aside className="projects-sidebar">
          <div className="projects-list-heading"><span>PROJECTS</span><small role="status" aria-live="polite" aria-atomic="true">{filteredProjects.length} found</small></div>
          {filteredProjects.length ? (
            <div className="projects-list">
              {filteredProjects.map((project, index) => (
                <button key={project.id} type="button" className={`projects-list-item${selectedProject?.id === project.id ? ' selected' : ''}`} onClick={() => setSelectedProject(project.id)} aria-pressed={selectedProject?.id === project.id}>
                  <span className="projects-list-number">{String(index + 1).padStart(2, '0')}</span>
                  <span className="projects-list-copy"><strong>{project.name}</strong><small>{project.kind}</small></span>
                  <span className="projects-list-chevron" aria-hidden="true">›</span>
                </button>
              ))}
            </div>
          ) : <p className="projects-no-results">No matching projects.</p>}
        </aside>

        {selectedProject ? (
          <article className="project-detail">
            <div className="project-detail-topline"><span>CASE STUDY / {selectedProject.id.toUpperCase()}</span><span>{selectedProject.kind}</span></div>
            <h2>{selectedProject.name}</h2>
            <p className="project-detail-summary">{selectedProject.summary}</p>
            <div className="chips project-tags">
              {selectedProject.tags.map((tag) => <span key={tag} className="chip alt">{tag}</span>)}
            </div>
            {selectedProject.workflow?.length > 0 && (
              <section className="project-detail-section" aria-labelledby={`workflow-${selectedProject.id}`}>
                <h3 id={`workflow-${selectedProject.id}`}>High-level workflow</h3>
                <ol className="project-workflow">
                  {selectedProject.workflow.map((step, index) => (
                    <li className="project-workflow-step" key={`${selectedProject.id}-${step.title}`}>
                      <span className="project-workflow-number" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
                      <div>
                        <strong>{step.title}</strong>
                        <p>{step.detail}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </section>
            )}
            {selectedProject.diagrams?.length > 0 && (
              <section className="project-detail-section project-architecture-section" aria-labelledby={`architecture-${selectedProject.id}`}>
                <h3 id={`architecture-${selectedProject.id}`}>Architecture &amp; system diagrams</h3>
                <p className="project-diagram-intro">High-level architecture based on available reports and source links; not a production deployment diagram.</p>
                <div className="project-architecture-list">
                  {selectedProject.diagrams.map((diagram) => {
                    const sourcePaper = publications.find((paper) => paper.id === diagram.sourcePaperId)
                    return (
                      <figure className="project-architecture" key={diagram.src}>
                        <h4>{diagram.title}</h4>
                        <div className="project-architecture-viewport" role="region" aria-label={`${diagram.title} diagram`} tabIndex={0}>
                          <img src={diagram.src} alt={`${selectedProject.name}: ${diagram.title}. ${diagram.caption}`} loading="lazy" decoding="async" />
                        </div>
                        <p className="project-diagram-scroll-hint" aria-hidden="true">Swipe to view diagram →</p>
                        <figcaption>
                          <span>{diagram.caption}</span>
                          {diagram.sourceLabel && <small className="project-diagram-source">Source basis: {diagram.sourceLabel}</small>}
                          {sourcePaper && <a href={sourcePaper.href} target="_blank" rel="noopener noreferrer">Read source paper ↗</a>}
                          {diagram.sourceUrl && <a href={diagram.sourceUrl} target="_blank" rel="noopener noreferrer">{diagram.sourceLinkLabel ?? 'Inspect source'} ↗</a>}
                        </figcaption>
                      </figure>
                    )
                  })}
                </div>
              </section>
            )}
            {selectedProject.metrics?.length > 0 && (
              <section className="project-detail-section" aria-labelledby={`metrics-${selectedProject.id}`}>
                <h3 id={`metrics-${selectedProject.id}`}>{selectedProject.metricsLabel ?? 'Recorded results'}</h3>
                <dl className="project-metrics-grid">
                  {selectedProject.metrics.map((metric) => (
                    <div className="project-metric" key={metric.label}>
                      <dt>{metric.label}</dt>
                      <dd>{metric.value}</dd>
                    </div>
                  ))}
                </dl>
                {selectedProject.metricsNote && <p className="project-metrics-note">{selectedProject.metricsNote}</p>}
              </section>
            )}
            <section className="project-detail-section">
              <h3>What I built</h3>
              <ul className="plain project-points">
                {selectedProject.points.map((point) => <li key={point}>{point}</li>)}
              </ul>
            </section>
            <section className="project-detail-section">
              <h3>Technology</h3>
              <div className="chips project-stack">
                {selectedProject.stack.map((tool) => <span key={tool} className="chip">{tool}</span>)}
              </div>
            </section>
            {relatedPapers.length > 0 && (
              <section className="project-detail-section project-related-papers">
                <h3>Related publication{relatedPapers.length > 1 ? 's' : ''}</h3>
                <div className="project-paper-links">
                  {relatedPapers.map((paper) => (
                    <a href={paper.href} target="_blank" rel="noopener noreferrer" key={paper.id}>{paper.title} <span aria-hidden="true">↗</span></a>
                  ))}
                </div>
              </section>
            )}
            {selectedProject.scopeNote && (
              <section className="project-scope-note" aria-label="Project scope and limitations">
                <strong>Scope & caveats</strong>
                <p>{selectedProject.scopeNote}</p>
              </section>
            )}
            <footer className="project-detail-footer">
              <div>
                <strong>{selectedProject.repo || selectedProject.demo ? 'Explore the project' : 'Project notes'}</strong>
                {!(selectedProject.repo || selectedProject.demo) && <p>No public repository or demo yet.</p>}
              </div>
              <div className="links">
                {selectedProject.repo && <a href={selectedProject.repo} target="_blank" rel="noopener noreferrer">View code ↗</a>}
                {selectedProject.demo && <a href={selectedProject.demo} target="_blank" rel="noopener noreferrer">Live demo ↗</a>}
              </div>
            </footer>
          </article>
        ) : (
          <div className="project-detail project-empty-detail"><h2>No matching projects</h2></div>
        )}
      </div>
      <p className="projects-footnote">Prototypes and backtests are labeled as such.</p>
    </section>
  )
}
