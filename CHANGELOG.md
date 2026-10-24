# Changelog

## v32 — SMMSA Arcade Game Center

- Reworked the Games app into a polished Game Center with four game tabs, quick tips, clearer score panels, keyboard/touch affordances, and responsive retro styling.
- Upgraded Snake with Chill/Classic/Turbo speeds, pause/resume, touch swipes, clearer start/game-over overlays, and device-local best score tracking.
- Upgraded Memory Match with Easy/Normal/Expert difficulty, 6–10 pairs, a timer, move tracking, and best-move records per difficulty.
- Added **2048**, including directional keyboard/touch controls, score and local best, one-move undo, win/continue flow, and game-over detection.
- Added **Reaction Rush**, a reflex test with randomized target timing, false-start feedback, and a locally saved personal best.
- Added pure-function regression tests for 2048 merging, score calculation, board movement, win/game-over detection, and Game Center registration. No new package dependencies.

### Verification
- `npm run test`: 85 tests passed, including nine new 2048/Game Center tests.
- Static syntax check: 53 JavaScript/JSX files parsed with zero syntax errors; PostCSS parsed all three stylesheets.
- Production build and ESLint remain unverified here because local project dependencies are unavailable; run both after `npm ci`.

## v31 — Better decision routing for Local AI

- Fixed hiring and candidate-assessment questions (for example, “Should I hire Andrew?”) to invoke the local model when Local AI is enabled instead of returning only the canned career-fit overview.
- Expanded the prompt context for hiring judgments to include Andrew's profile, experience, skills, and representative project case studies, even when basic keyword retrieval ranks only the profile highly.
- Retained the curated career-fit response as a fallback if local model inference fails; simple identity, education, contact, and navigation questions remain deterministic.
- Added regression tests for hiring-question intent and for combining direct-answer sources with retrieval matches in the local model context.

### Verification
- `npm run test`: 76 tests passed after this release's regression was added.
- Production build and ESLint remain to be verified in an environment with project dependencies installed.


## v30 — Local AI routing and natural language fixes

- Fixed the Local AI router: it no longer requires retrieval to have a strong match before using the model, so unfamiliar wording and open-ended questions can reach local inference.
- Kept direct, deterministic responses for simple facts and desktop navigation, while routing prompts that request explanation, comparison, critique, recommendations, writing, design, and reasoning to the local model.
- Improved question normalization for casual variants such as “ur”, repeated “so”, and stray backslashes/punctuation; “what's ur name\” now resolves to the assistant identity instead of a missing-fact fallback.
- Passed recent user turns (not model-generated claims) into the local model for better conversational continuity and follow-up handling.
- Expanded the local system prompt to allow ordinary conversation and general programming/AI/technology explanations while separating general knowledge from verified portfolio claims.
- Changed answer mode labels from “CURATED FACTS” to “QUICK ANSWER” and clarified in the UI that the assistant intentionally uses a hybrid of deterministic facts and local inference.
- Added regression tests for routing, casual identity prompts, and general-knowledge guardrails.

### Verification
- `npm run test`: 75 tests passed.
- JavaScript/JSX syntax and CSS parser checks run in this workspace; production build and ESLint require the project dependencies to be installed locally.

## v29 — More capable portfolio copilot

- Expanded direct portfolio answers for small talk, help/examples, profile summary, education/CGPA, experience, career-fit suggestions, achievements, publications, skills by category, project details, architecture, limitations, recorded metrics, and multi-project comparisons.
- Added deterministic project-specific answers so common questions do not depend on the small local model to interpret the intent or repeat exact facts.
- Added follow-up context retrieval for questions such as “what about its limitations?” using the previous answer’s cited portfolio source.
- Added desktop navigation commands: “open skills”, “open resume”, “open projects”, “open publications”, “open contact”, and related app aliases open the corresponding SMMSA-OS window.
- Kept suggested prompts visible after the initial greeting and made them compact, responsive chips to encourage visitors to explore the portfolio.
- Improved local-model instructions and retrieval context with verified source links; model generation remains optional and portfolio-grounded.
- Added regression coverage for conversational help, role/education questions, project comparison, project-specific details, app navigation, and follow-up context.

