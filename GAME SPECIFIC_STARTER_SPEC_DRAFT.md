# Starter Spec Draft

## 1. Game overview
- Working title: The Last Interview
- Genre: narrative deduction / mystery investigation
- Platform: web desktop first
- Engine/framework: Phaser 3 + TypeScript + Vite
- Target audience: players who enjoy mystery, branching dialogue, and short replayable deduction games
- Target session length: 10–20 minutes

## 2. Core fantasy
The player should feel like a sharp investigator extracting truth from pressure, observation, and contradiction.

## 3. Core gameplay loop
- Moment-to-moment loop:
  - move through a small location
  - inspect interactable objects
  - interview suspects
  - collect statements and clues
  - compare evidence against testimony
- Mid-session loop:
  - unlock more information
  - identify contradictions
  - narrow suspicion
  - choose what to ask and what to present
- Long-term loop:
  - replay to reach different endings
  - improve investigation efficiency
  - discover alternate truth paths

## 4. Player verbs
- move
- inspect
- talk
- choose dialogue options
- collect clue
- review notes
- compare statement to evidence
- accuse
- restart / replay

## 5. Controls
- Keyboard:
  - WASD / arrow keys to move
  - E or Space to interact
  - Tab or I to open notebook
  - mouse for UI selection
- Controller: not required for v1
- Mobile: out of scope for v1

## 6. Camera and presentation
- Perspective: top-down or lightly angled 2D room-based view
- Resolution target: desktop browser first
- Art style: clean stylized 2D with strong readability
- Audio style: minimal ambient tension; optional UI and interaction sounds

## 7. Systems
- Movement / exploration:
  - one small navigable location with hotspots
- Interaction:
  - contextual interactions with doors, evidence, and NPCs
- Dialogue:
  - branching conversation choices
  - simple state-based line availability
- Evidence:
  - collectible clues stored in notebook/evidence board
- Deduction / contradiction:
  - player can present evidence against statements or mark suspicion
- Progression:
  - gain access to new lines/rooms/clues based on discovered info
- Scoring:
  - optional hidden score based on clue completeness and correctness
- Win/loss conditions:
  - win if the player identifies the culprit or reaches a strong outcome
  - soft fail if the accusation is wrong or evidence is insufficient
- UI/HUD:
  - notebook/evidence panel
  - active objective
  - dialogue UI
  - accusation/final decision screen

## 8. Content scope
### In scope for v1
- one location
- one mystery case
- 3 suspects
- 8–15 clues
- one notebook/evidence UI
- one accusation flow
- 2–3 endings
- placeholder art acceptable

### Explicitly out of scope
- combat
- open world
- procedural case generation
- full NPC schedules
- voice acting
- multiplayer
- creator tools
- live backend AI features

## 9. Assets
- Asset sources:
  - free / licensed 2D environment and character packs
  - placeholders acceptable
- Placeholder vs final assets:
  - placeholders allowed for environment, portraits, and UI
- Asset folder conventions:
  - `public/assets/environment/`
  - `public/assets/characters/`
  - `public/assets/ui/`
  - `public/assets/audio/`
- Naming conventions:
  - lowercase, hyphenated, descriptive

## 10. Technical architecture
- Project structure:
  - scenes, systems, ui, data, entities, types
- Main scenes/states:
  - boot
  - preload
  - main investigation scene
  - accusation / ending UI flow
- Data/config approach:
  - JSON or TS config-driven suspects, evidence, and dialogue
- Save system:
  - none required beyond in-session state for v1
- Input handling:
  - keyboard + mouse
- Collision/physics approach:
  - lightweight collision for room navigation only

## 11. Milestones
### Milestone 1
Goal: playable room exploration and interaction shell
Playable outcome:
- player moves through the location
- can interact with NPCs and evidence hotspots
Acceptance criteria:
- movement works reliably
- dialogue panel opens
- notebook UI opens
- at least 3 evidence hotspots function
Test procedure:
- run locally
- verify controls
- verify interactions
- verify notebook updates

### Milestone 2
Goal: conversation and clue state loop
Playable outcome:
- player can question suspects, unlock lines, and gather meaningful clues
Acceptance criteria:
- branching dialogue works
- state flags unlock new options
- evidence appears in notebook correctly
Test procedure:
- complete a partial investigation run
- verify clue/state persistence during session

### Milestone 3
Goal: contradiction and accusation resolution
Playable outcome:
- player can compare evidence to testimony and make a final accusation
Acceptance criteria:
- contradiction logic works for at least core paths
- accusation flow resolves to multiple endings
- run is finishable
Test procedure:
- complete at least one successful ending and one failed ending

### Milestone 4
Goal: polish and ship prep
Playable outcome:
- basic presentation, clarity, and tuning improvements
Acceptance criteria:
- no blocker bugs
- readable UI
- coherent objective flow
- clean web build
Test procedure:
- fresh run from clean install
- full playthrough
- quick external sanity test

## 12. Risks and unknowns
- dialogue structure may sprawl if not data-driven
- contradiction logic may become brittle if not clearly modeled
- exploration and UI balance may feel awkward
- asset readability may affect usability more than expected
- narrative content quality may bottleneck the build

## 13. Debugging plan
Use structured repro steps, screenshots, and notes after every milestone.
Ask Claude Code for:
- likely causes in priority order
- fastest discriminating checks
- scoped fix
- root cause
- prevention steps after the fix

## 14. Shipping plan
- repo/deploy target: web build, likely itch.io
- release checklist: see shipping checklist file
- backlog after first release:
  - second case
  - stronger notebook UX
  - better suspect behaviors
  - more branching endings
