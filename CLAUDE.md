# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Personal portfolio/developer site at nathanrumsey.dev. Built with Astro 6, TypeScript, React 19, Tailwind CSS v4, and MDX. Rebuilt from scratch in May 2026 — prior stack was Gatsby + TypeScript.

Full design rationale and pattern catalog: `docs/ARCHITECTURE.md`
Content authoring guide: `docs/CONTENT_GUIDE.md`
Deployment setup: `docs/DEPLOYMENT.md`

## Commands

```bash
npm run dev        # Dev server at localhost:4321 (hot reload)
npm run build      # Build static output to dist/
npm run preview    # Serve the built dist/ locally
npm run check      # Astro + TypeScript type checking
npm run lint       # ESLint
npm test           # Vitest unit tests (single pass)
npm run test:watch # Vitest interactive
npm run test:e2e          # Build + Playwright (all tests)
npm run test:a11y         # Build + Playwright (a11y tests only)
npm run test:a11y:verbose # Playwright a11y only, list reporter with detailed violation output (no build)
npm run test:all          # Build + unit + Playwright
```

Always use these `npm run` scripts rather than invoking the underlying tools directly (e.g. `npm run test:e2e`, not `npx playwright test`; `npm run preview`, not `npx serve dist/`). When `package.json` scripts change, update this list in the same commit.

## Stack

- **Astro 6** — static site generator; Content Layer API for typed file-based content
- **React 19** — interactive islands via `@astrojs/react`; used only where interactivity is needed
- **Tailwind CSS v4** — via `@tailwindcss/vite` Vite plugin; no `tailwind.config.ts`
- **MDX** — blog posts and project detail pages with embedded React components
- **`@astrojs/rss`** — RSS feed at `/rss.xml`
- **`@astrojs/sitemap`** — auto-generated sitemap at `/sitemap-index.xml`
- **`@tailwindcss/typography`** — `prose` classes for MDX content rendering

## Design Patterns in Use

This section names and locates the patterns that structure this codebase. See `docs/ARCHITECTURE.md` for rationale.

**Islands Architecture** (Astro): pages are static HTML by default; interactive React components are opted in selectively. Zero JS ships unless a component explicitly needs it. Pattern boundary: `.astro` files are server-only; `.tsx` files with `client:*` directives are islands.

**Data-Driven UI / Template Method**: the resume page and project catalog are pure templates over data — they contain no hardcoded content, only iteration over typed data structures. Updating content = editing a YAML/MDX file; the template never changes. `src/pages/resume.astro` and `src/pages/projects/index.astro` are the template implementations.

**Repository Pattern** (Content Collections): `getCollection()` and `getEntry()` from `astro:content` are the single access point for all content. Pages never reach directly into `src/content/` files — they always go through the collection API, which enforces the schema. Config: `src/content.config.ts`.

**Schema-First Design** (Zod): the content schema in `src/content.config.ts` is the contract. The schema is defined before any UI is written; the UI trusts it. Adding a new field means first declaring it in the schema. Build fails on schema violations — content errors are caught at build time, not runtime.

**Separation of Concerns — Content vs. Presentation**: content (what) lives in `src/content/` as YAML/MDX; presentation (how) lives in `src/pages/` and `src/layouts/` as Astro components. Neither knows the implementation details of the other.

**Progressive Disclosure (tiered project pages)**: projects expose as much detail as has been authored. A project with frontmatter only = catalog card linking externally. A project with MDX body content = catalog card + detail page. The same `[...slug].astro` template handles both; the template adapts to what data is present rather than requiring a configuration flag.

**Slug Derivation Utility** (`src/utils/slugs.ts`): the Content Layer uses file-path-based `id`s (e.g., `hello-world/index.mdx`). A single `idToSlug()` function normalizes these to URL-safe slugs throughout the codebase. This is the single source of truth for the id → URL mapping; do not inline this logic in pages.

## Content Model

All content lives in `src/content/`. Schemas with Zod validation are defined in `src/content.config.ts`.

| Collection | Loader pattern | Location | Purpose |
|---|---|---|---|
| `blog` | `**/*.{md,mdx}` | `src/content/blog/` | Blog posts |
| `series` | `*.yaml` | `src/content/series/` | Ordered post groupings |
| `projects` | `**/*.{md,mdx}` | `src/content/projects/` | Portfolio items; MDX body = detail page |
| `resume` | `*.yaml` | `src/content/resume/` | Resume data; single file (`main.yaml`) |

Content Layer entries use `entry.id` (file path with extension, e.g., `hello-world/index.mdx`). Convert to URL slug via `idToSlug(entry.id)` from `src/utils/slugs.ts`. Render MDX with `import { render } from 'astro:content'` then `const { Content } = await render(entry)`.

## Verification Standard

**Never mark a task complete without proving it works.** After any code change:

1. Run `npm run build` — a clean build is the minimum bar
2. If the change affects behavior, prove it:
   - Run tests if they exist
   - Write a smoke test if the change is UI-visible and no test covers it yet (UI tests are smoke-style for now — cover the happy path, not exhaustive edge cases)
   - Demonstrate correctness in the response if a test would be disproportionate to the change size (e.g., a one-line config tweak)
3. `npm run check` for TypeScript errors if touching `.ts`/`.tsx`/`.astro` files

**Tests**: unit tests live in `src/` co-located with the code they test (e.g., `readingTime.test.ts` next to `readingTime.ts`). UI/integration tests live in `tests/`. When the UI matures, smoke tests will be expanded to comprehensive coverage — note that intent when writing them.

## Documentation Philosophy

**Goal**: `.md` docs in this project identify and explain the **design patterns** in use. The purpose is twofold: building knowledge of idiomatic frontend patterns for the developer, and enforcing pattern-conscious development when adding new code.

**What belongs in `.md` files:**
- Named design patterns, where they appear, and why they fit this context
- Decisions that required evaluating alternatives (the chosen option and what was ruled out)
- Invariants that span multiple files and can't be understood from any single file
- Intentional MVP/future design splits (e.g., the annotations system)
- Setup and operational procedures

**What does NOT belong in `.md` files:**
- Function-level documentation → TypeScript types and readable naming handle this
- Descriptions of what a component or file does → the code and structure make that clear
- JSDoc or API reference → write self-documenting code instead
- Task notes, WIP context, or session decisions

**Adding new code**: when introducing a new structural approach, ask "what pattern is this?" and add or update the relevant section in `docs/ARCHITECTURE.md`. Include the pattern name, where it manifests, and why it was chosen over alternatives.

**Keeping docs current**: update the relevant doc in the same commit when changing anything that alters an architectural decision, content model field, or documented pattern. The test: would a developer returning after a month be misled by the current doc?

## Session Management

**Project state is tracked in `.claude/NOTES.md`** — a living document that records current status, scope, next steps, blockers, and open considerations. Consult it at the start of a session for context on where things stand and what comes next.

**At the end of each working session**, run `/notes` to update the document with any meaningful changes to project state. If the user says they're done, wrapping up, closing, or signing off — run `/notes` automatically before ending the turn.

**`NOTES.md` is gitignored** — it is a personal scratchpad, not committed to the repo. It is not documentation and does not replace CLAUDE.md or the `docs/` files.

## Deployment

Push to `main` → GitHub Actions (`.github/workflows/deploy.yml`) → Cloudflare Pages.
Required GitHub Actions secrets: `CF_API_TOKEN`, `CF_ACCOUNT_ID`.
See `docs/DEPLOYMENT.md` for first-time setup.
