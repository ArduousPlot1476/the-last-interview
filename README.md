# The Last Interview

A short-form mystery investigation game. Move through a single location, interview a handful of suspects, collect evidence, compare clues to testimony, and make an accusation before time runs out.

This repo contains the **Milestone 3** vertical slice: a fully finishable investigation. The player moves through a hotel lobby + back office, gathers evidence, interviews three suspects through branching dialogue, presses them on their lies with collected evidence, and closes the case with a final accusation that resolves to one of three authored endings.

## Stack

- **Engine:** Phaser 3
- **Language:** TypeScript
- **Build / dev server:** Vite
- **UI:** DOM + CSS overlays for dialogue and notebook; Phaser for world/input.

## Prerequisites

- Node.js 18+ and npm.

## Install & run

```bash
npm install
npm run dev
```

Vite will start a dev server (default `http://127.0.0.1:5173`) and open it automatically. Edit any file under `src/` and it hot-reloads.

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
| Close any open panel | `Esc` |

A gold ring highlights the nearest interactable. Walk up to a suspect or evidence icon until the `[E] …` prompt appears, then press `E`.

## What you can do in Milestone 3

- Walk the hotel lobby and the back office (connected by a doorway).
- Inspect five evidence hotspots. Each adds a clue to the notebook and can unlock new conversation topics.
- Interview three suspects — Rosa, Ivy, and Desmond — each with authored, branching dialogue.
- Revisit suspects to unlock follow-up topics gated on evidence or prior testimony.
- When a suspect has said something the evidence contradicts, a red `⚑` challenge appears in their dialogue. Select it, pick the evidence you want to put on the table, and the suspect either breaks or stonewalls — only valid evidence changes the case.
- Once you have enough to move, the HUD reveals a **Make Accusation** button. Choose a suspect, review your dossier, and close the case. Three authored endings are possible: the strong correct conviction, the right suspect with an insufficient case, and a wrongful accusation.
- Track progress in the notebook: open leads, collected evidence, testimony (with `⚑ Challenged` badges on contradicted statements), and a running log of resolved contradictions.

A suggested 10–15 minute route to the strong ending:

1. Talk to Rosa at the reception counter — get opening statements.
2. Inspect the Reception Log, Coffee Cup, and Trash Bin in the lobby.
3. Return to Rosa and ask about the log; talk to Ivy about the coffee.
4. Head through the doorway to the back office. Inspect the Ledger and the Cabinet.
5. Confront Desmond about the ledger and the pen; hear his denial.
6. Show Ivy the torn note to establish motive; hear her source story.
7. Ask Rosa about Desmond's history with Vale.
8. Return to Desmond. Press him on the pen (confronting his denial of meeting) and on his claim that he didn't know Vale (with Rosa's testimony about the complaint).
9. When the accusation button lights up, accuse **Desmond**.

## Repo layout

```
src/
  main.ts                      # entry point; boots Phaser.Game
  game/config.ts               # Phaser config (scenes, canvas, physics)
  scenes/
    BootScene.ts               # sets the world up
    PreloadScene.ts            # generates placeholder textures
    InvestigationScene.ts      # playable scene
  entities/Player.ts           # top-down player with arcade physics
  systems/
    InteractionSystem.ts       # proximity tracking + E/Space dispatch
    NotebookStore.ts           # collected-clue state (session only)
    DialogueState.ts           # flags, heard topics, recorded testimony
    InvestigationState.ts      # facade + condition evaluator
  ui/
    DialoguePanel.ts           # line / choice / evidence-picker modes
    NotebookPanel.ts           # case, leads, suspects, clues, testimony, contradictions
    AccusationPanel.ts         # suspect pick → dossier → ending
  data/
    caseData.ts                # case, suspects, clue copy
    interactables.ts           # hotspot placements, walls, player spawn
    dialogue.ts                # DialogueTopic[] — the branching content
    objectives.ts              # Objective[] — open leads
    contradictions.ts          # Contradiction[] — M3 press-them-on-it
    endings.ts                 # Ending[] — M3 three outcomes
  types/
    game.ts                    # case/suspect/clue interfaces
    dialogue.ts                # dialogue, testimony, objective, condition
    contradiction.ts           # contradiction, evidence option, ending
  styles/ui.css                # overlay + HUD styling
docs/
  spec.md                      # current approved spec summary
  milestones.md                # milestone checklist
  architecture.md              # scene/system overview
```

## Roadmap

See [docs/milestones.md](docs/milestones.md) for the full milestone checklist. The short version:

- **Milestone 1:** Exploration, interaction shell, dialogue shell, notebook shell.
- **Milestone 2:** Branching dialogue with state flags; clues unlock new topics; notebook tracks leads + testimony.
- **Milestone 3 (this build):** Contradiction-resolution, accusation flow, three authored endings.
- **Milestone 4:** Polish, art, audio, ship-ready web build.
