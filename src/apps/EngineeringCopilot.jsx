import RecruiterCopilot from '../RecruiterCopilot.jsx'
import { useOS } from '../store'

export default function EngineeringCopilot() {
  const openApp = useOS(state => state.openApp)
  const openProject = useOS(state => state.openProject)
  return <div className="engineering-app"><RecruiterCopilot onProject={openProject} onNavigate={openApp} /></div>
}
