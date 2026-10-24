import { profile } from '../data'

export default function Contact() {
  const rows = [
    { label: 'Email', text: profile.email, href: `mailto:${profile.email}` },
    { label: 'GitHub', text: `github.com/${profile.handle}`, href: profile.github },
    profile.linkedin && { label: 'LinkedIn', text: 'LinkedIn profile', href: profile.linkedin },
  ].filter(Boolean)

  return (
    <article className="contact-app doc">
      <p className="portfolio-kicker">CONTACT</p>
      <h2>Let&apos;s talk.</h2>
      <div className="contact-cards">
        {rows.map((row, index) => (
          <a key={row.label} className={`contact-card contact-card-${index + 1}`} href={row.href} target={row.label === 'Email' ? undefined : '_blank'} rel={row.label === 'Email' ? undefined : 'noopener noreferrer'}>
            <span className="contact-card-index">0{index + 1} / {row.label.toUpperCase()}</span>
            <strong>{row.text}</strong>
            <span className="contact-card-arrow" aria-hidden="true">↗</span>
          </a>
        ))}
      </div>
    </article>
  )
}