# Repo Support Files to Ask Claude Code to Generate

These are useful files to have Claude Code create early in the repo.

## Recommended files
- `README.md`
  - what the game is
  - how to run it
  - controls
  - milestone status

- `docs/spec.md`
  - latest approved game spec

- `docs/milestones.md`
  - milestone checklist and acceptance criteria

- `docs/assets.md`
  - asset inventory, source, license, and where each asset is used

- `docs/bugs.md`
  - bug log with repro steps and resolutions

- `docs/architecture.md`
  - current scene structure, systems, data flow, and known tradeoffs

- `docs/playtest-notes.md`
  - chronological playtest notes and tuning changes

## Prompt to generate them
Create lightweight documentation files for this repo:
- README.md
- docs/spec.md
- docs/milestones.md
- docs/assets.md
- docs/bugs.md
- docs/architecture.md
- docs/playtest-notes.md

Use the current project state and keep them concise, practical, and developer-friendly. Do not invent completed features. Mark unknowns clearly.
