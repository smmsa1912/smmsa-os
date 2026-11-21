# SMMSA-OS 2.1 — OS-first release

## 2.1.2 Navigation and recruiter tour polish

- Explicit project links from the dashboard, Welcome app, both assistants and guide reset stale Projects search/category state and focus the correct case study. Normal taskbar restoration retains the directory state.
- The nine-step guided tour includes Agent Execution Lab and Recruiter Copilot, with progress derived from the shared step list.
- Desktop labels no longer split Dashboard mid-word, and SVG action arrows replace font-dependent glyphs.
- OSCAR links to a clearly identified related policy simulation in Agent Lab; support for confirmed project demo-video URLs is ready. No unverified repository or fabricated demo links were added.
- The 2.1.1 resume and factual portfolio content are unchanged.

## 2.1.1 Content and resume refresh

- Added the Autonomous Research Agent as a seventh case study and featured dashboard project; integrated it into both assistants and the role-evidence comparison.
- Attributed the documented April 2025 SE Mini Project Competition first-place award to KYC Smart Card; preserved other reported competition recognition without assigning unsupported ranks.
- Updated the one-page resume with seven projects, the latest recorded milestones, clickable public contact links and aligned award wording.
- The direct Autonomous Research Agent repository URL and Upwork profile URL are not included until the exact public URLs are confirmed.

## 2.1.0 OS-first redesign

- The desktop itself is the public entry point; no separate landing page, compulsory boot or simulated login.
- The Engineering Dashboard opens automatically with resume, projects, proof points, and interactive app shortcuts.
- Agent Execution Lab and Recruiter Copilot are integrated as desktop windows, accessible through the dashboard, Start menu, taskbar and Terminal.
- Preserved the original desktop, wallpaper, window controls, games, theme settings and voluntary boot/lock interactions.

## 2.0.1 Windows compatibility hotfix

The `AgentLab.jsx` component and `agentLab.js` model had case-insensitively identical basenames. On Windows, Vite resolved the extensionless default import to the model instead of the JSX component, causing a blank page. The model is now named `agentLabModel.js`, both imports are explicit, and regression tests reject ambiguous case-insensitive module names.

## Changes introduced in 2.0

- Default public recruiter experience, optional code-split OS mode, direct mode return.
- Premium dark engineering hero with accessible light content panels.
- OSCAR 3.0 Stage 3A and TradeAssist 2.0 case studies, verification milestones and architecture diagrams.
- Interactive policy/approval Agent Lab (four deterministic illustrative scenarios).
- Browser-local recruiter copilot and transparent keyword-based job-description comparison.
- Updated FinVerse scope, professional ERP experience, six projects and current resume.
- Fixed skill category drift affecting both Recruiter Desk and AI skill questions.
- Improved metadata, structured Person data, sitemap and robots.txt.

## Verification and boundaries

Run `npm ci`, `npm test`, `npm run lint`, `npm run build` and `npm run preview` to reproduce the package. Project milestones in `src/data.js` are based on the supplied resume and recorded project verification; they were not independently rerun against the original OSCAR or TradeAssist repositories. Browser smoke testing remains pending because the local Chromium process was blocked by environment permissions. Live-domain verification and production deployment remain separate steps.

The original desktop, local model opt-in, games, guided tour and demo filesystem remain available. The new lab is a simulation and the job-fit comparison is an explicit keyword evidence mapping, not an autonomous agent or hiring prediction. No model-provider key is required.
