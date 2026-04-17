# The Last Interview — Spec Summary (Shipped)

Condensed from `GAME SPECIFIC_STARTER_SPEC_DRAFT.md`, kept in sync with the shipping build. This doc is the single source of truth for what actually shipped; the starter draft is the full, unabridged reference.

## 1. Game overview

- Working title: **The Last Interview**
- Genre: narrative deduction / mystery investigation
- Platform: web desktop (keyboard + mouse)
- Stack: Phaser 3 + TypeScript + Vite
- Target session length: 10–20 minutes
- Audience: players who enjoy mystery, branching dialogue, and short replayable deduction games

## 2. Core fantasy

The player is a sharp investigator extracting truth from pressure, observation, and contradiction.

## 3. Core loop

1. Move through a small location.
2. Talk to a suspect.
3. Unlock or reveal statements.
4. Inspect evidence.
5. Cross-reference statements against evidence.
6. Resolve contradictions by putting the right item on the desk.
7. Decide who to accuse.
8. See an ending based on investigation quality, with a "why this ending" checklist.

## 4. Player verbs

move · inspect · talk · choose dialogue options · collect clue · review notes · compare statement to evidence · accuse · replay

## 5. Controls

- **Move:** WASD / arrow keys
- **Interact / advance dialogue:** `E` or `Space`
- **Notebook:** `Tab` or `I`
- **Help:** `H`
- **Close panel:** `Esc`
- Mouse for UI selection. No controller/mobile in v1.

## 6. Presentation

- Top-down 2D, room-based view, lightly stylized.
- Placeholder art (runtime-generated textures); readable without final art.
- DOM + CSS overlays for dialogue, notebook, accusation, help, and start screen; Phaser canvas for the world and input.
- Optional ambient/interaction sound is out of scope for v1.

## 7. Systems in scope (shipped)

- Movement / exploration over one small location (lobby + back office) with hotspots.
- Contextual interaction with evidence hotspots and NPCs via proximity + `E`.
- Branching dialogue with topic choices gated on clues / flags / prior testimony.
- Evidence collection into a single session-scoped notebook (no persistence).
- Testimony model: recorded statements keyed by ID, grouped by suspect.
- Objective / lead layer: open leads with visibility + completion gates, surfaced in HUD and notebook.
- Deduction / contradiction: present evidence against statements; success commits a flag and a follow-up testimony record.
- Progression: state-gated access to new topics and contradictions.
- Win / soft-fail on accusation with three authored endings.
- UI/HUD: tabbed notebook (Leads / Evidence / Testimony / Case), progress strip, active objective, dialogue panel with two labelled choice groups (Challenges, Questions), accusation panel with dossier and ending "why" checklist, start overlay, help panel, stacked toasts.

## 8. Content scope (shipped)

**In scope:** one location (one lobby + one back office connected by a doorway), one case, 3 suspects, 5 clues, 10 authored topics + 3 contradictions, three endings, placeholder art.

**Out of scope:** combat, open world, procedural cases, NPC schedules, voice acting, multiplayer, creator tools, live AI backends, audio, save/load.

## 9. Assets

- Runtime-generated placeholder textures in `PreloadScene` (player, evidence icon, suspect icon).
- No external art dependencies in v1.
- See [`assets.md`](assets.md) for the full status / sourcing / license situation.

## 10. Technical architecture

- Structure: `scenes`, `systems`, `ui`, `data`, `entities`, `types`.
- Scenes: boot, preload, main investigation. The accusation / ending flow is a DOM modal inside the investigation scene.
- Data-driven content: TS config for suspects, evidence, dialogue, objectives, contradictions, endings.
- State ownership: `InvestigationState` facade over `NotebookStore` (clues) and `DialogueState` (flags, heard topics, testimony, resolved contradictions, greeted suspects).
- Save: none. Restart reloads the page.
- Input: keyboard + mouse.
- Collision: lightweight rect walls for navigation only.

See [`architecture.md`](architecture.md) for the system diagram and module-by-module breakdown.

## 11. Known tradeoffs / risks (post-ship)

- Dialogue sprawl is mitigated by the data-driven structure, but a second case would benefit from a dialogue authoring tool.
- Contradiction logic is explicit per-ID in `contradictions.ts`; adding many more would want a more general evidence-match model.
- DOM overlays are fast to author and accessible, but full visual coherence with a final art pass will need a pass over tokens (colors, spacing) and possibly a custom typeface.
- Placeholder art still reads as placeholder art; final art is a M5+ concern.
- No persistence — closing the tab mid-run loses state. Acceptable for a single-sitting vertical slice.

## 12. Shipping

- Target: web build (itch.io) + generic static host.
- Build output: fully static `dist/` folder from `npm run build`.
- See the README's "Smoke-test checklist" and "Deployment" sections for the ship procedure.
- Post-release backlog: a second case, stronger notebook UX (search/filter), suspect behaviors, audio, real art, save/load.
