# Playtest and Debug Templates

## Quick playtest note template
- Build / milestone tested:
- What I expected:
- What happened:
- What feels good:
- What feels off:
- Bugs observed:
- Severity:
- Can I reproduce it consistently?
- Screenshot / video / log attached?:

## Gameplay tuning feedback template
The build works, but the feel is off.

Observed issues:
- [example: movement feels sluggish]
- [example: clue discovery is too unclear]
- [example: dialogue pacing is too slow]
- [example: UI takes too many clicks]

I want the feel to shift toward:
- [faster / tenser / clearer / more tactical / more readable / more dramatic]

Based on this, decide the highest-leverage tuning changes and draft the next Claude Code prompt.

## Bug report template
Bug summary:

Reproduction steps:
1.
2.
3.

Expected behavior:

Actual behavior:

Frequency:

Environment / build info:

Artifacts attached:
- screenshot:
- console log:
- stack trace:
- video:

## Root-cause follow-up template
The fix worked.
Now explain:
1. what the actual root cause was,
2. why the original implementation failed,
3. how to prevent this class of bug in this codebase,
4. whether we should refactor anything adjacent.
