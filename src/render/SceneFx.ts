import Phaser from "phaser";
import { DEPTH, LAYOUT, THEME } from "./VisualTheme";

/**
 * Lightweight atmospheric effects: vignette, dust motes, soft drop shadows,
 * lamp flicker, and idle-breathing tweens. Everything here is intentionally
 * cheap so the overall scene stays smooth in browser.
 */

export function drawVignette(scene: Phaser.Scene): Phaser.GameObjects.Graphics {
  const g = scene.add.graphics();
  g.setDepth(DEPTH.vignette);
  g.setScrollFactor(0);
  const w = 960;
  const h = 640;

  // Edge vignette drawn as nested rectangles with increasing alpha.
  // Cheaper than a radial gradient texture and matches the moody brief.
  const bands = 14;
  for (let i = 0; i < bands; i++) {
    const t = i / bands;
    const inset = (1 - t) * 160;
    const alpha = 0.05 * t * t;
    g.fillStyle(0x000000, alpha);
    g.fillRect(0, 0, w, inset); // top band
    g.fillRect(0, h - inset, w, inset); // bottom band
    g.fillRect(0, 0, inset, h); // left band
    g.fillRect(w - inset, 0, inset, h); // right band
  }

  // Corner deepening
  for (const [cx, cy] of [
    [0, 0],
    [w, 0],
    [0, h],
    [w, h]
  ]) {
    for (let r = 200; r >= 40; r -= 20) {
      const t = r / 200;
      g.fillStyle(0x000000, 0.05 * (1 - t));
      g.fillCircle(cx, cy, r);
    }
  }

  return g;
}

export function addDustMotes(scene: Phaser.Scene): Phaser.GameObjects.Particles.ParticleEmitter | null {
  if (!scene.textures.exists("fx-dust")) return null;
  const emitter = scene.add.particles(0, 0, "fx-dust", {
    x: { min: LAYOUT.room.x, max: LAYOUT.room.right },
    y: { min: LAYOUT.room.y + 20, max: LAYOUT.room.bottom - 20 },
    lifespan: { min: 6000, max: 10000 },
    speedY: { min: -8, max: -2 },
    speedX: { min: -4, max: 4 },
    scale: { start: 0.7, end: 0.1 },
    alpha: { start: 0.35, end: 0 },
    quantity: 1,
    frequency: 420,
    blendMode: Phaser.BlendModes.ADD
  });
  emitter.setDepth(DEPTH.dust);
  return emitter;
}

export function attachShadow(
  scene: Phaser.Scene,
  target: Phaser.GameObjects.Components.Transform & Phaser.GameObjects.GameObject,
  offsetY = 18,
  scale = 0.9
): Phaser.GameObjects.Image | null {
  if (!scene.textures.exists("fx-shadow")) return null;
  const shadow = scene.add.image((target as { x: number }).x, (target as { y: number }).y + offsetY, "fx-shadow");
  shadow.setDepth(DEPTH.shadow);
  shadow.setScale(scale);
  shadow.setAlpha(0.55);
  scene.events.on(Phaser.Scenes.Events.UPDATE, () => {
    if (!shadow.active || !(target as Phaser.GameObjects.GameObject).active) return;
    shadow.x = (target as unknown as { x: number }).x;
    shadow.y = (target as unknown as { y: number }).y + offsetY;
  });
  return shadow;
}

export function addIdleBob(
  scene: Phaser.Scene,
  target: Phaser.GameObjects.Components.Transform,
  amplitude = 1.5,
  durationMs = 2200
): Phaser.Tweens.Tween {
  const obj = target as unknown as { y: number };
  const baseY = obj.y;
  return scene.tweens.add({
    targets: target,
    y: baseY - amplitude,
    duration: durationMs,
    ease: "Sine.easeInOut",
    yoyo: true,
    repeat: -1
  });
}

export function addLampFlicker(
  scene: Phaser.Scene,
  lamp: Phaser.GameObjects.GameObject & Phaser.GameObjects.Components.AlphaSingle
): void {
  scene.tweens.add({
    targets: lamp,
    alpha: { from: 0.92, to: 1 },
    duration: 1700,
    yoyo: true,
    repeat: -1,
    ease: "Sine.easeInOut"
  });
  // Occasional brief dip to sell the flicker
  scene.time.addEvent({
    delay: 5400,
    loop: true,
    callback: () => {
      scene.tweens.add({
        targets: lamp,
        alpha: 0.7,
        duration: 80,
        yoyo: true,
        repeat: 1,
        ease: "Quad.easeOut"
      });
    }
  });
}

export function addDoorwayPulse(
  scene: Phaser.Scene,
  doorwayGlow: Phaser.GameObjects.Graphics
): void {
  scene.tweens.add({
    targets: doorwayGlow,
    alpha: { from: 0.85, to: 1 },
    duration: 2400,
    yoyo: true,
    repeat: -1,
    ease: "Sine.easeInOut"
  });
}

export function addHotspotHalo(
  scene: Phaser.Scene,
  x: number,
  y: number
): Phaser.GameObjects.Image | null {
  if (!scene.textures.exists("fx-glow")) return null;
  const halo = scene.add.image(x, y, "fx-glow");
  halo.setDepth(DEPTH.lightPool);
  halo.setBlendMode(Phaser.BlendModes.ADD);
  halo.setAlpha(0.3);
  halo.setScale(0.55);
  halo.setTint(THEME.amberGlow);
  scene.tweens.add({
    targets: halo,
    scale: 0.7,
    alpha: 0.18,
    duration: 1800,
    yoyo: true,
    repeat: -1,
    ease: "Sine.easeInOut"
  });
  return halo;
}
