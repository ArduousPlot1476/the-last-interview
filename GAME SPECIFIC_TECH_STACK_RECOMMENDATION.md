# Tech Stack Recommendation

## Recommended default
**Phaser 3 + TypeScript + Vite**

## Why this stack
This game is best served by:
- fast iteration,
- simple 2D scene management,
- lightweight UI overlays,
- easy web deployment,
- straightforward state and data-driven dialogue,
- lower implementation risk than a full 3D engine.

## Why not jump to something heavier
Avoid heavier stacks unless a specific requirement emerges:
- Godot is strong, but slower for web-first UI-heavy iteration if the project is primarily dialogue/evidence driven.
- Unity would be overkill for the first vertical slice.
- React-only can work for pure narrative UX, but Phaser gives better room for exploration, interaction hotspots, and future hybrid gameplay.

## Recommended supporting libraries / patterns
- JSON or TS config files for dialogue, evidence, suspects, and case data
- simple finite state handling for scene/game flow
- one central game state store
- one conversation system
- one evidence/case notebook system
- one accusation resolution system

## Repo shape
- `src/scenes/`
- `src/ui/`
- `src/systems/`
- `src/data/`
- `src/entities/`
- `src/types/`
- `public/assets/`

## Default deployment target
itch.io web build or simple static hosting after Milestone 3 or 4.
