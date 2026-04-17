# The Last Interview

> A ten-to-twenty-minute mystery investigation you can finish in one sitting. You are the detective on call at the Meridian Hotel. A journalist is dead in Suite 409. Three people were close enough to do it, one of them did, and you have a single shift to prove which.

## Pitch

Walk a small, authored location. Collect evidence. Interview three suspects with branching dialogue gated on what you've actually found. When one of them has said something the evidence contradicts, press them on it — pick the right item from your notebook and their story breaks. When the **Make Accusation** button lights up, name the killer. How strong your case is at that moment decides which of three endings you close on.

## Stack

- **Engine:** Phaser 3
- **Language:** TypeScript (strict)
- **Build / dev server:** Vite
- **UI:** DOM + CSS overlays for dialogue, notebook, and accusation; Phaser for the world and input.
- **Runtime:** desktop web browser, keyboard + mouse.

## Prerequisites

- Node.js 18+ and npm.

## Install & run

```bash
npm install
npm run dev
```

Vite starts a dev server (default `http://127.0.0.1:5173`) and opens it automatically. Files under `src/` hot-reload.

Other scripts:

```bash
npm run typecheck   # strict TS check, no emit
npm run build       # typecheck + production bundle into dist/
npm run preview     # serve the production bundle locally
```

## Controls

| Action | Keys |
| --- | --- |
| Move | `W` `A` `S` `D` or arrow keys |
| Interact / advance dialogue | `E` or `Space` |
| Open / close notebook | `Tab` or `I` |
| Toggle help | `H` |
| Close any open panel | `Esc` |

A gold ring highlights the nearest interactable. Walk up to a suspect or evidence icon until the `[E] …` prompt appears, then press `E`.

The start screen recaps the controls. Press the button (or `Enter` / `Space`) to begin.

## What you do in the shipped build

- Walk the hotel lobby and the back office (connected by a doorway).
- Inspect five evidence hotspots. Each adds a clue to the notebook and can unlock new conversation topics.
- Interview three suspects — Rosa, Ivy, and Desmond — each with authored, branching dialogue. Repeat visits skip the greeting and drop you straight into their list of topics.
- Revisit suspects to unlock follow-up topics gated on evidence or prior testimony.
- When a suspect has said something the evidence contradicts, a red `⚑ CHALLENGE` option appears in their dialogue. Pick it, choose the item that breaks their story, and the suspect either breaks or stonewalls. Only the right evidence changes state.
- Open the notebook at any time (`Tab`) — it's now tabbed: **Leads**, **Evidence**, **Testimony** (grouped by suspect with a `⚑ Challenged` badge on statements you've already broken), and **Case**. A progress strip across the top shows clues-collected, testimony recorded, contradictions resolved (total and critical), and whether the accusation is unlocked yet.
- When the **Make Accusation** button unlocks, name a suspect, review the dossier of what you've built, and close the case. The ending screen starts with a short **Why this ending** checklist — what you got and what you missed — before the narrative outcome.

### Suggested 10–15 minute route to the strong ending

1. Talk to Rosa at the reception counter — get opening statements.
2. Inspect the Reception Log, Coffee Cup, and Trash Bin in the lobby.
3. Return to Rosa and ask about the log; talk to Ivy about the coffee.
4. Head through the doorway to the back office. Inspect the Ledger and the Cabinet.
5. Ask Desmond where he was and about the ledger; hear his denials.
6. Show Ivy the torn note to establish motive; hear her source story.
7. Ask Rosa about Desmond's history with Vale.
8. Return to Desmond. Challenge him on the pen, then on his claim that he didn't know Vale.
9. When the accusation button lights up, accuse **Desmond**.

## Endings

There are three authored endings. The ending screen labels **why** you got it; read the checklist and you'll know what to change next run.

- **Justice** — you accuse Desmond with a complete case (both critical contradictions resolved, motive established).
- **The Right Name, The Wrong Case** — you accuse Desmond but the case is incomplete: one of the critical contradictions isn't broken, or motive isn't established.
- **A Name Spoken In Error** — you accuse anyone who isn't Desmond.

## Repo layout

