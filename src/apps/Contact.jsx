import { profile } from '../data'

export default function Contact() {
  const rows = [
    { label: 'Email', text: profile.email, href: `mailto:${profile.email}`, note: 'Best for opportunities and collaboration' },
    { label: 'GitHub', text: `github.com/${profile.handle}`, href: profile.github, note: 'Code and engineering projects' },
    profile.linkedin && { label: 'LinkedIn', text: 'Connect professionally', href: profile.linkedin, note: 'Professional profile' },
  ].filter(Boolean)

  return (
    <article className="contact-app doc">
      <p className="portfolio-kicker">CONTACT / OPEN CHANNEL</p>
      <h2>Let&apos;s talk.</h2>
      <p className="lead">Have a project, internship, or interesting problem in mind?</p>
      <p>I&apos;m interested in agentic AI, automation, backend engineering, and building software that solves real problems. Email is the most direct way to reach me.</p>
      <div className="contact-cards">
        {rows.map((row, index) => (
          <a key={row.label} className={`contact-card contact-card-${index + 1}`} href={row.href} target={row.label === 'Email' ? undefined : '_blank'} rel={row.label === 'Email' ? undefined : 'noopener noreferrer'}>
            <span className="contact-card-index">0{index + 1} / {row.label.toUpperCase()}</span>
            <strong>{row.text}</strong>
            <span>{row.note}</span>
            <span className="contact-card-arrow" aria-hidden="true">↗</span>
          </a>
        ))}
      </div>
      <p className="contact-footnote">Thanks for exploring the portfolio.</p>
    </article>
  )
}