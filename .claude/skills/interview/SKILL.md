---
description: Conduct a structured interview to produce a user story spec (UI feature) or a change spec (program change). Run before implementing any non-trivial feature.
---

# /interview

Conduct a focused interview to produce a spec before implementing any non-trivial change. The interview is adaptive — the depth, structure, and questions are determined by what the change actually requires, not a fixed checklist.

## Step 1 — Read the Signal

Before asking anything, assess the initial request.

**Identify the change type(s).** A change can span multiple types — cover all relevant concern areas. If the type is genuinely unclear from the request, that is the first and only thing to ask.

**Note what is already specified.** Anything the user stated explicitly or clearly implied is already answered. Do not re-ask.

**Calibrate depth** from signals in the request:
- Explicit signals: "quick", "small", "minor", "just" → lean light; "thorough", "detailed", "complex" → lean thorough
- Implicit signals: a short vague request → more to ask; a detailed description → less to ask; cross-cutting or high-risk change → lean thorough regardless of phrasing
- Default to standard depth when no signal is present

Depth reference:
- *Light* — cover only the highest-stakes unknowns; appropriate for small, well-scoped, low-risk changes
- *Standard* — cover all essential concerns; the right default for most changes
- *Thorough* — no gaps acceptable; appropriate for complex, high-risk, or cross-cutting changes

---

## Step 2 — Map the Concerns

Select the concerns that apply to this change. Use the examples below as starting points — add, remove, or merge based on what the initial request already covers and what genuinely matters for this specific change.

If the change spans multiple types, address user-facing concerns first (they drive implementation decisions).

### UI Feature
- **Entry points** — how does a user reach this feature?
- **Happy path** — step-by-step flow from entry to successful completion
- **States** — loading, empty, error, disabled, partial, unauthorized
- **Terminal states** — every way the flow ends, and what happens next
- **Testing** — what behaviors need proof?

### UI Styling
- **Visual intent** — what should change visually, or what problem does the current style have?
- **Scope** — which components, pages, or elements are affected?
- **Constraints** — design system tokens, accessibility (contrast, focus), responsive behavior
- **Done state** — how will you recognize that the styling is correct?

### Logic / Behavior Change
- **Current vs. desired** — what behavior changes, exactly?
- **Contracts** — what calls this code, what does it call, and what must not change externally?
- **Failure modes** — how can this fail, and how should failures be handled?
- **Testing** — what proves correctness?

### Tooling (dev tooling, scripts, CI)
- **Problem** — what workflow gap or pain does this solve?
- **Integration** — what processes, scripts, or team workflows does this touch?
- **Configuration** — what needs to be set up or changed?
- **Validation** — how will you know the tool works correctly?

### AI / Gen-AI Tooling
Same concerns as dev tooling, plus:
- **Model and prompt design** — what model, what prompt shape, what constraints?
- **Evaluation** — how will you assess output quality?

### Refactor
- **Preservation contract** — what must be externally identical before and after?
- **Scope** — which files, modules, or interfaces are in scope?
- **Testing strategy** — what existing tests prove no regression, and what gaps need covering first?

### Config / Data Change
- **What changes** — which config keys, data fields, or schemas?
- **Impact** — who or what is affected (callers, deployed environments, users)?
- **Migration / rollback** — does existing data or config need updating? Is it safe to revert?
- **Validation** — how do you confirm correctness after the change?

---

### Deriving concerns for novel change types

If the change does not fit a type above, derive the essential concerns by working through these questions:

1. **End state** — what is different after this change, and for whom?
2. **Dependencies** — who or what depends on what is changing (callers, users, workflows, systems)?
3. **Risk** — what could go wrong, and how bad would it be?
4. **Verification** — how will you know it worked?
5. **Constraints** — what bounds the solution (compatibility, performance, design, policy)?

Add specifics based on what the change actually involves.

---

## Step 3 — Interview

**Ask when:**
- The answer is not inferable from the request or codebase context
- A wrong assumption would cause meaningful rework or a wrong spec
- The answer changes what gets built in a non-trivial way
- There is genuine ambiguity where multiple valid answers exist

**Skip when:**
- The user already answered it, explicitly or implicitly
- It can be safely assumed from standard practice or context
- Asking it requires more precision than the change warrants
- It is a hypothetical edge case unlikely to matter for this specific change

**Conduct:**
- Group questions by concern — present related questions together
- Synthesize answers in one sentence before moving on (catches misreads early)
- One follow-up per concern maximum — surface the most important gap, not every gap
- Stop when you have enough to write a complete, unambiguous spec
- Keep it conversational — ask as a collaborator thinking through a design, not a form-filler

---

## Output

Produce the spec automatically after the interview — do not wait to be asked. Omit sections that were not relevant to the interview.

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
Type: bug fix | optimization | new capability | refactor | tooling | styling | config

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
