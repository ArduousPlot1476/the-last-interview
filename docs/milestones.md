# Milestones

## Milestone 1 — Exploration & interaction shell ✓

**Goal:** playable room exploration and interaction shell.

**Checklist**

- [x] Phaser 3 + TypeScript + Vite project compiles and runs.
- [x] One playable scene with a hotel lobby and a back office.
- [x] Top-down player movement (WASD / arrows) with wall collision.
- [x] At least 3 evidence hotspots in the world (shipped with 5).
- [x] At least 3 suspect interaction points (shipped with 3).
- [x] Proximity-based interaction using `E` / `Space`.
- [x] Dialogue panel opens/closes for suspects.
- [x] Notebook panel opens with `Tab` and lists collected clues.
- [x] At least 3 clues collectable in one run.
- [x] No blocker runtime errors during a short play session.
- [x] Docs: README, spec, milestones, architecture.

---

## Milestone 2 — Conversation & clue state loop ✓

**Goal:** branching dialogue and meaningful clue gating.

**Checklist**

- [x] Dialogue data model: topics with `requires`/`records`/`setsFlags`.
- [x] State flags set by dialogue and evidence discovery.
- [x] Choice UI in the dialogue panel (topic list, heard markers, Leave).
- [x] Clues unlock new topics (at least three unlocks gated on evidence/flags).
- [x] Notebook shows evidence + testimony + open leads as distinct sections.
- [x] HUD surfaces the next open lead.

---

## Milestone 3 — Contradiction & accusation ✓

**Goal:** present evidence against testimony, resolve contradictions, and close the case with one of three endings.

**Case canon (locked at M3, unchanged in M4):**

- Culprit: Desmond Lark.
- Two critical contradictions (both against Desmond): the broken fountain pen (proves he met Vale after check-in) and Rosa's year-old complaint (proves he knew Vale personally).
- One supporting contradiction (against Ivy, non-critical): the torn note.
- Strong ending gate: both critical contradictions resolved **and** the `vale-investigating-desmond` flag set.

**Checklist**

- [x] Authored `Contradiction` model (`src/types/contradiction.ts`).
- [x] ≥3 contradictions, ≥2 marked `critical` (`src/data/contradictions.ts`).
- [x] Contradictions surface as dialogue choices once their target testimony has been heard.
- [x] Evidence picker (clues + testimony) in the dialogue panel; valid evidence plays success lines, anything else plays failure lines and leaves state untouched.
- [x] Resolved contradictions are recorded; challenged testimony is flagged in the notebook.
- [x] Accusation button appears in the HUD once the threshold is met (openings heard + 3 clues + ≥1 critical contradiction resolved).
- [x] Three authored endings: Justice (Desmond + strong case), Insufficient (Desmond + weak case), Wrong (any other accused suspect).
- [x] Restart button on the ending screen reloads the session.
- [x] Run is reliably finishable in 10–20 minutes.

---

## Milestone 4 — Polish & ship prep (current build) ✓

**Goal:** clean, readable, ship-ready web build. No new gameplay scope.

**Checklist**

- [x] **Notebook UX pass:** four tabs (Leads, Evidence, Testimony, Case), a persistent progress strip (clues / testimony / contradictions / accusation readiness), and testimony grouped by suspect with per-group challenged counts.
- [x] **Contradiction clarity:**
  - Challenge choices rendered in their own "Challenges" group in dialogue, with a red `⚑ CHALLENGE` tag; regular topics tagged `ASK` / `✓ ASKED`.
  - Contradicted testimony dimmed and struck-through in the notebook, with a `⚑ Challenged` badge.
  - Resolved critical contradictions visually distinct from supporting ones in the notebook.
- [x] **Ending summary clarity:** every ending screen opens with a "Why this ending" checklist — what was hit and what was missed (accused the right person? both critical contradictions? motive?). Reading it answers "what would I change next run?".
- [x] **Friction fixes:**
  - Repeat-visit greeting fatigue removed (`DialogueState.hasGreetedSuspect`).
  - Toast burst handling: stacked toasts instead of a single element that gets clobbered on rapid events.
  - Input/focus: notebook `Tab`/`I` and help `H` are gated while any other overlay is open; `Esc` unwinds the top overlay.
- [x] **Onboarding / clarity:**
  - Start overlay on load with pitch, controls, and a Begin button (dismisses on click / `Enter` / `Space`).
  - In-game help panel (`H`) with controls and a short "how investigating works" section.
  - HUD controls hint updated to include `H`.
  - Objective HUD text now says "All leads resolved. When you are ready, press Make Accusation." once the case is accusable.
- [x] **Docs refresh:** README, spec.md, milestones.md, architecture.md updated to match shipped state; new `docs/assets.md`, `docs/bugs.md`, `docs/playtest-notes.md`.
- [x] **Release / shipping:** smoke-test checklist and static + itch.io deployment instructions in the README.
- [x] **Build health:** `npm run typecheck` clean, `npm run build` clean.

**Test procedure (M4-specific)**

- From a fresh session: the start overlay appears. Dismiss it with Enter.
- Open the notebook before doing anything — it renders; progress strip reads `0/5 · 0 · 0/3 (crit 0/2) · Locked`.
- Play the Insufficient run: grab three lobby clues, hear the openings, resolve one critical contradiction (pen OR complaint). Accuse Desmond. Ending shows "Why this ending" with one hit (named Desmond) and two misses.
- Refresh. Play the Justice run per the README route. Ending shows all three hits.
- Refresh. Accuse Ivy from the thinnest viable state. Ending shows one miss row naming Desmond as the real culprit.
- Verify repeat suspect visits skip the greeting.
- Verify quickly picking up a clue → then recording testimony produces two stacked toasts, not one.

**Not in M4 (explicit non-goals)**

- Real character or environment art.
- Audio / ambient sound.
- A second case, new suspects, new clues, new endings.
- Save / load; localStorage persistence.
- Mobile / touch / gamepad support.
