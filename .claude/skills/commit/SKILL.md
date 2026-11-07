---
description: Stage and commit all uncommitted changes, grouped by logical concern, using conventional commits format. Never git add -A or add .; always stage by explicit path.
context: fork
model: haiku
---

# /commit

Stage and commit all uncommitted changes, grouped by logical concern, using conventional commits format.

## Invocation

```
/commit          # propose plan, await user approval before committing
/commit --yes    # skip confirmation, commit automatically after checks pass
```

## Step 1 — Collect Changes

Run in parallel:

```bash
git status --porcelain
git ls-files --others --exclude-standard
```

If there are no changes at all, report "Nothing to commit." and stop.

**Check for secrets** — scan the file list from status for any files that look like they contain secrets (`.env`, credential files, private keys, `*.pem`, `*.key`). Warn the user and exclude those files from all subsequent steps; do not commit them.

## Step 2 — Lint and Version Sync

Run in parallel:

```bash
npm run lint
```

```bash
BASE=$(cat VERSION)
PKG_BASE=$(node -p "require('./package.json').version" | awk -F. '{print $1"."$2}')
if [ "$PKG_BASE" != "$BASE" ]; then
  npm version "${BASE}.0" --no-git-tag-version
fi
```

If lint fails, **stop immediately**. Report the errors and do not proceed.

If `package.json` was updated by the version sync, include it in the relevant commit group (or as its own `chore` commit if nothing else touches it).

## Step 3 — Group Changes

Run in parallel to understand the changeset compactly:

```bash
git diff --stat HEAD
git diff --name-status HEAD
```

Using the file paths, status codes (from Step 1), and the stat/name-status output, group files into logical commits:

- One new feature or page = one commit
- A bug fix and its regression test = one commit
- Documentation-only changes across many files = one commit
- Content file additions/edits (`src/content/**`) = one commit
- CSS/visual changes = one commit
- Config/tooling changes = one commit
- Unrelated changes that happen to land together = separate commits
- When in doubt, split rather than bundle

For files whose grouping cannot be determined from paths and summary alone, run `git diff HEAD -- <file>` for just those specific files.

## Step 4 — Present Commit Plan

```
Proposed commits (3):

[1] feat(blog): add series grouping to post pages
    Files: src/pages/blog/[...slug].astro, src/components/SeriesNav.astro

[2] content: add post on distributed tracing
    Files: src/content/blog/distributed-tracing.md

[3] chore(ci): update deploy workflow node version
    Files: .github/workflows/deploy.yml
    ⚠ flagged as ambiguous
```

If `--yes` was passed, skip to Step 5 immediately.

Otherwise, ask:
```
Approve and commit? [y = yes, e = edit, n = cancel]
```

- **y**: proceed to Step 5
- **n**: abort; leave working tree untouched; print "Aborted — no commits made."
- **e**: ask what to change; apply edits; re-display; ask again; record the insight as a guidance note (Step 6)

## Step 5 — Execute Commits

For each group in order:

1. Stage exactly the files in that group by explicit path — never `git add .` or `git add -A`:
   ```bash
   git add -- <file1> <file2> ...
   ```
2. Commit using a heredoc:
   ```bash
   git commit -m "$(cat <<'EOF'
   <type>(<scope>): <description>
   EOF
   )"
   ```
3. If a pre-commit hook fails: fix the underlying issue, re-stage, and create a **new** commit — never amend and never use `--no-verify`.
4. If a commit fails for any other reason, report the error, stop, and tell the user which commits succeeded and which did not.

After all commits succeed:
```
✓ 3 commits made:
  2a1f3c4 feat(blog): add series grouping to post pages
  9b8e2d1 content: add post on distributed tracing
  4c7a0f8 chore(ci): update deploy workflow node version
```

## Step 6 — Record Grouping Guidance (if user edited the plan)

Extract the key insight from the user's edit — one concise rule — and append it inside the `<!-- grouping-guidance -->` block using the Edit tool. Do not duplicate existing guidance.

---

## Commit message format

Use **conventional commits**: `<type>(<scope>): <description>`

- Scope is optional; use it for a major area: `(blog)`, `(resume)`, `(nav)`, `(ci)`, `(slugs)`, etc.
- Description: imperative mood, lowercase, no trailing period, ≤72 characters
- One-line subject only — no body

**Types:**
- `feat` — new page, component, or utility
- `fix` — bug fix
- `refactor` — restructuring without behavior change
- `test` — test file additions or changes
- `docs` — `.md` documentation files (`CLAUDE.md`, `docs/`, `.claude/rules/`, `.claude/skills/`)
- `chore` — config, tooling, CI (`package.json`, `astro.config.ts`, `.github/`, `wrangler.toml`, etc.)
- `style` — CSS/visual changes (`src/styles/`)
- `content` — content files (`src/content/**/*.{md,mdx,yaml,yml}`)

## Safety invariants

- Stage by explicit path only — never `git add .` or `git add -A`
- Never pass `--no-verify`, `--no-gpg-sign`, or any flag that bypasses hooks
- Never amend a prior commit — if a hook fails, fix and create a new commit
- Never commit `.env`, secrets, credentials, or private keys — warn and skip
- Do not push — committing only, unless the user explicitly asks to push
- Do not add `Co-Authored-By` trailers — omit them from all commit messages

---

<!-- grouping-guidance -->
<!-- /grouping-guidance -->
