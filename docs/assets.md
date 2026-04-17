# Assets

Status of every asset used in the shipped build, where it came from, and how it's licensed. Anything not listed here does not exist in the build.

## Summary

The shipped slice is **entirely asset-free**. There are no image files, no audio files, no fonts under `public/` or `src/`. Every visible texture is drawn at runtime with Phaser graphics primitives; every typeface is a system font.

This is intentional for the vertical slice — it keeps the repo license-clean, keeps the bundle small (~1.5 MB, almost all of which is Phaser), and makes it impossible to ship something the project doesn't have rights to. Real art is a post-M4 concern.

## Runtime-generated textures

All three are generated in [`src/scenes/PreloadScene.ts`](../src/scenes/PreloadScene.ts) using `Phaser.GameObjects.Graphics` → `generateTexture(...)`.

| Texture key | Used for | Source |
| --- | --- | --- |
| `player` | The detective sprite | Procedurally drawn circle with a small directional indicator. |
| `evidence-icon` | Every lobby/office evidence hotspot | Procedurally drawn rect with a highlight. |
| `suspect-icon` | Each of the three suspects | Procedurally drawn humanoid silhouette, tinted per-suspect via `portraitTint` in `caseData.ts`. |

Replacing any of these with real art is a `this.load.image(key, path)` call in `PreloadScene` plus dropping a file under `public/assets/…`. The systems and UI layers don't know or care which one it is.

## Typography

- UI (panels, HUD, toasts, tabs): `Inter, system-ui, sans-serif`. Inter is used if the player happens to have it installed; otherwise `system-ui` falls back to the OS default sans.
- Narrative text (start overlay title, ending body): `Georgia, "Times New Roman", serif`.
- Monospace (kbd pills, evidence counts): `ui-monospace, monospace`.

No webfont is loaded. If we want Inter as a guaranteed render, the canonical move is to self-host `Inter-Variable.woff2` and add an `@font-face` in `src/styles/ui.css`. Inter is [OFL-1.1 licensed](https://github.com/rsms/inter/blob/master/LICENSE.txt) and safe to bundle.

## Colors (design tokens)

Defined as CSS custom properties at the top of [`src/styles/ui.css`](../src/styles/ui.css):

| Token | Hex | Role |
| --- | --- | --- |
| `--bg` | `#0e1116` | Page background |
| `--panel-bg` | `#161b22` | Panel fill |
| `--panel-border` | `#2c333d` | Panel / divider strokes |
| `--text` | `#e6edf3` | Primary body text |
| `--muted` | `#8b949e` | Secondary / label text |
| `--accent` | `#d0a656` | Evidence, suspect names, primary button |
| `--accent-soft` | `#3d3522` | Primary button fill |
| `--danger` | `#c9635a` | Contradictions, challenges, accusation |
| `--success` | `#6fb28a` | "Why this ending" ✓ rows |

These are the one place to change if a designer does a palette pass.

## What is NOT shipped

- No audio (no SFX, no music, no voice). The `AudioSystem` is a planned M5+ module.
- No character portraits. Suspect tints in `caseData.ts` are the full visual identity.
- No environment art. The "hotel lobby" and "back office" are drawn as grid-stroked dark rectangles in `InvestigationScene.drawEnvironment()`.
- No cursor / mouse art.
- No favicon. Browsers show the default.
- No particle / animation assets.

## Adding real art later

Suggested directory layout (matches spec):

```
public/
  assets/
    environment/   # floor tiles, walls, props
    characters/    # player + per-suspect portraits / idle frames
    ui/            # icons for clues, notebook, badges
    audio/         # ambient + sting
```

Integration points:

- `PreloadScene.ts` — load images/audio by key.
- `InvestigationScene.drawEnvironment()` — swap the `Graphics` rects for tilemaps or sprites.
- `InvestigationScene.buildInteractableSprite()` — change the `this.add.image(...)` key per evidence type.
- `caseData.ts` → `suspects[].portraitTint` — replace with a `portraitKey` pointing at a loaded image.

## License state

- Code: the repository license governs the code (see `LICENSE` if present; otherwise unlicensed = all rights reserved, default).
- Dependencies: Phaser (MIT), Vite (MIT), TypeScript (Apache-2.0). Listed in `package.json`.
- Content (dialogue, story, case): written for this project. Not derived from any external IP.
- Assets: **none shipped**, so no third-party asset license obligations apply to this build. That will change the moment real art or audio is added; add entries here with attribution + license when that happens.
