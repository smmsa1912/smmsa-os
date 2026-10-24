// Plain data about each app: no components here, so the store can import it safely.
export const appMeta = {
  recruiter: { title: 'Recruiter Desk', label: 'Recruiter Desk', icon: 'briefcase', w: 1040, h: 740 },
  about: { title: 'About me', label: 'About', icon: 'note', w: 700, h: 540 },
  projects: { title: 'Projects', label: 'Projects', icon: 'folder', w: 980, h: 680 },
  explorer: { title: 'File Explorer', label: 'Explorer', icon: 'explorer', w: 980, h: 660 },
  resume: { title: 'Resume', label: 'Resume', icon: 'doc', w: 760, h: 660 },
  contact: { title: 'Contact', label: 'Contact', icon: 'mail', w: 680, h: 480 },
  games: { title: 'Game Center', label: 'Games', icon: 'gamepad', w: 620, h: 760 },
  terminal: { title: 'Terminal', label: 'Terminal', icon: 'terminal', w: 760, h: 520 },
  quick: { title: 'Welcome to SMMSA-OS', label: 'Welcome', icon: 'start', w: 1020, h: 700 },
  settings: { title: 'Settings', label: 'Settings', icon: 'sliders', w: 700, h: 560 },
  bin: { title: 'Recycle Bin', label: 'Recycle Bin', icon: 'trash', w: 900, h: 700 },
  skills: { title: 'Skills & Tools', label: 'Skills', icon: 'skills', w: 940, h: 660 },
  papers: { title: 'Publications', label: 'Papers', icon: 'papers', w: 940, h: 640 },
  assistant: { title: 'Ask My Portfolio', label: 'Ask AI', icon: 'brain', w: 900, h: 680 },
}

export const appOrder = Object.keys(appMeta)
