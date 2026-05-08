---
description: Update .claude/NOTES.md — the living project state document tracking status, scope, next steps, blockers, and open considerations. Run at end of session or when user says they're wrapping up, closing, or done.
effort: medium
---

# /notes

Maintain `.claude/NOTES.md` as a living record of project state. This is not a session log — it tracks meaningful changes to scope, direction, status, and open decisions.

## When to invoke

Run at the end of any working session where project state has changed, or when the user says they're wrapping up, closing, or done for now. Also useful mid-session when a significant decision is made or scope changes.

**Auto-invoke without being asked** when the user says they're done, wrapping up, closing, or signing off.

## Behavior

### If `.claude/NOTES.md` does not exist

Bootstrap from scratch:

1. Read `CLAUDE.md` and any docs in `docs/` that exist
2. Run `git log --oneline -20` to understand recent work
3. Run `git branch --show-current` to identify the current branch
4. Read `.claude/continuations/latest.md` if it exists — use it for next steps and current status
5. Generate the full document using the structure below

### If `.claude/NOTES.md` already exists

1. Read the existing document
2. Run `git branch --show-current` to check the current branch
3. Identify what has meaningfully changed this session: scope, status, next steps, decisions, blockers, open questions
4. Update only the sections that changed — do not rewrite unchanged sections
5. If the current branch differs from what the document records, note it and flag that some sections may reflect a different branch's context
6. If nothing meaningful changed, skip writing and tell the user

**Never log conversation activity.** Only track project state — what the project is, where it's headed, what's blocking it, and what's unresolved.

## Document structure

```markdown
# Project Notes — [project name]

## Project Overview
One paragraph: what this project is, its purpose, current phase, and key tech stack.

## Current Branch
`branch-name` — one sentence on what this branch represents (feature, bugfix, release prep, etc.).
Note: if switching branches, update this section — notes from another branch may not apply.

## Current Status
What is done and stable. What is actively in progress. Written as current fact, not history.

## Scope
What is in scope for the current work cycle. What is explicitly out of scope (deferred, cut, or won't-do).

## Next Steps
Priority-ordered list of immediate next actions. Each item should be actionable. Most important first.

## Open Questions / Considerations
Priority-ordered list of unresolved decisions, tradeoffs pending a choice, or things that need more thought. Most pressing first.

## Blockers
Priority-ordered list of anything preventing forward progress. Most urgent first. Remove items when resolved.

## Notes / Miscellaneous
Anything that doesn't fit the above — observations, context, reminders, design decisions not yet captured in docs/.
```

## After writing

Tell the user the file was updated and briefly summarize what changed. If bootstrapping for the first time, mention that `.claude/continuations/` can be deleted.
