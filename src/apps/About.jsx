import { profile, highlights, education } from '../data'
import { useOS } from '../store'

export default function About() {
  const openApp = useOS((s) => s.openApp)

  return (
    <article className="about-app doc">
      <p className="portfolio-kicker">ABOUT ANDREW</p>
      <h2>Hi, I&apos;m {profile.name}.</h2>
      <p className="lead">{profile.tagline}</p>
      <div className="about-intro-card">
        <span className="about-monogram">AN</span>
        <div>
          <strong>{profile.role}</strong>
          <span>{education.school} · Class of {profile.grad}</span>
        </div>
      </div>
      {profile.bio.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
      <h3>Highlights</h3>
      <ul className="plain about-highlights">{highlights.map((highlight) => <li key={highlight}>{highlight}</li>)}</ul>
      <div className="about-actions">
        <button type="button" className="portfolio-btn primary" onClick={() => openApp('projects')}>Explore my work ↗</button>
        <button type="button" className="portfolio-btn" onClick={() => openApp('skills')}>Skills & tools</button>
        <button type="button" className="portfolio-btn" onClick={() => openApp('contact')}>Contact</button>
      </div>
    </article>
  )
}