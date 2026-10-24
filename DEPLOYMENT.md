# SMMSA-OS Portfolio — launch checklist

## 1. Verify locally

Requirements: Node.js 22.x and npm.

```bash
npm ci
npm run test
npm run build
npm run preview
```

Open the local preview URL printed by Vite. On a fresh browser profile, confirm Portfolio Home opens only on the first visit; refresh and sign in again to confirm it does not automatically reopen. Verify Home, Projects, Skills, Resume, Publications and Contact, test window sizing/restore, check that the Start Menu pinned grid does not overlap Recent, open every configured external link, download the included PDF resume, and test on a narrow/mobile viewport (e.g. 320px, 375px, 390px wide and landscape), swipe the taskbar app switcher and project filters, use Explorer quick access, and verify the system safe-area spacing on a notched phone.

## 2. Review public information

Before making the portfolio public, review `src/data.js` and `public/resume.pdf`:

- Confirm email, social profile URLs, education dates/CGPA, internship details and publication metadata.
- Keep project metrics explicitly labelled as backtest/prototype results where relevant; do not imply live trading returns or real toll-payment processing.
- Check that every configured repository and paper link is public and opens the intended resource.
- Replace `public/resume.pdf` with the final public resume if it has changed.
- Do not include API keys, credentials, private client data or sensitive screenshots.

## 3. Deploy with Vercel

1. Push this project to a GitHub repository you control.
2. In Vercel, choose **Add New → Project** and import that repository.
3. Confirm the framework is **Vite**, the install command is `npm ci`, the build command is `npm run build`, and the output directory is `dist`. These defaults are also written in `vercel.json`.
4. Deploy the preview and test its Home, project links, PDF download and mobile layout before assigning a production domain.

Alternatively, after installing the dependencies, run `npx vercel` in this directory and follow the prompts to log in and choose/create a project. Use `npx vercel --prod` only when you intend to publish the current version to production.

## 4. Netlify alternative

Build with `npm ci && npm run build`, then deploy the generated `dist/` directory. The `public/_redirects` file supplies the SPA fallback.

## Hosting status

This source bundle is deployment-ready, but it does not contain a live deployment URL. No existing Vercel project or accessible GitHub repository was available in the current connected-account checks, and the local dependency installation timed out in this environment, so the production build could not be run here. Verify the build in your local environment or the hosting provider before promoting to production.
