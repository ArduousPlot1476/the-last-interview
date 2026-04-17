# Architecture Overview

The shipped build is split into three layers that stay clearly separated so later iterations can grow each one independently.

```
┌──────────────────────────────────────────────────────────────┐
│                     DOM overlay (UI)                         │
│  StartOverlay · HelpPanel                                    │
│  DialoguePanel (lines · challenges+questions · evidence)     │
│  NotebookPanel (tabs: leads / evidence / testimony / case)   │
│  AccusationPanel (choose · confirm · ending + "why")         │
│  HUD (objective, controls hint, accuse button, toast stack)  │
└────────────────▲─────────────────────────────▲───────────────┘
                 │ listens on state-changed    │ builds sessions
                 │                             │
┌────────────────┴─────────────────────────────┴───────────────┐
│                        Systems                               │
│  InvestigationState ───► NotebookStore (clues)               │
│   · isSatisfied(cond)    DialogueState (flags, heard,        │
│   · getVisibleTopics                  testimony,             │
│   · getVisibleContradictions          resolved contradictions│
│   · presentEvidence                   challenged testimony,  │
│   · canAccuse / determineEnding       greeted suspects)      │
│  InteractionSystem (proximity + key dispatch)                │
└────────────────▲─────────────────────────────▲───────────────┘
                 │                             │
┌────────────────┴─────────────────────────────┴───────────────┐
│                    Phaser scene layer                        │
│  BootScene → PreloadScene → InvestigationScene               │
│  Player · walls · hotspots · DialogueSession builder         │
│  Start-overlay + help-panel + toast-stack wiring             │
└──────────────────────────────────────────────────────────────┘
                 ▲
                 │ reads static content
┌────────────────┴─────────────────────────────────────────────┐
│                         Data                                 │
│  caseData.ts        — case, suspects, clues                  │
│  interactables.ts   — placements, walls, spawn               │
│  dialogue.ts        — DialogueTopic[]                        │
│  objectives.ts      — Objective[]                            │
│  contradictions.ts  — Contradiction[]                        │
│  endings.ts         — Ending[]                               │
└──────────────────────────────────────────────────────────────┘
```

## Scene flow

1. **BootScene** — minimal bootstrap; jumps straight to preload.
2. **PreloadScene** — generates placeholder textures (`player`, `evidence-icon`, `suspect-icon`) at runtime. When real art exists, replace generation with `this.load.image(...)`.
3. **InvestigationScene** — the playable scene. Owns the player, walls, hotspots, and wires systems to UI. Also hosts the start overlay, help panel, and toast stack.

The start overlay intercepts play until dismissed: `startDismissed` gates player input, interaction ticks, and notebook/help key handling.

## Key modules

### `entities/Player.ts`

Arcade-physics sprite with circular body. Reads `WASD` and arrow keys, normalizes diagonal velocity, exposes `setInputEnabled(bool)` so the scene can freeze the player while a panel is open.

### `systems/InteractionSystem.ts`

- Tracks registered `InteractableTarget`s (hotspots and NPCs).
- Every `update()`, finds the nearest target within its radius and emits `target-entered` / `target-left`.
- Binds `E` and `Space` once; presses emit `interact` with the current target.
- `consume(id)` marks one-shot hotspots so re-entering doesn't re-trigger.

The scene subscribes to those events and decides what to do — evidence becomes a clue via the notebook store; suspects open the dialogue panel. The system never reaches into UI or data directly.

### `systems/NotebookStore.ts`

Session-scoped store of collected clue IDs. Extends `Phaser.Events.EventEmitter` and fires `clue-added`. Owns only evidence — dialogue state lives next door.

### `systems/DialogueState.ts`

Session-scoped store for:

- **Flags** set by authored topics and contradiction resolutions.
- **Heard topics** — which topic IDs the player has played through.
- **Testimony** — structured statement entries recorded to the notebook, keyed by ID and tagged with the suspect who said it.
- **Resolved contradictions** — contradiction IDs that the player has closed with valid evidence.
- **Challenged testimony** — IDs of statements that were the target of a resolved contradiction; used by the notebook to render a "⚑ Challenged" badge.
- **Greeted suspects** — tracked so repeat visits skip the greeting and drop straight to choices (M4 friction fix).

Emits `flag-set`, `topic-heard`, `testimony-recorded`, and `contradiction-resolved`.

### `systems/InvestigationState.ts`

Thin facade over `NotebookStore` + `DialogueState`. Owns the `isSatisfied(condition)` evaluator and the queries the rest of the app relies on:

- `getVisibleTopics(suspectId)` — topics whose `requires` block is satisfied.
- `getVisibleContradictions(suspectId)` — contradictions whose target testimony has been heard, whose `requires` is satisfied, and which haven't been resolved yet.
- `getVisibleObjectives()` — objectives whose `visibleWhen` is satisfied, each tagged with `complete` from `completeWhen`.
- `getAllOwnedEvidence()` — clues + testimony as picker rows for the evidence dialog.
- `presentEvidence(contradictionId, evidenceId)` — returns `{success, lines}` and commits `onSuccess` records/flags when valid.
- `canAccuse()` — gate for the HUD accusation button (openings + 3 clues + ≥1 critical contradiction resolved).
- `determineEnding(accusedSuspectId)` — returns one of the three authored endings based on accused suspect + strong/weak case.