### Verification
- `npm test`: 71 tests passed.
- Production build and ESLint could not run here because this workspace did not contain installed Vite/ESLint dependencies; run `npm ci`, `npm run lint`, and `npm run build` locally before deployment.

## v28 — Grounded portfolio assistant responses

- Added deterministic answers for greetings, owner/assistant identity, exact email and contact links, and requests to list portfolio projects; these bypass local generation so common factual questions cannot turn into vague or invented answers.
- Added email, GitHub, LinkedIn, and resume details to the retrieved profile context so the local model can see the actual values for other grounded follow-up questions.
- Tightened the local model's contact instructions and stopped feeding prior assistant-generated replies back into conversation history, reducing the chance that a hallucinated answer contaminates later answers.
- Added six regression tests for the exact prompts shown in the user-reported issue, including “hiii”, name variants, email variants, contact methods, and “show me his project”.

### Verification
- `npm run test`: 61 tests passed.
- Production build and ESLint are not verified in this workspace because dependency installation previously timed out; run both locally after applying the ZIP.

## v27 — Portfolio assistant build fix

- Fixed the `buildLocalModelContext` named import: the helper belongs to `portfolioKnowledge.js`, not the optional WebLLM runtime module. This was the cause of the Vite production-build error and could prevent the assistant app from loading during development.
- Added a regression test that checks the helper is imported from its actual exporting module.

### Verification
- `npm run test`: 55 tests passed after the fix.
- `npm run build` could not be run in this workspace because dependency installation timed out and the local `node_modules` is incomplete; run it after installing dependencies in your project folder.

## v26 — Local-first portfolio assistant

- Added an **Ask My Portfolio** desktop app with question suggestions, curated answers, source links to case studies/repositories/publications, and keyboard-friendly mobile-responsive UI.
- Added a data-grounded retrieval layer over profile, experience, skills, projects, limitations, metrics, and publications; common questions work immediately without inference or network requests.
- Added optional on-device LLM inference through WebLLM, dynamically loaded from its CDN only after the visitor chooses to load the model. Uses Qwen2.5-0.5B-Instruct quantized model, checks WebGPU/secure-context support, reports loading progress, and falls back to curated answers if local inference fails.
- No model fine-tuning, backend, provider API key, or inference endpoint is required. Model/runtime assets are downloaded only on opt-in and may be cached by the browser; inference takes place on the visitor's device.
- Enriched FinVerse assistant context with the manuscript's implementation caveats: firmware/backend HMAC mismatch, default MIFARE Classic key, synthetic training labels, and the distinction between wallet settlement and on-chain audit anchoring.
- Documented the local inference architecture, model retrieval/cache behavior, privacy boundary, WebGPU requirement, and content update workflow in `LOCAL_AI.md`.
- Added nine regression tests for assistant registration, retrieval quality, truthful backtest/FinVerse caveats, local model loading strategy, and source links.

### Verification
- Run `npm ci`, `npm run test`, `npm run lint`, and `npm run build` locally. The model itself requires a compatible secure browser with WebGPU and an on-demand network download, so inference has not been exercised in this source-only test environment.

## v25 — Lint fixes and state-flow cleanup

- Reworked restart handling so the session controller remounts on restart instead of synchronously resetting React state inside an effect.
- Moved File Explorer persistence into its shared mutation commit path, including clear handling when browser storage is unavailable.
- Removed the redundant Settings keyboard-navigation assignment, unused test variable, and unnecessary regular-expression escape.
- Added three regression tests to guard the lint fixes against regressions.

### Verification

- `npm run test`: 45 tests passed.
- ESLint and the production build should be rerun after dependencies are available; package installation timed out in this workspace.