```
src/
  main.ts                      # entry point; boots Phaser.Game
  game/config.ts               # Phaser config (scenes, canvas, physics)
  scenes/
    BootScene.ts               # bootstrap
    PreloadScene.ts            # generates placeholder textures
    InvestigationScene.ts      # playable scene (inputs, UI wiring, toast stack,
                               #   start overlay, help panel)
  entities/Player.ts           # top-down player with arcade physics
  systems/
    InteractionSystem.ts       # proximity tracking + E/Space dispatch
    NotebookStore.ts           # collected-clue state (session only)
    DialogueState.ts           # flags, heard topics, testimony,
                               #   resolved contradictions, greeted suspects
    InvestigationState.ts      # facade + condition evaluator + endings
  ui/
    DialoguePanel.ts           # lines / challenge+question groups / evidence picker
    NotebookPanel.ts           # tabbed notebook + progress strip
    AccusationPanel.ts         # pick → dossier → ending (with "why" checklist)
  data/
    caseData.ts                # case, suspects, clue copy
    interactables.ts           # hotspot placements, walls, player spawn
    dialogue.ts                # DialogueTopic[] — the branching content
    objectives.ts              # Objective[] — open leads
    contradictions.ts          # Contradiction[]
    endings.ts                 # Ending[]
  types/
    game.ts                    # case/suspect/clue interfaces
    dialogue.ts                # dialogue, testimony, objective, condition
    contradiction.ts           # contradiction, evidence option, ending
  styles/ui.css                # overlay, HUD, tabs, toast stack, start overlay
docs/
  spec.md                      # current approved spec summary
  milestones.md                # milestone checklist (M1–M4)
  architecture.md              # scene/system overview
  assets.md                    # asset status / sourcing / license
  bugs.md                      # known issues and fixes
  playtest-notes.md            # shipped-state playtest summary
```

## Smoke-test checklist (run before tagging a release)

Run `npm run dev` and walk through this list end-to-end:

- [ ] The start overlay shows on load. Clicking **Begin the Investigation** (or pressing `Enter`) dismisses it and the player can move.
- [ ] Movement: `WASD` and arrow keys both move; the player collides with walls; diagonal speed is not faster than cardinal.
- [ ] Gold ring appears over the nearest interactable and the `[E]` prompt text shows above it.
- [ ] Inspecting an evidence hotspot produces a **Clue added** toast and marks the hotspot as consumed (dimmed, no re-trigger).
- [ ] Talking to a suspect opens the dialogue panel; first visit shows the greeting; a **second** visit in the same run skips the greeting and lands on the choice list.
- [ ] Choice list shows two labelled groups when a challenge is available: **Challenges** (red, with `⚑ CHALLENGE`) and **Questions** (with `ASK` / `✓ ASKED` tags).
- [ ] Presenting correct evidence plays success lines; incorrect evidence plays failure lines and leaves state untouched.
- [ ] The notebook (`Tab`) opens; all four tabs render; the progress strip numbers update live as you play.
- [ ] The **Testimony** tab groups by suspect and badges contradicted statements with `⚑ Challenged`.
- [ ] The HUD **Make Accusation** button appears once the threshold is met. It cannot be opened while another panel is open.
- [ ] `H` opens the help panel. `Esc` closes any overlay. Notebook toggles cleanly with `Tab`/`I`.
- [ ] Rapid events (e.g. a contradiction that also records new testimony) produce multiple stacked toasts rather than clobbering each other.
- [ ] Play three full runs:
  - [ ] Thin case against Desmond → **Insufficient** ending. "Why" checklist shows two misses.
  - [ ] Complete case against Desmond → **Justice** ending. "Why" checklist shows all hits.
  - [ ] Accuse Rosa or Ivy → **Wrong** ending named with the accused's name.
- [ ] Restart button on the ending screen reloads the page and starts fresh.
- [ ] `npm run typecheck` passes.
- [ ] `npm run build` completes with no errors (Tailwind content warning is from a global install and can be ignored).
- [ ] No uncaught errors in the browser console during a 10-minute playthrough.

## Deployment

The production build outputs a fully static site to `dist/`. Deploy it as-is to any static host.

### Generic static host (Netlify, Cloudflare Pages, GitHub Pages, S3, Vercel static)

```bash
npm run build
# upload the contents of dist/ to the host
```

Nothing in the bundle expects a server. There are no environment variables, no API, no cookies.

### itch.io (HTML5 web build)

itch expects a zip of the site rooted at `index.html`.

```bash
npm run build
cd dist
# zip the CONTENTS of dist (not the folder) — index.html must be at the zip root
# on macOS/linux:  zip -r ../the-last-interview.zip .
# on Windows (PowerShell):  Compress-Archive -Path * -DestinationPath ..\the-last-interview.zip
```

In the itch.io project settings:

1. Kind of project: **HTML**.
2. Upload `the-last-interview.zip` and tick **This file will be played in the browser**.
3. Viewport size: **960 × 640** (matches the Phaser canvas).
4. Embed options: tick **Mobile friendly: no** and **Automatically start on page load: yes** if you prefer.
5. Save & view page.

If the page loads but the game doesn't draw, the usual cause is a wrong zip root (index.html must be at the top level, not inside a folder).

## Roadmap

See [docs/milestones.md](docs/milestones.md). Short version:

- **Milestone 1:** exploration + interaction shell + dialogue shell + notebook shell. ✓
- **Milestone 2:** branching dialogue + clue-driven unlocks + lead layer. ✓
- **Milestone 3:** contradiction resolution + accusation flow + three endings. ✓
- **Milestone 4 (this build):** polish pass — notebook tabs, contradiction and ending clarity, start/help overlays, toast stack, docs, shippable static build.

Out-of-scope next steps (not promised): real art, a second case, save/load, audio.
