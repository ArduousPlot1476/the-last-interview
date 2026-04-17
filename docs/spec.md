# The Last Interview — Spec Summary (Approved)

Condensed from `GAME SPECIFIC_STARTER_SPEC_DRAFT.md`. This doc is the single source of truth that the code is written against; the starter draft is the full, unabridged reference.

## 1. Game overview

- Working title: **The Last Interview**
- Genre: narrative deduction / mystery investigation
- Platform: web desktop first
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
6. Mark contradictions or grow suspicion.
7. Decide who to accuse.
8. See an ending based on investigation quality.

## 4. Player verbs

move · inspect · talk · choose dialogue options · collect clue · review notes · compare statement to evidence · accuse · replay

## 5. Controls

- **Move:** WASD / arrow keys
- **Interact:** `E` or `Space`
- **Notebook:** `Tab` or `I`
- **Close panel:** `Esc`
- Mouse for UI selection; no controller/mobile in v1.

## 6. Presentation

- Top-down or lightly angled 2D, room-based view.
- Desktop browser first; stylized 2D, clean and readable.
- Minimal ambient tension; optional UI/interaction sounds.

## 7. Systems in scope (v1)

- Movement / exploration over one small location with hotspots.
- Contextual interaction with doors, evidence, and NPCs.
- Branching dialogue with topic choices gated on clues / flags / prior testimony. *(M2 ✓)*
- Evidence collection into a single notebook. *(M1 ✓)*
- Testimony model: recorded statements keyed by ID, grouped by suspect. *(M2 ✓)*
- Objective / lead layer: open leads with visibility + completion gates, surfaced in HUD and notebook. *(M2 ✓)*
- Deduction / contradiction: present evidence against statements. *(M3 ✓)*
- Progression: state-gated access to new lines/clues. *(M2 ✓)*
- Optional hidden scoring on completeness and correctness. *(M4)*
- Win / soft-fail on accusation. *(M3 ✓)*
- UI/HUD: notebook, active objective, dialogue UI, accusation screen. *(M3 ✓)*

## 8. Content scope (v1)

**In scope:** one location, one case, 3 suspects, 8–15 clues, one notebook, one accusation flow, 2–3 endings, placeholder art acceptable.

**Out of scope:** combat, open world, procedural cases, NPC schedules, voice acting, multiplayer, creator tools, live AI backends.

## 9. Assets

- Free / licensed 2D packs; placeholders acceptable.
- Folders: `public/assets/environment/`, `characters/`, `ui/`, `audio/`.
- Naming: lowercase, hyphenated, descriptive.

## 10. Technical architecture

- Structure: `scenes`, `systems`, `ui`, `data`, `entities`, `types`.
- Scenes: boot, preload, main investigation, accusation / ending flow.
- Data-driven: TS config for suspects, evidence, dialogue.
- Save: none beyond in-session state.
- Input: keyboard + mouse.
- Collision: lightweight for navigation only.

## 11. Risks

- Dialogue sprawl without a data-driven structure.
- Brittle contradiction logic if not explicitly modeled.
- Exploration + UI balance.
- Asset readability affecting usability.
- Narrative content quality bottlenecking the build.

## 12. Shipping

- Target: web build (likely itch.io).
- Release checklist kept in the shipping checklist file.
- Post-release backlog: second case, stronger notebook UX, suspect behaviors, more endings.
