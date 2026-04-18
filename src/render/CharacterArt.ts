import Phaser from "phaser";
import { THEME } from "./VisualTheme";

/**
 * Generates texture atlases for the player, suspects, evidence pip, and
 * shared FX assets (soft shadow, dust mote, glow dot). Called from the
 * PreloadScene once per game boot.
 */
export function buildTextures(scene: Phaser.Scene): void {
  buildPlayerTexture(scene);
  buildSuspectTexture(scene);
  buildEvidenceTexture(scene);
  buildShadowTexture(scene);
  buildDustTexture(scene);
  buildGlowTexture(scene);
}

function buildPlayerTexture(scene: Phaser.Scene): void {
  // 40x44 — a detective silhouette: trench coat, hat brim, warm accent
  const size = 44;
  const g = scene.add.graphics({ x: 0, y: 0 });
  const cx = size / 2;

  // Soft grounding shadow stroked into the texture itself so it travels
  // with the sprite. A second detached shadow is drawn in-world for depth.
  g.fillStyle(THEME.shadow, 0.25);
  g.fillEllipse(cx, size - 3, 26, 6);

  // Coat body — broad silhouette (wide at shoulders, tapered)
  g.fillStyle(THEME.playerCoat, 1);
  g.fillRoundedRect(cx - 12, 18, 24, 22, 4);
  // Coat highlight on the player's left (camera right)
  g.fillStyle(THEME.playerCoatHighlight, 0.9);
  g.fillRoundedRect(cx - 12, 18, 5, 22, 2);
  // Coat lapel V
  g.fillStyle(THEME.shadow, 0.6);
  g.fillTriangle(cx - 6, 18, cx + 6, 18, cx, 28);
  // Inner shirt
  g.fillStyle(THEME.playerShirt, 0.95);
  g.fillTriangle(cx - 3, 20, cx + 3, 20, cx, 26);
  // Belt / coat tie
  g.fillStyle(THEME.playerAccent, 1);
  g.fillRect(cx - 10, 34, 20, 2);

  // Head (skin tone)
  g.fillStyle(THEME.playerSkin, 1);
  g.fillCircle(cx, 14, 7);
  g.fillStyle(THEME.shadow, 0.2);
  g.fillCircle(cx - 2, 14, 7);

  // Hat brim — distinctive fedora silhouette
  g.fillStyle(0x0e1014, 1);
  g.fillEllipse(cx, 10, 22, 5);
  g.fillStyle(0x15181d, 1);
  g.fillRoundedRect(cx - 7, 4, 14, 7, 2);
  // Brass hatband
  g.fillStyle(THEME.playerAccent, 0.85);
  g.fillRect(cx - 7, 9, 14, 1);

  g.generateTexture("player", size, size);
  g.destroy();
}

function buildSuspectTexture(scene: Phaser.Scene): void {
  // 40x46 — neutral-colored coat silhouette meant to be tinted per suspect.
  // Face and shirt stay un-tinted enough that tints read as jacket color.
  const size = 46;
  const g = scene.add.graphics({ x: 0, y: 0 });
  const cx = size / 2;

  // Grounding shadow
  g.fillStyle(THEME.shadow, 0.22);
  g.fillEllipse(cx, size - 4, 28, 6);

  // Shoulders / coat (this is what tint colors)
  g.fillStyle(0xffffff, 1);
  g.fillRoundedRect(cx - 13, 20, 26, 22, 4);
  // Coat shoulder highlight (slightly brighter so tinted coat has variation)
  g.fillStyle(0xf5f5f5, 1);
  g.fillRoundedRect(cx - 13, 20, 8, 22, 3);
  // Coat shadow on opposite side
  g.fillStyle(0xbcbcbc, 1);
  g.fillRoundedRect(cx + 5, 20, 8, 22, 3);

  // Collar line
  g.fillStyle(0x4b4b4b, 0.6);
  g.fillTriangle(cx - 6, 20, cx + 6, 20, cx, 28);

  // Neck
  g.fillStyle(0xb89878, 1);
  g.fillRect(cx - 3, 16, 6, 6);

  // Head (warm skin, stays readable across tints)
  g.fillStyle(0xcc9f7a, 1);
  g.fillCircle(cx, 12, 8);
  // Hair silhouette (dark, so suspects feel formal)
  g.fillStyle(0x1a1414, 1);
  g.fillEllipse(cx, 7, 16, 8);
  g.fillRect(cx - 8, 7, 16, 5);

  g.generateTexture("suspect-icon", size, size);
  g.destroy();
}

