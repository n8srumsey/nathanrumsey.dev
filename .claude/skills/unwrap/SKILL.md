---
description: Read and load the latest session continuation from .claude/continuations/latest.md into the current conversation context.
---

# /unwrap

Load the continuation context from the previous session.

## When to invoke

Run at the start of a new session to resume where the last session left off. Invoke when the user says "unwrap", "load context", "resume", or similar.

## Steps

1. Read `.claude/continuations/latest.md`.
2. Summarize the loaded context for the user in this structure:
   - **Project**: one-sentence reminder of what this project is
   - **Last session**: 2–4 bullet points of the most important things done (not exhaustive — just what's load-bearing for today)
   - **Next steps**: the ordered list from the continuation file, unchanged
   - **Verify**: the state checks from "State to verify on resume", so the user can confirm everything is clean

3. Do not modify any files. Do not run any commands. Just read and report.

## After loading

Ask the user what they'd like to work on, or offer to run the state verification checks if they want to confirm the environment is clean.
