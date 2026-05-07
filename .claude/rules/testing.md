# Testing Conventions

Minimal starting point — expand as the test suite matures.

## Philosophy

- Prove changes work before marking a task done. Write tests if needed; run them; demonstrate correctness.
- For UI, use smoke-style tests now. The current Playwright suite covers happy paths only — do not expand into exhaustive UI tests until the UI is stable.

## Unit Tests (Vitest)

- Test pure utility functions. Do not test Astro components or framework internals.
- Test files live alongside source: `src/utils/foo.ts` → `src/utils/foo.test.ts`.
- Run: `npm test` (single pass) or `npm run test:watch` (interactive).
- Name tests with `describe` + `it` blocks. `it` descriptions read as sentences: `it('returns 0 for empty string')`.
- Do not mock the file system or Content Layer — test pure logic only.

## Smoke Tests (Playwright)

- Located in `tests/`. One file per concern is fine at this scale.
- Run: `npm run test:e2e` (builds first, then runs against `npm run preview`).
- Tests run against Chromium only. Add browsers when cross-browser coverage becomes a requirement.
- Current coverage: landing, resume, blog index, blog post, series page, projects catalog, project detail, RSS, sitemap, nav routing.
- Keep smoke tests fast: assert visible elements and HTTP status codes. No deep interaction flows yet.

## Adding Tests

- New utility function → add a `.test.ts` file before marking the task done.
- New page → add a smoke test to `tests/smoke.spec.ts` (or a new spec file if the concern warrants it).
- Bug fix → add a regression test that would have caught the bug.
