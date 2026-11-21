import { lazy } from 'react'
import RecruiterDesk from './RecruiterDesk'
import About from './About'
import Projects from './Projects'
import Resume from './Resume'
import Contact from './Contact'
import Terminal from './Terminal'
import QuickView from './QuickView'
import Settings from './Settings'
import RecycleBin from './RecycleBin'
import FileExplorer from './FileExplorer'
import Skills from './Skills'
import Publications from './Publications'
const Games = lazy(() => import('./Games.jsx'))
const PortfolioAssistant = lazy(() => import('./PortfolioAssistant.jsx'))
const EngineeringLab = lazy(() => import('./EngineeringLab.jsx'))
const EngineeringCopilot = lazy(() => import('./EngineeringCopilot.jsx'))

export const appComponents = {
  recruiter: RecruiterDesk,
  lab: EngineeringLab,
  copilot: EngineeringCopilot,
  about: About,
  projects: Projects,
  explorer: FileExplorer,
  resume: Resume,
  contact: Contact,
  games: Games,
  terminal: Terminal,
  quick: QuickView,
  settings: Settings,
  bin: RecycleBin,
  skills: Skills,
  papers: Publications,
  assistant: PortfolioAssistant,
}
