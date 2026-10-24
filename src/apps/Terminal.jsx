import { useEffect, useRef, useState } from 'react'
import { useOS } from '../store'
import { appMeta } from '../appMeta'
import { profile, projects, skills, highlights, experience, publications } from '../data'
import useIsMobile from '../useIsMobile'

const HELP = [
  'Commands:',
  '  home        open the portfolio landing page',
  '  about       who I am',
  '  projects    what I have built',
  '  skills      tools I use',
  '  experience  where I have worked',
  '  papers      list published papers',
  '  open papers open the publications window',
  '  ask          open the portfolio AI assistant',
  '  open assistant open Ask My Portfolio',
  '  contact     how to reach me',
  '  resume      open the resume window',
  '  download    open the resume PDF',
  '  play        open the games',
  '  ls          list apps',
  '  open <app>  open an app, e.g. open projects',
  '  clear       clear the screen',
]

const COMMANDS = {
  help: () => HELP,
  whoami: () => [`${profile.handle}`],
  about: () => [`${profile.name}, ${profile.role}.`, ...profile.bio, '', ...highlights.map((h) => `- ${h}`)],
  projects: () => projects.map((p) => `${p.name.padEnd(30)} ${p.tags.join(', ')}`),
  experience: () => experience.map((e) => `${e.role}, ${e.org} (${e.when})`),
  papers: () => publications.map((p) => `${p.title} - ${p.where}`),
  skills: () => Object.entries(skills).map(([g, items]) => `${g.padEnd(14)} ${items.join(', ')}`),
  contact: () => [`email   ${profile.email}`, `github  ${profile.github}`, ...(profile.linkedin ? [`linkedin ${profile.linkedin}`] : [])],
  ls: () => [Object.keys(appMeta).join('  ')],
  date: () => [new Date().toString()],
  github: () => [profile.github],
  email: () => [profile.email],
  linkedin: () => profile.linkedin ? [profile.linkedin] : ['No LinkedIn URL configured.'],
}

export default function Terminal() {
  const openApp = useOS((s) => s.openApp)
  const mobile = useIsMobile()
  const [lines, setLines] = useState([{ kind: 'out', text: 'smmsa-os terminal. Type help to see commands.' }])
  const [value, setValue] = useState('')
  const [history, setHistory] = useState([])
  const [cursor, setCursor] = useState(-1)
  const scroller = useRef(null)
  const input = useRef(null)

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight })
  }, [lines])

  const run = (raw) => {
    const [cmd, ...args] = raw.trim().split(/\s+/)
    const echo = { kind: 'in', text: raw }
    if (!cmd) return setLines((l) => [...l, echo])
    if (cmd === 'clear') return setLines([])
    let out
    if (cmd === 'open' || cmd === 'resume' || cmd === 'play' || cmd === 'home' || cmd === 'ask') {
      const rawTarget = cmd === 'open' ? args[0] : cmd === 'play' ? 'games' : cmd === 'resume' ? 'resume' : cmd === 'ask' ? 'assistant' : 'quick'
      const aliases = { home: 'quick', portfolio: 'quick', profile: 'about', explorer: 'explorer', projects: 'projects', skills: 'skills', contact: 'contact', ask: 'assistant', ai: 'assistant', assistant: 'assistant' }
      const target = aliases[String(rawTarget ?? '').toLowerCase()] ?? String(rawTarget ?? '').toLowerCase()
      out = openApp(target) ? [`Opening ${appMeta[target]?.title ?? target}...`] : [`open: no app named "${rawTarget ?? ''}". Try ls.`]
    } else if (cmd === 'download') {
      window.open(profile.resume, '_blank', 'noopener,noreferrer')
      out = ['Opening resume PDF in a new tab...']
    } else if (COMMANDS[cmd]) {
      out = COMMANDS[cmd]()
    } else {
      out = [`${cmd}: command not found. Type help.`]
    }
    setHistory((h) => [raw, ...h])
    setCursor(-1)
    setLines((l) => [...l, echo, ...out.map((text) => ({ kind: 'out', text }))])
  }

  const onKeyDown = (e) => {
    if (e.key === 'Enter') {
      run(value)
      setValue('')
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      const next = Math.min(cursor + 1, history.length - 1)
      if (history[next] !== undefined) {
        setCursor(next)
        setValue(history[next])
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      const next = cursor - 1
      setCursor(next)
      setValue(next >= 0 ? history[next] : '')
    }
  }

  return (
    <div className="term" ref={scroller} onClick={() => input.current?.focus()}>
      {lines.map((l, i) => (
        <div key={i} className={`term-line ${l.kind}`}>
          {l.kind === 'in' ? `> ${l.text}` : l.text}
        </div>
      ))}
      <label className="term-prompt">
        <span aria-hidden="true">&gt;</span>
        <input
          ref={input}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={onKeyDown}
          autoFocus={!mobile}
          spellCheck={false}
          autoCapitalize="off"
          autoComplete="off"
          aria-label="Terminal command"
        />
      </label>
    </div>
  )
}
