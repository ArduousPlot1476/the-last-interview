# First Claude Code Handoff Prompt Template

Objective:
Implement Milestone 1 of a small mystery investigation vertical slice. Create a playable exploration-and-interaction shell for the game.

Project context:
- We are building a web-first 2D mystery investigation game called The Last Interview.
- The game is a small vertical slice: one location, one case, three suspects, clue collection, and accusation flow later.
- Current milestone is Milestone 1: movement, room interaction shell, dialogue shell, and notebook shell.
- Stack: Phaser 3 + TypeScript + Vite.
- Architecture should stay simple and readable because later milestones will add clue state, dialogue branching, and accusation logic.
- Placeholder assets are acceptable.

Constraints:
- Keep scope limited to Milestone 1.
- Do not implement full contradiction logic, accusation resolution, or multiple endings yet.
- Do not build unnecessary meta systems.
- Prefer small, testable diffs.
- Use data-driven structures where it clearly reduces future rework, but do not overengineer.

Implementation tasks:
1. Set up the Phaser + TypeScript + Vite project structure for this game if it does not already exist.
2. Create one playable investigation scene with:
   - player movement,
   - simple collision / navigation boundaries,
   - at least three evidence hotspots,
   - three suspect interaction points or NPC stand-ins.
3. Implement a simple interaction system so the player can press a key near a hotspot or suspect.
4. Implement a dialogue panel shell that can open and display placeholder suspect dialogue.
5. Implement a notebook / evidence UI shell that can open and list collected clues.
6. Add at least three collectible clues that populate the notebook when found.
7. Keep code organized into clear folders and files so later milestones can extend the systems cleanly.

Acceptance criteria:
- The project runs locally.
- The player can move around the location.
- The player can interact with suspect points and evidence hotspots.
- A dialogue panel opens for suspect interactions.
- A notebook/evidence panel opens and displays collected clues.
- At least three clues can be collected in one run.
- The build is stable enough for a short playtest.

Test procedure:
- Install dependencies and run the local dev server.
- Verify keyboard movement works reliably.
- Verify the interaction key works near suspects and evidence hotspots.
- Verify the dialogue panel opens and closes.
- Verify collected clues appear in the notebook.
- Verify there are no blocker runtime errors for a basic play session.

When done, report back with:
1. files created/edited
2. summary of implementation
3. assumptions made
4. known issues / follow-ups
5. exact local run/test steps
