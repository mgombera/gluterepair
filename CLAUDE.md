# gluterepair.com

Patient companion site for Dr. Mufaddal Gombera's open gluteus tendon repair and gluteus maximus transfer patients. Sibling of fixmyhips.com (hip arthroscopy), copied from its code on 10/31/2026.

- Full spec, approved 10/31/2026: `docs/scope.md`. Section 11 holds every clinical decision.
- Approved screens: `docs/design/` (option A palette, phone width).
- Clinical source documents: `docs/source/` (docx plus .txt extractions).
- fixmyhips reference (its scope, its source documents, its Phase IV): `docs/reference-fixmyhips/`. The code in `src/` still holds fixmyhips hip content until milestones 1 and 2 replace it.
- 3D mesh scripts from fixmyhips, the starting point for the glute model: `docs/3d/scripts/`.

## Where things stand

Scope and design canvas approved 10/31/2026. Next: milestone 1 (scope section 10). Patients are mostly 50 to 70 years old: light theme by default, 18px body text, 48px touch targets, no condensed fonts.

## Rules

- Build one milestone at a time (scope section 10). Each milestone: its own branch, tests passing, a pull request with the Vercel preview link, then stop for Dr. Gombera's review.
- Sign-off gates: milestone 2 (clinical content proof), the 3D anatomy model, and milestone 7 (final walkthrough). Never proceed past a gate without his explicit approval.
- Clinical content comes only from `docs/source/`, the decisions table in scope section 11, and (for Phase IV, logistics and shared pages) `docs/reference-fixmyhips/`. Never invent sets, reps, doses, timelines or restrictions. Every clinical item records its source; plain-language inferences are `derived: true` and show highlighted on /proof.
- Copy: no em dashes anywhere, including comments that render. Dates display as MM/DD/YYYY. Plain words, short sentences, large type. Procedure names in title case: "Open Gluteus Tendon Repair", "Gluteus Maximus Transfer".
- Notices word for word (scope section 8): standard-protocol notice, therapist override on every exercise page, medications "take as directed" notice, and the two video notices.
- No patient data leaves the browser: no forms, accounts, cookies or trackers. Date, procedure and ticks live in localStorage only; never a date or name in a URL. The one exception is cookieless Vercel Web Analytics page views: paths only, query strings stripped, no custom events, visible only in his Vercel dashboard.
- Footer only: the audience statement linking to gomberamd.com and "Content reviewed by Dr. Gombera." with no date. No reviewed-by line on pages.
- Images: only images Dr. Gombera confirms are his. No third-party images. The anatomy model uses HuBMAP Visible Human meshes (CC BY 4.0), credited under the model.
- Accessibility: WCAG 2.2 AA, 48px touch targets (44px minimum), real buttons and links, axe clean in both themes.
- Print sheets are generated until he supplies his edited PDFs; drop them in `public/print/` and set them in `src/content/print.ts`.
- New non-code files are named `YYYY-MM-DD-descriptive-name`. Before deleting, overwriting or renaming any of his files, show what changes and wait.
- Pace: outline the plan for a milestone and wait for approval before executing. Summarize after each major step. At the end of each task, list the files created or modified.

## Engineering notes (learned on fixmyhips)

- GitHub: use REST through `gh api` if GraphQL is blocked (create PRs with `gh api repos/OWNER/REPO/pulls -f title -f head -f base -F body=@file`).
- Vercel: production builds from main; previews are SSO-protected. Enable Web Analytics once in the dashboard (Project, Analytics).
- npm: `@vercel/analytics` needs `.npmrc` with `legacy-peer-deps=true`.
- Theme script: keep the init-script string in a plain module (not a `"use client"` file) so the server layout gets the real string.
- Local server: stop it by pid. `pkill -f next` also kills the shell.
- Titles and logo are fetched in `prebuild` scripts that fall back gracefully when the network is blocked.
- axe with `@axe-core/playwright` needs `browser.newContext()`. Use exact role names in Playwright to avoid strict-mode clashes.
- 3D render checks: Playwright with `--use-gl=swiftshader --enable-unsafe-swiftshader`.

## Commands

- `npm run dev` / `npm run build` / `npm test` / `npm run lint`
