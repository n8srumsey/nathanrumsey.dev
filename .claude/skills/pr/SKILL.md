---
description: Create a GitHub pull request for the current branch using the GH CLI — auto-generates title, description, and links from branch context and existing repo state. Shows a dry-run preview before creating.
context: fork
---

# /pr

Create a pull request for the current branch. Auto-generates the title and description from commit history and related GitHub state. Always shows a dry-run preview before creating anything.

## When to invoke

Only when explicitly invoked via `/pr` or explicitly asked to create a pull request. Never suggest this skill unsolicited.

## Branching model

This repo follows trunk-based development with a fixed branching hierarchy:

```
feature/*   → development
development → main
```

Any other base branch is a hard error — explain and stop. Do not ask the user to override this.

## Step 1 — Preflight checks

Run all of the following in parallel. Fail loudly and stop if any check fails.

```bash
gh auth status                          # confirm gh is authenticated
git remote get-url origin               # confirm a GitHub remote exists
git branch --show-current               # get current branch name
```

**Hard stops (explain clearly, then stop — do not proceed):**
- `gh auth status` fails → "GH CLI is not authenticated. Run `gh auth login` and try again."
- No `origin` remote → "No GitHub remote is configured for this repo."
- Current branch is `main` or `development` → "PRs are not created from `main` or `development` directly. Switch to a feature branch."
- Current branch is not `feature/*`, `development`, or another valid feature branch → explain the expected branching model and stop.

## Step 2 — Determine base branch

| Current branch | Base branch |
|---|---|
| `development` | `main` |
| anything else (feature branch) | `development` |

## Step 3 — Check for commits to merge

```bash
git log <base-branch>..HEAD --oneline
```

If the output is empty (no commits ahead of base), stop: "No commits to merge into `<base-branch>`. Nothing to PR."

Also check for an existing open PR:

```bash
gh pr list --head <current-branch> --state open --json number,url --jq '.[0]'
```

If one exists, stop: "A PR for this branch is already open: <url>"

## Step 4 — Gather context

Run in parallel to build a full picture before drafting anything:

```bash
# Full commit log for this branch
git log <base-branch>..HEAD --format="%h %s%n%b"

# File diff summary
git diff <base-branch>...HEAD --stat

# Existing open issues (current repo only)
gh issue list --state open --limit 50 --json number,title,body,labels

# Recently closed issues
gh issue list --state closed --limit 20 --json number,title,body,labels

# Open PRs (for context and cross-references)
gh pr list --state open --limit 20 --json number,title,body,headRefName,baseRefName

# Repo info for scoping
gh repo view --json name,owner
```

**Scope constraint:** Never query issues, PRs, or discussions from any repo other than the one returned by `gh repo view`. All `gh` calls use the implicit current repo — never pass `--repo` with an external target.

## Step 5 — Determine draft status

Use judgment based on the commit log and diff:

- **Draft** if: commits include "WIP", "wip", "draft", "in progress", "TODO", "fixme", unfinished logic, or the diff suggests an incomplete feature
- **Draft** if: the base branch is `main` and the changes appear experimental or obviously incomplete
- **Ready** if: commits are clean, imperative, and the diff looks like a finished, testable change

Default to **draft** when uncertain.

## Step 6 — Find related issues and PRs

Cross-reference the commit messages and diff against the issues and PRs gathered in Step 4. Look for:
- Issue numbers referenced in commit messages (`#42`, `fixes #42`, etc.)
- Issue titles that match the branch name or commit summary
- Semantic overlap (the commits clearly address what an issue describes)

For each related item, determine closing behavior:
- **Use a closing keyword** (`Closes #N`, `Fixes #N`) only if merging this PR would fully resolve the issue
- **Reference without a closing keyword** (`#N` inline) if the issue is related but not fully resolved by this PR
- **Omit links entirely** if no related issues are found — do not fabricate links

## Step 7 — Draft the PR

Generate:

**Title** — imperative mood, concise (≤72 chars), describes the change (not the branch name). Do not use the branch name as the title.

**Description** — follow widely-acknowledged PR best practices:

```markdown
## Summary
[2–4 sentence explanation of what this PR does and why]

## Changes
- [Bullet list of meaningful changes — group by concern, not by file]

## Related
[Links to related issues or PRs — omit this section entirely if none]
[Use closing keywords only when merge fully resolves the issue]

## Test Plan
[What was verified — manual steps, test suite, or "N/A — config-only change"]
```

## Step 8 — Dry-run preview

Show the full preview before creating anything:

```
--- DRY RUN ---
Title:     <title>
Base:      <base-branch>
Draft:     yes / no
Labels:    (none)

<full description body>
--- END DRY RUN ---

Create this PR? (yes / no / provide feedback to regenerate)
```

Wait for the user's response:
- **Yes / confirmed** → proceed to Step 9
- **Feedback or requested changes** → regenerate the draft incorporating the feedback, show a new preview, repeat
- **No / stop / abort** → stop immediately, no PR created

## Step 9 — Create the PR

```bash
gh pr create \
  --base <base-branch> \
  --title "<title>" \
  --body "$(cat <<'EOF'
<description>
EOF
)" \
  [--draft]   # include only if draft
```

After creation, output the PR URL, then proceed to Step 10.

## Step 10 — Post-merge sync prompt

Immediately after outputting the PR URL, display this reminder:

```
---
After this PR is merged on GitHub, pull the merge commit down to keep
your working branch in sync:

  git checkout <current-branch>
  git fetch origin
  git merge origin/<base-branch>
  git push

Want me to watch for the merge and run these steps automatically when it lands? (yes / no)
```

If the user says **yes**:
- Poll every 30 seconds: `gh pr view <PR-number> --json state,mergedAt --jq '.state'`
- When the state becomes `MERGED`, run:
  ```bash
  git checkout <current-branch>
  git fetch origin
  git merge origin/<base-branch>
  git push
  ```
- Confirm to the user: "Merged. `<current-branch>` is now in sync with `<base-branch>`."

If the user says **no** — stop. The reminder was shown; the user will handle it manually.

## Safety invariants

- Never create a PR without showing the dry-run preview first
- Never target a base branch outside the defined branching model
- Never query or link issues/PRs from repos other than the current one
- Never use `--repo` with an external target
- Never merge, close, edit, or delete any PR or issue — read and create only
- Never push commits — this skill does not touch the working tree or git history
- Never fabricate issue/PR links — only reference items that exist in the repo
