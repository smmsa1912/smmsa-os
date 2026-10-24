import { profile, education, experience, projects, publications, skills } from '../data'
import { useOS } from '../store'

const getSkillCount = () => Object.values(skills).reduce((total, group) => total + group.length, 0)

export default function QuickView() {
  const openApp = useOS((s) => s.openApp)
  const startRecruiterTour = useOS((s) => s.startRecruiterTour)
  const setSelectedProject = useOS((s) => s.setSelectedProject)
  const featuredProjects = projects.slice(0, 3)
  const currentRole = experience[0]

  return (
    <div className="portfolio-home">
      <section className="portfolio-hero">
        <div className="portfolio-eyebrow"><span className="portfolio-status-dot" /> INTERACTIVE PORTFOLIO <span>SMMSA-OS / PORTFOLIO</span></div>
        <div className="portfolio-hero-layout">
          <div className="portfolio-hero-copy">
            <p className="portfolio-kicker">AI · AUTOMATION · BACKEND</p>
            <h1>Hey, I&apos;m <span>{profile.name}.</span></h1>
            <p className="portfolio-role">{profile.role} · Class of {profile.grad}</p>
            <p className="portfolio-tagline">{profile.tagline}</p>
            <div className="portfolio-actions">
              <button type="button" className="portfolio-btn primary" onClick={() => openApp('recruiter')}>Recruiter Desk <span aria-hidden="true">→</span></button>
              <button type="button" className="portfolio-btn" onClick={startRecruiterTour}>90-sec tour</button>
              <button type="button" className="portfolio-btn" onClick={() => openApp('projects')}>Projects <span aria-hidden="true">↗</span></button>
              <button type="button" className="portfolio-btn" onClick={() => openApp('resume')}>Resume</button>
              <button type="button" className="portfolio-btn quiet" onClick={() => openApp('contact')}>Contact</button>
              <button type="button" className="portfolio-btn ai-entry" onClick={() => openApp('assistant')}>Ask AI ✦</button>
            </div>
          </div>
          <aside className="portfolio-id-card" aria-label="Profile summary">
            <div className="portfolio-avatar">AN<span>●</span></div>
            <p className="portfolio-card-label">CURRENTLY</p>
            <strong>{currentRole.role}</strong>
            <span>{currentRole.org}</span>
            <div className="portfolio-card-rule" />
            <p className="portfolio-card-label">STUDYING</p>
            <strong>{education.degree}</strong>
            <span>{education.school}</span>
            <div className="portfolio-card-rule" />
            <div className="portfolio-socials">
              <a href={profile.github} target="_blank" rel="noopener noreferrer">GitHub ↗</a>
              {profile.linkedin && <a href={profile.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn ↗</a>}
            </div>
          </aside>
        </div>
      </section>


      <section className="portfolio-stats" aria-label="Portfolio at a glance">
        <div><strong>{projects.length.toString().padStart(2, '0')}</strong><span>PROJECTS</span></div>
        <div><strong>{publications.length.toString().padStart(2, '0')}</strong><span>PUBLICATIONS</span></div>
        <div><strong>{getSkillCount().toString().padStart(2, '0')}</strong><span>SKILLS & TOOLS</span></div>
        <div><strong>{String(education.when.match(/\d{4}/)?.[0] ?? profile.grad)}</strong><span>GRADUATION</span></div>
      </section>

      <section className="portfolio-work-section">
        <div className="portfolio-section-heading">
          <div><p className="portfolio-kicker">SELECTED WORK</p><h2>Things I&apos;ve been building.</h2></div>
          <button type="button" className="portfolio-text-button" onClick={() => openApp('projects')}>All projects ↗</button>
        </div>
        <div className="portfolio-project-grid">
          {featuredProjects.map((project, index) => (
            <button key={project.id} type="button" className={`portfolio-project-card project-accent-${index + 1}`} onClick={() => { setSelectedProject(project.id); openApp('projects') }}>
              <span className="portfolio-project-index">0{index + 1} / {project.kind}</span>
              <strong>{project.name}</strong>
              <span className="portfolio-project-summary">{project.summary}</span>
              <span className="portfolio-project-tags">{project.tags.slice(0, 2).join(' · ')}</span>
              <span className="portfolio-project-open">Case study <span aria-hidden="true">↗</span></span>
            </button>
          ))}
        </div>
      </section>

      <section className="portfolio-publication-strip">
        <div>
          <p className="portfolio-kicker">PUBLISHED RESEARCH</p>
          <strong>{publications[0]?.title}</strong>
          <span>{publications[0]?.where} · plus two KYC Smart Card papers</span>
        </div>
        <button type="button" className="portfolio-text-button" onClick={() => openApp('papers')}>Publications ↗</button>
      </section>

      <section className="portfolio-bottom-row">
        <div className="portfolio-bottom-card">
          <p className="portfolio-kicker">THE TOOLBOX</p>
          <h2>Skills & tools</h2>
          <button type="button" className="portfolio-text-button" onClick={() => openApp('skills')}>Skills ↗</button>
        </div>
        <div className="portfolio-bottom-card portfolio-contact-card">
          <p className="portfolio-kicker">HAVE SOMETHING IN MIND?</p>
          <h2>Contact</h2>
          <button type="button" className="portfolio-text-button" onClick={() => openApp('contact')}>Contact ↗</button>
        </div>
      </section>
      <footer className="portfolio-home-footer">
        <span>BUILT AS AN INTERACTIVE DESKTOP</span>
        <span>{profile.handle} · MUMBAI, INDIA</span>
      </footer>
    </div>
  )
}
