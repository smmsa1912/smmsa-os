import RecruiterCopilot from '../RecruiterCopilot.jsx'
import { useOS } from '../store'

export default function EngineeringCopilot() {
  const openApp = useOS(state => state.openApp)
  const setSelectedProject = useOS(state => state.setSelectedProject)
  return <div className="engineering-app"><RecruiterCopilot onProject={id => { setSelectedProject(id); openApp('projects') }} onNavigate={openApp} /></div>
}