function buildEvidenceTexture(scene: Phaser.Scene): void {
  // 36x36 — softer diamond with brass core and warm rim glow
  const size = 36;
  const g = scene.add.graphics({ x: 0, y: 0 });
  const cx = size / 2;
  const cy = size / 2;

  // Outer soft glow ring
  for (let r = 16; r >= 8; r -= 2) {
    const t = (r - 8) / 8;
    g.fillStyle(THEME.evidenceGlow, 0.08 * (1 - t) + 0.02);
    g.fillCircle(cx, cy, r);
  }

  // Diamond core
  g.fillStyle(THEME.evidenceCore, 1);
  g.beginPath();
  g.moveTo(cx, cy - 8);
  g.lineTo(cx + 8, cy);
  g.lineTo(cx, cy + 8);
  g.lineTo(cx - 8, cy);
  g.closePath();
  g.fillPath();

  // Inner facet highlight
  g.fillStyle(0xfff0c0, 0.9);
  g.beginPath();
  g.moveTo(cx, cy - 8);
  g.lineTo(cx + 4, cy - 1);
  g.lineTo(cx, cy + 2);
  g.lineTo(cx - 4, cy - 1);
  g.closePath();
  g.fillPath();

  // Rim stroke
  g.lineStyle(1, THEME.evidenceRim, 1);
  g.beginPath();
  g.moveTo(cx, cy - 8);
  g.lineTo(cx + 8, cy);
  g.lineTo(cx, cy + 8);
  g.lineTo(cx - 8, cy);
  g.closePath();
  g.strokePath();

  g.generateTexture("evidence-icon", size, size);
  g.destroy();
}

function buildShadowTexture(scene: Phaser.Scene): void {
  // Soft elliptical shadow for characters and key props
  const w = 40;
  const h = 14;
  const g = scene.add.graphics({ x: 0, y: 0 });
  for (let i = 0; i < 8; i++) {
    const t = i / 8;
    g.fillStyle(0x000000, 0.08 * (1 - t));
    g.fillEllipse(w / 2, h / 2, w * (1 - t * 0.35), h * (1 - t * 0.35));
  }
  g.generateTexture("fx-shadow", w, h);
  g.destroy();
}

function buildDustTexture(scene: Phaser.Scene): void {
  // Single soft dust mote — tiny warm circle with gentle falloff
  const size = 6;
  const g = scene.add.graphics({ x: 0, y: 0 });
  g.fillStyle(0xffd892, 0.5);
  g.fillCircle(size / 2, size / 2, 1.5);
  g.fillStyle(0xffd892, 0.2);
  g.fillCircle(size / 2, size / 2, 3);
  g.generateTexture("fx-dust", size, size);
  g.destroy();
}

function buildGlowTexture(scene: Phaser.Scene): void {
  // Reusable soft-glow circle used by lamps + highlight ring halo
  const size = 96;
  const g = scene.add.graphics({ x: 0, y: 0 });
  const cx = size / 2;
  for (let r = 48; r >= 8; r -= 4) {
    const t = r / 48;
    g.fillStyle(0xffffff, 0.16 * (1 - t) * (1 - t));
    g.fillCircle(cx, cx, r);
  }
  g.generateTexture("fx-glow", size, size);
  g.destroy();
}