## v24 — Final quality audit

- Added roving keyboard focus and Arrow/Home/End selection to the Settings theme and wallpaper radio groups; selected options are the only Tab stop in each group.
- Added visible focus rings for theme and wallpaper choices, with a brighter focus treatment in HD-2D Glass-Pixel.
- Expanded automated quality checks for local diagrams/resume assets, publication/repository URL hygiene, profile destinations, page metadata, and the bundled favicon.
- Verified the LinkedIn profile destination and public GitHub repository destinations against their public pages; no placeholder hostnames or missing local diagram assets were found.
- Updated README accessibility and test-suite documentation.

### Verification

- `npm run test`: 42 tests passed.
- TypeScript parser syntax pass and CSS parser checks are included in the final static audit.
- `npm ci` timed out in this environment and left only a partial `node_modules` directory, so Vite production build and ESLint could not run here; rerun both after dependencies install on a network-enabled machine.

## v23 — Taskbar Clock Contrast & Responsive Readability
- Increased Glass-Pixel taskbar time/date contrast with bright text, subtle shadow, and a dark translucent clock surface.
- Added tabular numerals, a semantic ISO timestamp, and an accessible local-time label with the displayed date.
- Kept the time and date visible on mobile using a compact clock so the task switcher remains horizontally scrollable.
- Updated the clock from a single timestamp every 15 seconds to keep time and date in sync at date boundaries.
- Added regression tests for desktop contrast, mobile visibility, and accessible time metadata.

### Verification
- `npm run test`: 37 tests passed.
- TypeScript parser-based JS/JSX syntax diagnostics: no errors.
- All stylesheets parsed successfully with PostCSS and tinycss2.
- Production build not run because Vite dependencies are unavailable in this workspace; verify with `npm ci && npm run build` locally before deployment.

## v22 — HD-2D Glass-Pixel default

- Changed the fresh-install default to HD-2D Glass-Pixel with the Sunset Harbor wallpaper.
- Kept Classic Retro selectable in Settings.
- Migrated the prior v21 default pair (Classic Retro + Aurora) to Glass-Pixel + Sunset Harbor while preserving saved custom themes, wallpapers, sound preferences, and desktop icon positions.
- Versioned preference storage to `smmsa-prefs-v7` so intentional future theme choices are persisted without being re-migrated.

## v21 — HD-2D Glass-Pixel theme

- Added an optional HD-2D Glass-Pixel theme alongside the original Classic Retro design, selectable from Settings.
- Added a custom scalable pixel-art sunset harbor wallpaper with stepped skyline, water reflections, lantern-lit house, and a small pixel cat.
- Styled desktop icons, selection surfaces, window frames/title bars/controls, taskbar, Start Menu, search, and desktop context menu with translucent glass, blur, soft glow, and layered shadows.
- Added a two-card theme picker with accessible radio semantics and mini previews. Selecting Glass-Pixel pairs it with the new wallpaper when the default wallpaper was still active; custom wallpaper choices are otherwise preserved.
- Saved theme preference alongside existing browser preferences; existing installations default safely to Classic Retro.
- Added support for reduced-transparency preferences and 5 automated theme regression checks.

### Verification

- `npm run test`: 34 tests passed.
- SVG XML validation, SVG-to-PNG rendering, and CSS parsing passed.
- Production Vite build and ESLint could not run because `node_modules` is absent in this environment; ESLint is unavailable until dependencies are installed.

## v20 — Simplified Desktop Icons
- Removed the yellow Start-pinned stars from desktop icons; Start pin management remains available inside the Start Menu.
- Removed running-app bars and active-window green highlighting from desktop icons to restore a cleaner desktop.
- Preserved the state-aware empty/full Recycle Bin icon throughout the desktop, Start Menu, taskbar, and window title bars.
- Added regression assertions that desktop icons no longer render pin or running-state badges.

