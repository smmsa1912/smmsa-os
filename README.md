# SMMSA-OS — Interactive Portfolio

SMMSA-OS is a retro-inspired, browser-based portfolio presented as a desktop environment. Visitors can explore projects, skills, experience, publications, and contact links through draggable desktop windows, a Start menu, and a command terminal.

## Portfolio features

- On the first visit, Portfolio Home opens after the simulated sign-in and gives recruiters a quick introduction, featured projects, profile links, and clear calls to action. Returning visitors can reopen it from the Home taskbar button or Start menu.
- Projects Explorer has searchable case studies, topic filters, high-level workflow and architecture diagrams for OSCAR, TradeAssist, FinVerse, Dynamic Toll Charging, and KYC Smart Card (editable SVGs), source labels/citations, technology stacks, recorded backtest metrics with an explicit caveat, and project scope/limitations. Repository/demo links appear only where configured.
- **Ask My Portfolio** is a hybrid local-first assistant. Greetings, identity/contact facts, resume links, and desktop-navigation commands are answered directly for reliability; open-ended prompts (explanations, comparisons, recommendations, critique, writing, and unfamiliar questions) can use an optional WebLLM model in a WebGPU-capable browser. Casual phrasing and recent user turns are supported, while claims about Andrew remain grounded in the curated portfolio data. The model runs in the browser and is not part of the initial site bundle. The first model load downloads runtime/model assets from public CDNs and may use substantial browser storage/GPU memory (the selected small model is configured for roughly 1 GB of GPU memory). Questions are not sent to an inference API. If local inference is unavailable, curated answers still work.
- **Game Center** includes four retro mini-games: Snake with selectable speeds and pause/swipe controls; Memory Match with three difficulties and a timer; 2048 with undo and local best score; and Reaction Rush with a false-start challenge. Best scores are saved in browser local storage.
- Skills & Tools groups the portfolio's current technology inventory by category. It does not imply every tool has the same proficiency level.
- About, Resume, Contact, Publications, and Terminal expose profile details, education, experience, published papers, resume access, contact links, and text commands. Case studies link to related published work where applicable.
- The desktop keeps draggable icons, larger centered application windows with a restrained cascade, a window manager, minimize/maximize/snap/resize controls, a carefully bounded Start menu, taskbar, wallpaper themes, and sound effects. Settings offers both **HD-2D Glass-Pixel** and **Classic Retro**. HD-2D Glass-Pixel is the default, with translucent window chrome, soft bloom, glass taskbar/Start Menu surfaces, and a custom sunset-harbor pixel-art wallpaper; Classic Retro remains available at any time. On phones, app windows become full-screen views, the taskbar becomes a compact icon switcher, project filters scroll horizontally, Explorer navigation becomes a horizontal rail, and touch targets and safe-area spacing are enlarged. Keyboard polish includes Escape handling for the Start Menu and desktop context menu, descriptive labels for window controls, focus-aware window activation, reduced-motion support for window transitions, and arrow-key/Home/End navigation with visible focus for the Settings theme and wallpaper radio groups.
- Explorer remains a sandboxed demo filesystem stored in this browser; it does not access or modify files on the visitor's computer.
- Theme, wallpaper, sound, and desktop icon preferences are stored in browser local storage. The boot and lock/sign-in screens are visual portfolio interactions, not real account security.

## Run locally

Requirements: Node.js 20.19+ or 22.12+.

```bash
npm ci
npm run dev
```

For checks:

```bash
npm run test
npm run build
npm run lint
```

The test suite includes content/link/asset integrity checks, diagram provenance checks, 2048 game-logic regression tests, and guardrails for the mobile viewport, taskbar clock, touch controls, keyboard-accessible Settings choices, Projects filters, and Explorer layout.

The project pins Node.js major version 22 via `.nvmrc`. The optional local AI uses WebLLM loaded on demand from `https://esm.run/@mlc-ai/web-llm@0.2.84`; it does not add a model server, inference API key, or backend requirement to deployment. GitHub Actions runs `npm ci`, `npm run test`, and `npm run build` on pushes and pull requests.

## Portfolio content

Most public-facing profile content lives in `src/data.js`. Update these values before publishing if your experience, CGPA, project descriptions, metrics, publications, email, or links change. Project repository/demo links are omitted unless a verified URL is configured. The included `public/resume.pdf` is what the Resume app links to; replace it with the final resume before deployment.

## Desktop controls

- **Double-click** a desktop icon to open the app.
- **Drag** icons to arrange them and drag window title bars to move windows.
- **Resize** regular windows from any edge or corner; drag to a screen edge to snap.
- Use `Ctrl + Alt + ←/→` to snap the active window, `Ctrl + Alt + ↑` to maximize, and `Ctrl + Alt + ↓` to restore.
- **Start → Power → Lock** shows the simulated lock screen; Restart replays startup and returns to sign-in.
- Type `help` in Terminal for available commands; `open skills`, `open projects`, `open assistant` (or `ask`), `home`, and `download` are supported.

## Deploying

This is a static Vite site; no backend service is required for the portfolio itself. Run `npm ci` and `npm run build`, then deploy the `dist/` folder to Vercel or Netlify. Vercel is configured explicitly for Vite with `npm ci`, `npm run build`, and `dist/` output. `public/_redirects` provides the Netlify SPA fallback. For Vercel, import the repository in the Vercel dashboard or run `npx vercel` from this directory after logging in. The first deployment has not been created by this package.

For the local LLM loading/privacy details and troubleshooting, see `LOCAL_AI.md`. For diagram provenance, repository/document sources, paper links, and edit/export notes for all six editable SVGs, see `DIAGRAM_SOURCES.md`. For the launch checklist and troubleshooting steps, see `DEPLOYMENT.md`.

Before making the site public, verify `src/data.js` (experience dates, CGPA, public links and project claims), replace `public/resume.pdf` with the final resume, and test the site on a phone as well as desktop. Do not publish API keys, credentials, private client data, or internal screenshots.

## Important distinction

This is an interactive portfolio website, not a real operating system. Sign-in has no password protection, and the built-in File Explorer and Recycle Bin use browser-local demo data rather than the visitor's real filesystem. Deleting an item in File Explorer moves it into the simulated Recycle Bin, where it can be restored or permanently removed within the demo.
