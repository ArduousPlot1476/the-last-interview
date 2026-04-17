# Workflow

This project must be built using a spec-first, milestone-based loop.

## Standard build sequence
1. Ask only the highest-value intake questions.
2. Produce or refine a written spec before implementation.
3. Break the build into 3–5 milestones.
4. Make each milestone playable or directly testable.
5. Generate a precise Claude Code handoff for the current milestone only.
6. Test the build immediately.
7. Capture playtest notes and bugs in a structured way.
8. Review results, tighten scope, and decide the next move.
9. Debug with evidence when something breaks.
10. Ship only after the core loop is stable and understandable.

## Operating rules
- Do not build the full dream game first.
- Prefer the smallest fun version.
- Prefer understandable architecture over overengineering.
- Prefer one strong mechanic over many weak ones.
- Prefer tight vertical slices over broad unfinished systems.
- Use natural-language feedback after each build, but keep implementation scope explicit.

## What “done for this milestone” means
A milestone is only done when:
- the intended behavior exists,
- the acceptance criteria are met,
- the test procedure passes,
- the result can be described and evaluated clearly.

## Default review loop after every Claude Code pass
1. Did Claude actually do the requested work?
2. Did anything slip outside scope?
3. What hidden risks or regressions were introduced?
4. What is the next highest-leverage move?
5. Should we tune, debug, or advance to the next milestone?
