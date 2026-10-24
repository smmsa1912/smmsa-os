# SMMSA-OS Portfolio — launch checklist

## 1. Verify locally

Requirements: Node.js 22.x and npm.

```bash
npm ci
npm run test
npm run build
npm run preview
```

Open the local preview URL printed by Vite. Confirm that the retro desktop appears first after the short boot animation and the Welcome window opens on top without a simulated sign-in click. Start the 90-second recruiter tour and verify that it moves through Projects (OSCAR selected), Skills, Publications, Resume, and Contact while the tour panel stays visible. Test Skip/Escape, the Welcome window's direct resume/contact actions, and the taskbar's Recruiter View switch. Then test window sizing/restore, Start Menu, games, Ask My Portfolio, and the desktop's direct app icons. Check narrow mobile viewports (320px, 375px, 390px and landscape), resume PDF access, touch targets, and notched-phone safe areas.

## 2. Review public information

Before making the portfolio public, review `src/data.js` and `public/resume.pdf`:

- Confirm email, social profile URLs, education dates/CGPA, internship details and publication metadata.
- Keep project metrics explicitly labelled as backtest/prototype results where relevant; do not imply live trading returns or real toll-payment processing.
- Check that every configured repository and paper link is public and opens the intended resource.
- Replace `public/resume.pdf` with the final public resume if it has changed.
- Do not include API keys, credentials, private client data or sensitive screenshots.

## 3. Deploy with Cloudflare Pages

This project is configured for a static Pages deployment.

1. Push the project to the GitHub repository connected to your Cloudflare Pages project.
2. In **Workers & Pages → your Pages project → Settings → Builds & deployments**, use `npm run build` for the build command and `dist` for the output directory. No environment variables are required for the static portfolio.
3. Keep the production branch set to the repository's actual default branch (often `main`).
4. When the build succeeds, test the `*.pages.dev` project URL first. Then add `andrewneil.dev` in the Pages project's **Custom domains** screen and follow Cloudflare's record/activation prompts.
5. Test HTTPS, resume PDF, project links, mobile navigation, optional local AI (WebGPU browser), and all games before sharing the production URL.

Do not add a duplicate DNS record if Cloudflare Pages has already created the required record. Leave existing DNS and nameserver settings alone unless Cloudflare's custom-domain status specifically asks for a change.

## 4. Vercel alternative

Vercel settings remain in `vercel.json`: install `npm ci`, build with `npm run build`, output directory `dist`. Import the repository in Vercel or run `npx vercel` after logging in if you choose to host there instead.

## 5. Netlify alternative

Build with `npm ci && npm run build`, then deploy the generated `dist/` directory. The `public/_redirects` file supplies the SPA fallback.

## Current project status

The project is already deployed through Cloudflare Pages in the existing setup. This source package contains the OS-first welcome and guided-tour update; it is not automatically pushed to the connected GitHub repository. After copying these changes into the repo and pushing them, check the Pages build log and verify both the stable `pages.dev` URL and custom domain. Build and lint should be confirmed by Cloudflare or in the developer's local environment before treating this revision as production-verified.
