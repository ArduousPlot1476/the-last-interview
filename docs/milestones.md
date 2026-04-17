# Milestones

## Milestone 1 — Exploration & interaction shell (current build)

**Goal:** playable room exploration and interaction shell.

**Checklist**

- [x] Phaser 3 + TypeScript + Vite project compiles and runs.
- [x] One playable scene with a hotel lobby and a back office.
- [x] Top-down player movement (WASD / arrows) with wall collision.
- [x] At least 3 evidence hotspots in the world (currently 5).
- [x] At least 3 suspect interaction points (currently 3).
- [x] Proximity-based interaction using `E` / `Space`.
- [x] Dialogue panel opens/closes for suspects (placeholder lines).
- [x] Notebook panel opens with `Tab` and lists collected clues.
- [x] At least 3 clues collectable in one run.
- [x] No blocker runtime errors during a short play session.
- [x] Docs: README, spec, milestones, architecture.

**Test procedure**

1. `npm install && npm run dev`.
2. Walk the lobby and back office with WASD / arrows.
3. Approach each hotspot and press `E` — clue should be logged.
4. Press `Tab` — notebook shows the new clues.
5. Talk to each suspect — dialogue panel opens, advances, closes.
6. Verify no console errors during a 3–5 minute playtest.

---

## Milestone 2 — Conversation & clue state loop (current build)

**Goal:** branching dialogue and meaningful clue gating.

**Checklist**

- [x] Dialogue data model: topics with `requires`/`records`/`setsFlags`.
- [x] State flags set by dialogue and evidence discovery.
- [x] Choice UI in the dialogue panel (topic list, heard markers, Leave).
- [x] Clues unlock new topics (at least three unlocks gated on evidence/flags).
- [x] Notebook shows evidence + testimony + open leads as distinct sections.
- [x] HUD surfaces the next open lead.

**Test procedure**

- Run the dev server, start a fresh session.
- Confirm M1 movement/interaction still works.
- Talk to each suspect, verify topic choices appear.
- Collect clues, verify new topics unlock on revisit (e.g. Rosa's log topic after finding the reception log; Desmond's pen topic after the cabinet).
- Open notebook, verify leads/clues/testimony all populate and update live.
- Complete a partial run where testimony unlocks further testimony (Ivy → Desmond).

---

## Milestone 3 — Contradiction & accusation (current build)

**Goal:** present evidence against testimony, resolve contradictions, and close the case with one of three endings.

**Case canon (locked at M3):**

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

**Test procedure**

- From a fresh session, ignore the office entirely, talk only to Rosa and Ivy, grab 3 lobby clues, then accuse Desmond → Insufficient ending.
- Full path: collect all 5 clues, hear all opening topics, press Desmond with the pen and Rosa's complaint testimony, reach Ivy's source admission (and thereby the `vale-investigating-desmond` flag) → Justice ending.
- Fresh session, accuse Rosa or Ivy → Wrong ending with the accused's name.

---

## Milestone 4 — Polish & ship prep

**Goal:** clean, readable, ship-ready web build.

**Checklist**

- [ ] No blocker bugs.
- [ ] HUD / notebook / dialogue UX passes a usability pass.
- [ ] Coherent objective flow; player never stuck.
- [ ] Clean production build deployed (itch.io target).
- [ ] External sanity playtest pass.
