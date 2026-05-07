# Testing Conventions

## Philosophy

- Prove changes work before marking a task done. Write tests if needed; run them; demonstrate correctness.
- The Playwright suite covers both happy paths and feature-level interaction flows (filter/sort, breadcrumbs). Keep tests scoped to observable behavior — don't test implementation details.

## Unit Tests (Vitest)

- Test pure utility functions. Do not test Astro components or framework internals.
- Test files live alongside source: `src/utils/foo.ts` → `src/utils/foo.test.ts`.
- Run: `npm test` (single pass) or `npm run test:watch` (interactive).
- Name tests with `describe` + `it` blocks. `it` descriptions read as sentences: `it('returns 0 for empty string')`.
- Do not mock the file system or Content Layer — test pure logic only.
- Current coverage: `readingTime.ts`, `slugs.ts`.

## Playwright Tests

- Located in `tests/`. One file per concern.
- Run: `npm run test:e2e` (all tests), `npm run test:a11y` (a11y only). Both build first and run against `npm run preview`.
- Tests run against Chromium only. Add browsers when cross-browser coverage becomes a requirement.
- Use `waitForLoadState('networkidle')` on pages with React islands (`/blog`, `/projects`) before asserting dynamic content.

### Current spec files

| File | What it covers |
|---|---|
| `smoke.spec.ts` | Page loads, visible elements, HTTP status (landing, resume, blog index/post/series, projects catalog/detail, RSS, nav routing) |
| `breadcrumbs.spec.ts` | Breadcrumb nav on blog post, series page, project detail; series badge on blog index |
| `filter.spec.ts` | Tag click filtering, URL-driven filter arrival, empty state, clear-all, active filter chips (blog + projects) |
| `a11y.spec.ts` | axe-playwright WCAG 2.0/2.1 AA + best-practice sweep across all main routes |

## Where to add new tests

**Extend an existing spec** when the new test belongs to the same concern as the file:
- New page → add a load assertion to `smoke.spec.ts` and a route entry to `a11y.spec.ts`.
- New breadcrumb location → add to `breadcrumbs.spec.ts`.
- New filter/sort behavior → add to `filter.spec.ts`.

**Create a new spec file** when the concern is distinct enough that mixing it into an existing file would obscure intent:
- A new interactive feature with its own state model (e.g., a search bar, pagination, theme toggle).
- A cross-cutting concern that doesn't fit any current file (e.g., `rss.spec.ts` if RSS testing grows beyond a single status check).
- A new page type with non-trivial behavior (e.g., a contact form with validation flows).

The test: if a reader would need to understand a different feature to follow the new tests, make a new file. If the tests fit naturally under the existing file's label, add them there.

**Create a new unit test file** for every new utility module (`src/utils/foo.ts` → `src/utils/foo.test.ts`). One test file per source file — don't consolidate unrelated utilities.

## What to cover

- New utility function → unit tests before marking the task done.
- New page → smoke load test + a11y route.
- New interactive feature → happy path, empty/edge state, and any URL-driven entry point.
- Bug fix → regression test that would have caught the bug.
