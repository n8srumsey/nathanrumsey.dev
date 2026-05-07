---
description: Generate a session continuation prompt and save it to .claude/continuations/. Run at end of session or when user says they're wrapping up, closing, or done.
effort: medium
---

# /wrap

Generate a continuation prompt for this session and save it to `.claude/continuations/`.

## When to invoke

Run this skill at the end of any working session, or when the user says they're wrapping up, closing, or done for now.

## Output format

Write the continuation prompt to `.claude/continuations/YYYY-MM-DD-HHMM.md` using today's date and the current time. Also overwrite `.claude/continuations/latest.md` with the same content.

Use this structure:

```markdown
# Continuation — YYYY-MM-DD

## Project context
One sentence on what this project is (not what was done today — what it is overall).

## What was done this session
- Bullet list of concrete changes made (files written, bugs fixed, features added)
- Be specific: file names, function names, test counts

## Next steps
Ordered list of the next concrete actions. Each item should be actionable in a single session. Include enough detail that a fresh session can start immediately without asking questions.

## Design decisions made this session
Any architectural or pattern decisions made this session that are not yet in docs/ARCHITECTURE.md or CLAUDE.md. Skip this section if everything was already documented.

## Open questions / blockers
Anything unresolved, needing a decision, or waiting on external input. Skip if none.

## State to verify on resume
Quick sanity checks for a fresh session: e.g., "run npm test — expect 11 passing", "build completes cleanly", "last commit was: <message>".
```

## After writing

Tell the user the file was written and show the path. Suggest they paste the content of `latest.md` into the next session's opening message.
