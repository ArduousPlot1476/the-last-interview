# Architecture Overview

The Milestone 3 build is split into three layers that stay clearly separated so later milestones can grow each one independently.

```
┌──────────────────────────────────────────────────────────────┐
│                     DOM overlay (UI)                         │
│  DialoguePanel (lines/choices/evidence)                      │
│  NotebookPanel · AccusationPanel · HUD · toast               │
└────────────────▲─────────────────────────────▲───────────────┘
                 │ listens on state-changed    │ feeds sessions
                 │                             │
┌────────────────┴─────────────────────────────┴───────────────┐
│                        Systems                               │
│  InvestigationState ───► NotebookStore (clues)               │
│   · isSatisfied(cond)    DialogueState (flags, heard,        │
│   · getVisibleTopics                  testimony,             │
│   · getVisibleContradictions          resolved contradictions│
│   · presentEvidence                   challenged testimony)  │
│   · canAccuse / determineEnding                              │
│  InteractionSystem (proximity + key dispatch)                │
└────────────────▲─────────────────────────────▲───────────────┘
                 │                             │
┌────────────────┴─────────────────────────────┴───────────────┐
│                    Phaser scene layer                        │
│  BootScene → PreloadScene → InvestigationScene               │
│  Player · walls · hotspots · DialogueSession builder         │
└──────────────────────────────────────────────────────────────┘
                 ▲
                 │ reads static content
┌────────────────┴─────────────────────────────────────────────┐
│                         Data                                 │
│  caseData.ts        — case, suspects, clues                  │
│  interactables.ts   — placements, walls, spawn               │
│  dialogue.ts        — DialogueTopic[]                        │
│  objectives.ts      — Objective[]                            │
│  contradictions.ts  — Contradiction[] (M3)                   │
│  endings.ts         — Ending[] (M3)                          │
└──────────────────────────────────────────────────────────────┘
```

## Scene flow

1. **BootScene** — minimal bootstrap; jumps straight to preload. Later milestones will read save state or show a splash here.
2. **PreloadScene** — generates placeholder textures (`player`, `evidence-icon`, `suspect-icon`) at runtime. When real art exists, replace generation with `this.load.image(...)`.
3. **InvestigationScene** — the Milestone 1 playable scene. Owns the player, walls, hotspots, and wires systems to UI.

## Key modules

### `entities/Player.ts`

Arcade-physics sprite with circular body. Reads `WASD` and arrow keys, normalizes diagonal velocity, exposes `setInputEnabled(bool)` so the scene can freeze the player while a panel is open.

### `systems/InteractionSystem.ts`

- Tracks registered `InteractableTarget`s (hotspots and NPCs).
- Every `update()`, finds the nearest target within its radius and emits `target-entered` / `target-left`.
- Binds `E` and `Space` once; presses emit `interact` with the current target.
- `consume(id)` marks one-shot hotspots so re-entering doesn't re-trigger.

The scene subscribes to those events and decides what to do — evidence becomes a clue via the notebook store; suspects open the dialogue panel. The system never reaches into UI or data directly, which keeps it extensible for M2/M3 (e.g., "present evidence" can become another event type on the same bus).

### `systems/NotebookStore.ts`

Session-scoped store of collected clue IDs. Extends `Phaser.Events.EventEmitter` and fires `clue-added`. Owns only evidence — dialogue state lives next door.

### `systems/DialogueState.ts`

Session-scoped store for five things:

- **Flags** set by authored topics and contradiction resolutions.
- **Heard topics** — which topic IDs the player has played through.
- **Testimony** — structured statement entries recorded to the notebook, keyed by ID and tagged with the suspect who said it.
- **Resolved contradictions** — contradiction IDs that the player has closed with valid evidence.
- **Challenged testimony** — IDs of statements that were the target of a resolved contradiction; used by the notebook to render a "⚑ Challenged" badge.

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

- **lines** — walks through a sequence of `DialogueLine`s with a Continue button.
- **choices** — topic and contradiction choices, rendered together (contradictions on top, marked with `⚑`). A Leave button returns the player to the world.
- **evidence** — evidence picker for a contradiction. Shows every clue and every piece of testimony the player currently holds (so the answer isn't given away). Selecting an option calls back through `session.presentEvidence`, which resolves to success or failure lines.

The panel is dumb about investigation state — `DialogueSession` is assembled by the scene, which is the layer that knows how to query `InvestigationState`.

### `ui/NotebookPanel.ts`

Renders (in order): case summary, open leads, suspect profiles, collected evidence, recorded testimony (with a "⚑ Challenged" badge on any statement that was contradicted), and resolved contradictions. Subscribes to `state-changed`.

### `ui/AccusationPanel.ts`

Terminal modal with three internal views — **choose** (pick a suspect), **confirm** (dossier of what the player has built), and **ending** (the narrative outcome plus a Restart button). The ending text is looked up via `InvestigationState.determineEnding(suspectId)`; the wrong-accusation ending interpolates `{name}` against the accused.

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

Dialogue and notebook are text-heavy and benefit from native text layout, selection, scrolling, and accessibility. The canvas stays focused on world/input. The boundary is cheap: scenes emit events, UI listens. If a future milestone needs an in-world speech bubble, Phaser can still draw one — the DOM panels are the overlay, not the whole UI.

## Extension points for later milestones

| Milestone | What changes | Where |
| --- | --- | --- |
| M4 art | Replace generated textures with real assets. | `PreloadScene` |
| M4 audio | Add footsteps, ambient music, dialogue sting. | New `systems/AudioSystem.ts` |
| M4 save/load | Persist `InvestigationState` to `localStorage`; serialize `DialogueState` + `NotebookStore`. | `systems/InvestigationState.ts` |
