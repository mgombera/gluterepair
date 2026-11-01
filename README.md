# gluterepair.com

A personal companion for patients scheduled for open gluteus tendon repair or gluteus maximus transfer with Dr. Mufaddal M. Gombera: what to do today, from booking through one year of recovery.

- Spec (approved 10/31/2026): [docs/scope.md](docs/scope.md)
- Approved screens: [docs/design](docs/design)
- Source documents: [docs/source](docs/source)
- Sibling site and code origin: fixmyhips.com ([docs/reference-fixmyhips](docs/reference-fixmyhips))
- Stack: Next.js (App Router), TypeScript, Tailwind CSS, Vitest; hosted on Vercel

Milestone 1 (the shell) is built: option A design, header, footer, every route as a placeholder, and search metadata for gluterepair.com. Milestone 2 rewrote `src/content/` for Open Gluteus Tendon Repair and Gluteus Maximus Transfer; on 11/01/2026 he made the site educational only (no exercise program) and added the optional myHealthTrack home program. The /proof page (and `docs/proof/2026-11-01-content-proof.pdf`) is waiting for his clinical sign-off.

## Develop

```bash
npm install
npm run dev     # http://localhost:3000
npm test
npm run build
```

## Milestones

1. Shell (option A design, routes, metadata)
2. Clinical content as data (sign-off gate)
3. Personalization engine
4. Before mode
5. After mode
6. Supporting pages, including the 3D glute model (anatomy sign-off)
7. Print and polish (final sign-off gate)
8. Launch
