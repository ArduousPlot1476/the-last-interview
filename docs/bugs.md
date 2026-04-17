# Known issues & follow-ups

Everything here is a known state of the shipping M4 build. "Ship-blocker" items should be empty — if any appear, the build is not ready to tag.

## Ship-blockers

_None known at M4 tag._

## Known minor issues

- **Tailwind warning during `npm run build`.** The output includes `warn - The 'content' option in your Tailwind CSS configuration is missing or empty`. This project does not use Tailwind; the warning is produced by a globally installed Tailwind plugin on the developer machine running the build. It is harmless and produces no CSS. Ignore, or run `npm run build` on a clean machine to silence it.
- **Large single JS chunk.** Vite warns that the main bundle is >500 kB after minification (`dist/assets/index-*.js` is ~1.5 MB, almost entirely Phaser). Acceptable for desktop web; a code-splitting pass is a follow-up, not a bug.
- **Browser autoplay policies.** The start overlay requires a user gesture to dismiss. This is intentional — it also satisfies any future audio-autoplay gating. If a future pass adds background music, keep the overlay so the audio context is unlocked by the dismiss click.
- **Session-only state.** Refreshing the page loses all progress. Documented; save/load is a non-goal for v1.
- **Tab key in panels.** We call `kb.addCapture(['TAB'])` so Phaser swallows Tab while the game canvas has focus. Browsers may still insert a focus ring on the currently-focused DOM button when the notebook opens — that's expected, not a bug.

## Edge cases worth knowing about

- **Opening the notebook mid-dialogue is intentionally blocked.** `Tab`/`I`/`H` handlers short-circuit if another panel is open. `Esc` unwinds the top overlay.
- **Presenting invalid evidence does not consume state.** Contradiction stays available; the player is free to try again. Verified by test procedure in `milestones.md`.
- **Repeat-visit greeting skip is session-scoped.** Reloading the page re-arms greetings — expected, since reload also resets every other part of the run.
- **Toast stack caps by time, not count.** If a pathological sequence queued up 20 toasts in the same second, they'd all render. In practice the game fires at most 2–3 per event (clue add + testimony record + contradiction resolve) so the stack stays short. If a regression ever produces a flood, consider capping at N visible.

## Closed bugs (for memory)

Listed here so they aren't re-introduced during future polish passes.

- **Single toast element clobbered on rapid events** — fixed in M4. A contradiction resolve that also records new testimony used to show only the last of the two toasts because both wrote to the same DOM node. Replaced with a stacked entry-per-event design in `InvestigationScene.showToast()`.
- **Repeat greeting fatigue** — fixed in M4. Every visit to a suspect used to replay the full greeting before the choice list; now `DialogueState.hasGreetedSuspect()` causes the second+ visit to pass an empty greeting array to `DialoguePanel`, which short-circuits `playLines` straight to choices.
- **Unclear "why did I get this ending"** — fixed in M4. Ending screens now show a ✓/✗ checklist over (accused suspect, both critical contradictions, motive established) before the narrative text.
- **Notebook scroll fatigue** — fixed in M4. A single long vertical list was replaced with four tabs and a persistent progress strip.

## Reporting

Open issues should go to the project tracker (wherever that ends up — currently none; add the link here when it exists). Include: build commit, browser, steps to reproduce, expected vs. actual.