## v19 — Connected desktop icon states

- Added separate pixel-art states for an empty and full Recycle Bin and connected the state to the browser-local trash contents.
- Kept the Recycle Bin icon synchronized across the desktop, Start Menu, open-window title bar, and taskbar.
- Added a running marker for apps with open windows and a stronger active-window state for the focused app.
- Added a compact star badge to desktop icons that are pinned in Start; pin changes update the desktop immediately and remain stored in browser preferences.
- Added cross-tab storage synchronization for Recycle Bin counts and Start pin preferences.
- Added 4 automated regression tests for icon state, pixel-grid shape, pin persistence/events, and state-aware icon usage.

### Verification

- `npm run test`: 29 tests passed.
- Relative imports, CSS parsing, and ZIP integrity checked; production build and ESLint require installing project dependencies.

## v18 — Recycle Bin refresh

- Replaced the plain static Recycle Bin list with a retro storage utility: illustrated bin, summary cards, item list, selected-item details, status line, and designed empty state.
- Added a confirmation dialog for permanent deletion and emptying the bin.
- Connected File Explorer deletion to the browser-local Recycle Bin; deleted files and folders can be restored, including complete folder batches.
- Kept the demo filesystem isolated from the user's actual computer. Recycle Bin operations only modify browser local storage.
- Added responsive mobile layout and regression tests for delete/restore, folder descendants, batch deletion, and confirmation/empty states.

## v17 — Project architecture diagrams

- Added three editable SVG architecture diagrams for OSCAR, TradeAssist, and FinVerse and integrated them into their case studies alongside the existing Dynamic Toll and two KYC diagrams.
- Grounded OSCAR in its public repository README/module layout; grounded FinVerse in the project report and IEEE manuscript; clearly labelled TradeAssist as a high-level reconstruction because this portfolio snapshot has no linked source repository.
- Made the Projects diagram section source-neutral, showing source-paper links or a repository link where available and visible source-basis notes for all project diagrams.
- Included important implementation boundaries directly in the diagrams: OSCAR is local Windows-first automation; TradeAssist shows historical backtesting rather than live orders; FinVerse distinguishes database wallet settlement from asynchronous chain anchoring and displays known terminal/auth/model limitations.
- Expanded content-integrity tests to cover all six diagrams, SVG accessibility metadata, provenance, links, and target-project coverage.

### Verification

- `npm run test`: 20 tests passed.
- All six SVGs rendered to PNG; XML parsing and visual inspection passed for the three new diagrams.
- JavaScript/JSX and production build should still be verified on a network-enabled machine; this environment has previously been unable to install Vite/ESLint dependencies.

## v16 — Reference-paper architecture diagrams

- Added three original, responsive SVG architecture diagrams based on the published written system descriptions: Dynamic Toll Charging, initial RFID KYC, and expanded dual-mode KYC.
- Embedded the diagrams in the matching project case studies with descriptive alternative text, captions, and direct links to the source papers.
- Explicitly marked the figures as redraws rather than copied paper figures and added scope notes where the published design differs from the current prototype.
- Optimized mobile inspection with a horizontally scrollable diagram viewport so detailed labels remain readable on phone screens.
- Added automated tests to verify every diagram asset exists, is accessible as SVG, includes visible source attribution, and points to a known paper.

### Verification

- `npm run test`: 19 tests passed.
- SVG assets render successfully to PNG previews; architecture labels and source attributions were visually inspected.
- The JavaScript/JSX syntax and production Vite build should be verified locally before publishing; dependency installation has been unavailable in this workspace.

## v15 — Accessibility and interaction polish

- Removed stale release markers from the boot screen and portfolio Home.
- Standardized `noopener noreferrer` for links opened in a new tab.
- Added Escape-key handling to dismiss the Start Menu or clear its search, and to close the desktop context menu.
- Restored focus to the Start button when the Start Menu closes from the keyboard.
- Made window regions announce their visible title and focus the selected window when keyboard navigation enters it.
- Honored reduced-motion preferences in window entrance and exit animations.
- Added automated quality checks for the bundled resume PDF, links, release labels, accessibility behaviors, and relative import resolution.

