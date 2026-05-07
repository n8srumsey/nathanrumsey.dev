# /interview

Conduct a structured interview to produce a user story spec (UI feature) or a change spec (program change).

## Step 1 — Classify

Ask: "Is this a **UI feature** (user-visible screens, flows, or navigation) or a **program change** (logic, data, config, tooling — no new UI)?"

If it's both, run the UI interview first (UI requirements drive implementation) then cover the program-change phases for the non-UI components.

Wait for the answer before proceeding.

---

## UI Feature Interview

Run phases in order. Present each phase's questions together, wait for answers, then state a one-sentence synthesis of what you heard before moving on. Ask one follow-up if an answer leaves an obvious gap — but only one.

### Phase 1 — Context
- What is this feature in one sentence?
- Who uses it? (user type or persona)

### Phase 2 — Entry Points
- How does a user reach this feature? List every path (nav link, direct URL, button, trigger event, notification, etc.).
- Is this a new route/page or embedded in an existing screen?

### Phase 3 — Happy Path
- Walk through the primary success flow step by step, from entry to completion.
- What does the user see or do at each step?
- What is the final successful state?

### Phase 4 — States & Edge Cases
- What UI states exist? (loading, empty, error, partial, disabled, read-only, etc.)
- What validation exists, and what triggers it?
- Can the user abandon mid-flow? What happens to any progress or data already entered?
- What happens if the user is unauthenticated or unauthorized?

### Phase 5 — Terminal States & Dead-ends
- List every way the flow can end: success, failure, timeout, cancelled, redirected.
- Are there dead-ends where the user is stuck with no clear next action? How do they recover or exit?
- What happens immediately after each terminal state — redirect, notification, next CTA?

---

## Program Change Interview

Run phases in order. Same conduct rules: synthesize each phase in one sentence, one follow-up max.

### Phase 1 — Problem
- What is the current behavior, and what should it be instead?
- Is this a bug fix, optimization, new capability, or refactor?

### Phase 2 — Contracts & Scope
- What functions, APIs, modules, or interfaces are changing?
- What currently depends on this code — callers, consumers, other modules?
- Is this a breaking change? If yes, what needs to be updated to match?
- What are the inputs and expected outputs (or side effects)?

### Phase 3 — Failure Modes
- In what ways can this fail at runtime?
- Should failures be surfaced (error thrown, logged) or handled silently with a fallback?
- What is the blast radius if this fails in production?
- Is the change rollback-safe without a data migration?

### Phase 4 — Data & State
- Does this touch persistent data (database, files, cache, external state)?
- Is a migration or backfill needed for existing data?
- Are there concurrency concerns — race conditions, shared mutable state, ordering dependencies?

### Phase 5 — Testing
- What existing tests will this break?
- What new tests are needed to prove correctness?
- Can the changed logic be tested in isolation (unit), or does it require integration fixtures?

---

## Output

Produce the spec automatically after all phases are covered — do not wait to be asked.

### UI feature output — user stories

Navigation stories first, always.

```
## Navigation Stories
As a [user], from [entry point / context], I [navigate to / open / trigger] [destination] → [what I see on arrival]
(One story per distinct entry point and navigation path)

## Feature Stories
As a [user], when [context or prior step], I [action] → [outcome]
(Cover the happy path; one story per meaningful step or decision point)

## State & Edge Case Stories
As a [user], when [condition — loading / empty / error / invalid / unauthorized / mid-flow abandon], I see [behavior or fallback]

## Terminal State Stories
As a [user], when [flow ends with outcome], I [what happens next — redirect / notification / CTA]
(One story per terminal state, including dead-ends and recovery paths)
```

### Program change output — change spec

```
## Change Spec: [Name]

### Motivation
[Current behavior] → [desired behavior], because [reason].
Type: bug fix | optimization | new capability | refactor

### Contracts
What changes: [function signatures, interfaces, data shapes, side effects]
What does NOT change: [preserved contracts and callers unaffected]
Breaking: yes / no — [if yes: what must be updated]

### Failure Handling
[Condition] → [how it is handled: error thrown / logged / silent fallback]
Rollback-safe: yes / no — [if no: migration notes]

### Data & State
[Persistent changes, migration needs, concurrency notes — or "none"]

### Testing Plan
Update: [existing tests that must change]
Add: [new tests required]
Isolation: unit / integration — [brief reason]
```

---

## Interview conduct

- One phase at a time — do not front-load all questions
- Synthesize answers in one sentence before moving on (confirms understanding, catches misreads)
- One follow-up per phase maximum — surface the most important gap, not every gap
- Do not produce output until all phases are done
- Keep questions conversational, not form-like — the interview should feel like talking through a design, not filling out a ticket
