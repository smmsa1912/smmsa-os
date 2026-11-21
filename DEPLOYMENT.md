# SMMSA-OS Portfolio — launch checklist

## 1. Verify locally

Requirements: Node.js 22.x and npm.

```bash
npm ci
npm run test
npm run build
npm run preview
```

Open the local preview URL printed by Vite. Confirm the OS desktop appears immediately with the Engineering Dashboard open, current resume, featured case studies, Agent Lab and copilot shortcuts. Open both interactive apps as OS windows. Exercise approval, rejection, denial and stale-approval simulations. Ask the copilot about AI skills and compare a job description containing both Python and Kubernetes. Verify the 90-second tour and taskbar Dashboard return action. Exercise window sizing/restore, Start Menu, games, and Ask My Portfolio. Check narrow mobile viewports (320px, 375px, 390px and landscape), resume PDF access, touch targets, and keyboard navigation. The `dist/` folder in this package is freshly built; it can also be uploaded to an existing Pages Direct Upload project if that is your established deployment method.

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

This release is a local OS-first redesign, not an automatic update to the currently deployed domain. After copying these changes into the repo and pushing them, check the Pages build log and verify both the stable `pages.dev` URL and custom domain. The prior live-domain audit received HTTP 403 in the cloud browser; confirm successful public access from an independent network. Do not change the domain or DNS merely on the basis of that browser-specific response.
