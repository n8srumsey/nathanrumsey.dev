---
description: Stage and commit all uncommitted changes, grouped by logical concern, using conventional commits format. Never git add -A or add .; always stage by explicit path.
---

# /commit

Stage and commit all uncommitted changes, grouped by logical concern, using conventional commits format.

## Process

1. **Assess** — run the following in parallel to understand the full diff before touching anything:
   - `git status` (untracked and modified files)
   - `git diff` (unstaged changes)
   - `git diff --cached` (already-staged changes)
   - `git log --oneline -3` (recent commit context)

2. **Check for secrets** — scan the diff for files that look like they contain secrets (`.env`, credential files, private keys). Warn the user and skip those files; do not commit them.

2b. **Lint** — run `npm run lint`. If it fails, fix all violations before proceeding. Do not commit code that fails lint.

3. **Group** — identify logical groupings from the diff. Each group should be one independent concern. Guidance:
   - One new feature or page = one commit
   - A bug fix and its regression test = one commit
   - Documentation-only changes across many files = one commit
   - Content file additions/edits = one commit
   - Config/tooling changes = one commit
   - Unrelated changes that happen to land together = separate commits
   - When in doubt, split rather than bundle

4. **Commit each group** — for each group:
   a. Stage files by explicit path: `git add path/to/file another/path` — never `git add .` or `git add -A`
   b. Commit using a heredoc (see format below)
   c. If a pre-commit hook fails: fix the underlying issue, re-stage, and create a **new** commit — never amend and never use `--no-verify`

5. **Loop** — after each commit, check `git status` for remaining changes. Continue until the working tree is clean.

6. **Summarize** — list all commits made (one line each: hash + message).

## Commit message format

Use **conventional commits**: `<type>(<scope>): <description>`

- Scope is optional; use it for a major area: `(blog)`, `(resume)`, `(nav)`, `(ci)`, `(slugs)`, etc.
- Description: imperative mood, lowercase, no trailing period, ≤72 characters
- No body needed for straightforward changes; add one (separated by blank line) only when the *why* is non-obvious

**Types:**
- `feat` — new page, component, or utility
- `fix` — bug fix
- `refactor` — restructuring without behavior change
- `test` — test file additions or changes
- `docs` — `.md` documentation files (`CLAUDE.md`, `docs/`, `.claude/rules/`, `.claude/skills/`)
- `chore` — config, tooling, CI (`package.json`, `astro.config.ts`, `.github/`, `wrangler.toml`, etc.)
- `style` — CSS/visual changes (`src/styles/`)
- `content` — content files (`src/content/**/*.{md,mdx,yaml,yml}`)

**Always use a heredoc for the message:**
```bash
git commit -m "$(cat <<'EOF'
feat(blog): add series grouping to post pages

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
EOF
)"
```

**Always include the Co-Authored-By trailer** on its own line after a blank line.

## Safety invariants

- Stage by explicit path only — never `git add .` or `git add -A`
- Never pass `--no-verify`, `--no-gpg-sign`, or any flag that bypasses hooks
- Never amend a prior commit — if a hook fails, fix and create a new commit
- Never commit `.env`, secrets, credentials, or private keys — warn and skip
- Do not push — committing only, unless the user explicitly asks to push
