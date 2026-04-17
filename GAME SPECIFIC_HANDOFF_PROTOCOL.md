# Handoff Protocol Between ChatGPT and Claude Code

Use this structure whenever preparing a prompt for Claude Code.

## Required structure

### A. Objective
A direct paragraph describing what Claude should accomplish now.

### B. Project context
Include:
- game type
- current milestone
- existing systems already present
- relevant assets or folders
- stack

### C. Constraints
Always include:
- do not break existing functionality
- keep changes scoped to this milestone
- do not add future-milestone systems
- prefer small, testable diffs
- keep architecture readable and aligned with likely future needs

### D. Implementation tasks
Concrete numbered tasks only.

### E. Acceptance criteria
Define what must be true for the work to count as done.

### F. Test procedure
State exactly what to run and what to verify locally.

### G. Report-back format
Require Claude Code to respond with:
1. files created/edited
2. what was implemented
3. assumptions made
4. known issues / follow-ups
5. exact local run/test steps

## Guardrails
- Never ask Claude to build the whole game at once.
- Never mix multiple milestones into one prompt unless the work is truly trivial.
- Keep prompts implementation-ready, not aspirational.
- Tie every request to testable outcomes.

## Standard shell

Objective:
[What should be built now.]

Project context:
- We are building [GAME].
- Current milestone: [MILESTONE].
- Stack: [STACK].
- Existing systems: [SYSTEMS].
- Assets/folders: [PATHS].

Constraints:
- Keep scope limited to this milestone.
- Do not break existing functionality.
- Do not implement future-milestone features.
- Keep the architecture simple, readable, and testable.

Implementation tasks:
1. [TASK]
2. [TASK]
3. [TASK]

Acceptance criteria:
- [CRITERION]
- [CRITERION]
- [CRITERION]

Test procedure:
- Run [COMMAND].
- Verify [BEHAVIOR].
- Verify [BEHAVIOR].

When done, report back with:
1. files changed
2. summary of implementation
3. assumptions / tradeoffs
4. remaining issues
5. local run instructions