### Verification

- `npm test`: 17 tests passed.
- TypeScript parser accepted all 35 JavaScript/JSX/test files with no syntax diagnostics.
- CSS parser reports no syntax errors in the three stylesheet files.
- The bundled resume PDF signature and file size were verified.
- `npm run build` and `npm run lint` could not run because the dependency installation timed out and left Vite/ESLint unavailable in this environment. Run `npm ci`, then rerun tests, build, and lint on a network-enabled machine.

## v14 — Mobile workspace

- Adapted the taskbar for phones with a compact Start action, horizontal app switching, Home shortcut, sound toggle, and hidden nonessential clock text.
- Added viewport-fit/safe-area support for modern notched phones and adjusted taskbar sizing around system insets.
- Made app windows full-screen views with larger touch controls and momentum scrolling on mobile.
- Improved phone navigation for Projects by making filters horizontally scrollable and strengthening list/detail spacing.
- Reworked File Explorer on small screens into a horizontal quick-access rail with a mobile-friendly file list and preview pane.
- Gave the Start Menu independently scrollable Pinned, Recent, and All Apps sections so the app directory remains reachable on short screens.
- Added responsive handling for narrow phones and landscape-height constraints, plus four mobile UI regression tests.

### Verification

- `npm run test`: 11 tests passed.
- CSS syntax parsing, relative import checks, and ZIP integrity checks passed.
- The production Vite build has not been run in this environment because dependencies are not installed; verify `npm ci && npm run build` locally before deployment.

## v13 — UI polish and first-impression pass

- Increased default window sizes for Portfolio Home, Projects, Skills, Publications, Resume, and Explorer so useful content occupies more of the available desktop space.
- Recentered newly opened windows, with a smaller cascade for subsequent apps instead of anchoring them toward the upper-left corner.
- Added a first-visit-only Portfolio Home launch; returning visitors can reopen it from the Home taskbar button or Start without the welcome window reappearing on every reload.
- Reduced the default Start Menu pins from seven to six to keep the pinned grid to two clean rows, and migrated the previous default pin set without overwriting custom pin choices.
- Constrained pinned, recent, and all-app lists to their own scroll regions to prevent content from visually running into neighboring Start Menu sections on shorter screens.
- Added a test covering minimum default sizes for portfolio-critical windows.

### Verification

- `npm run test`: 7 tests passed.
- JavaScript/JSX syntax and CSS parse checks passed.
- Relative-import and archive-integrity checks passed.
- The production Vite build remains unverified because project dependencies are not installed in this environment; run `npm ci && npm run build` locally or in CI before deployment.

## v12 — Portfolio quality pass

- Added high-level workflow diagrams to the OSCAR, TradeAssist, FinVerse, Dynamic Toll Charging, and KYC Smart Card case studies.
- Presented TradeAssist's recorded backtest snapshot as four structured metrics and retained a clear note that historical backtest results are not live trading performance.
- Added explicit scope and caveat notes to each featured project so prototypes, academic designs, and simulated workflows aren't mistaken for production deployments.
- Improved the Security / IoT project filter so relevant technologies in a project's stack can be found even when the tag name differs.
- Added six built-in Node.js tests for profile links, project completeness, workflow data, publication references, HTTPS destinations, metrics caveats, and skill categories.
- Updated the GitHub Actions workflow and deployment documentation to run the portfolio data checks before the production build.

### Verification

- `npm run test`: 6 tests passed.
- Static JS/JSX syntax parsing: 31/31 files passed.
- CSS parsing and relative-import checks passed.
- Production Vite build and ESLint were not verified in this environment because `npm ci` timed out while contacting the package registry.