Re-emits sub-store events as a single `state-changed` signal so UIs can re-render without subscribing to every source.

### `ui/DialoguePanel.ts`

DOM controller with three modes:

- **lines** — walks through a sequence of `DialogueLine`s with a Continue button. Empty greetings (repeat visits) short-circuit straight to choices.
- **choices** — renders two labelled groups: **Challenges** (red, with `⚑ CHALLENGE` tag) and **Questions** (with `ASK` / `✓ ASKED` tags). The Challenges group is hidden when empty. A Leave button returns the player to the world.
- **evidence** — evidence picker for a contradiction. Shows every clue and every piece of testimony the player currently holds (so the answer isn't given away). Selecting an option calls back through `session.presentEvidence`, which resolves to success or failure lines.

The panel is dumb about investigation state — `DialogueSession` is assembled by the scene.

### `ui/NotebookPanel.ts`

Four-tab notebook with a persistent progress strip.

- **Progress strip** (always visible): clue count vs. total, testimony count, contradictions resolved vs. total (with critical sub-count), accusation readiness (Locked / Ready).
- **Leads** tab: open objectives + resolved contradictions (critical ones styled distinctly).
- **Evidence** tab: collected clues.
- **Testimony** tab: grouped by suspect, with a per-group challenged count; contradicted statements dimmed + struck-through, with a `⚑ Challenged` badge.
- **Case** tab: case summary + suspect profiles.

Re-renders dynamic sections on every `state-changed`, but only when the panel is open.

### `ui/AccusationPanel.ts`

Terminal modal with three internal views:

- **choose** — pick a suspect.
- **confirm** — dossier (clues, testimony, critical contradictions resolved, motive established).
- **ending** — the narrative outcome plus a **"Why this ending"** checklist with ✓/✗ rows covering: accused the right person? both critical contradictions broken? motive established? (The wrong-accusation ending collapses to a single row naming Desmond as the real culprit.)

The ending text is looked up via `InvestigationState.determineEnding(suspectId)`; the wrong-accusation ending interpolates `{name}` against the accused.

### Start overlay + help panel

Both live in `index.html` as plain DOM and are controlled from `InvestigationScene`. The start overlay gates gameplay on first load; the help panel is a reference card the player can toggle with `H` at any time.

### Toast stack

Previously a single element that got replaced on every event; now a vertical stack. Each toast is a DOM element that fades in, lives for ~2.6s, and removes itself. Burst events (e.g. a contradiction that also records new testimony) now show two stacked toasts instead of one clobbered string.

### `data/*`

All story content is data-driven:

- `caseData.ts` — the case, suspects, and clues.
- `interactables.ts` — world placements, walls, spawn.
- `dialogue.ts` — the `DialogueTopic[]`.
- `objectives.ts` — the `Objective[]`.
- `contradictions.ts` — the `Contradiction[]` (2 critical + 1 supporting).
- `endings.ts` — the three authored endings.

### `types/*`

Shared interfaces: case/suspect/clue types in `game.ts`; dialogue/testimony/objective/condition types in `dialogue.ts`; `Contradiction` / `EvidenceOption` / `Ending` in `contradiction.ts`.

## Why DOM overlays (not in-Phaser UI)

Dialogue, notebook, accusation, help, and start are text-heavy and benefit from native text layout, selection, scrolling, and accessibility. The canvas stays focused on world/input. The boundary is cheap: scenes emit events, UI listens.

## Tradeoffs we accepted

- **No save/load.** Single-sitting vertical slice; a reload on the ending screen is acceptable. Adding `localStorage` in `InvestigationState` is straightforward if needed later.
- **Per-ID contradiction model.** Works for the three shipped contradictions; would want a more general evidence-match descriptor if we added many more.
- **Runtime-generated placeholder textures.** Fine for a vertical slice; swap out in `PreloadScene` when real art is ready without touching systems or UI.
- **Greeting-skip tracked in memory, not persisted.** Resetting on reload is the same as resetting the rest of the session.
- **No bundle splitting yet.** Vite warns about the ~1.5 MB main bundle (Phaser is most of it). Acceptable for desktop web; splitting is a follow-up if we care about first-load budgets.

## Extension points for future work

| Direction | What changes | Where |
| --- | --- | --- |
| Real art | Replace generated textures with loaded images. | `PreloadScene` |
| Audio | Add footsteps, ambient music, dialogue sting. | New `systems/AudioSystem.ts` |
| Save/load | Persist `NotebookStore` + `DialogueState` to `localStorage`. | `systems/InvestigationState.ts` |
| A second case | Split `caseData` / `dialogue` / `contradictions` / `endings` per-case and pick at boot. | `data/*`, `BootScene` |
| Notebook search/filter | Add per-tab search. | `ui/NotebookPanel.ts` |
| Bundle splitting | Dynamically import Phaser chunk. | `vite.config.ts` |
