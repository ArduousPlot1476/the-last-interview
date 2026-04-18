import Phaser from "phaser";
import { DEPTH, LAYOUT, THEME } from "./VisualTheme";

/**
 * Draws the layered hotel environment — floors, rugs, walls, trim, and set
 * dressing — into the scene. Returns handles for elements the scene needs to
 * animate (lamp flicker, doorway glow), so the scene owns lifecycle but the
 * look is centralized here.
 */
export interface EnvironmentHandles {
  lamps: Phaser.GameObjects.Graphics[];
  doorwayGlow: Phaser.GameObjects.Graphics;
}

export function drawEnvironment(scene: Phaser.Scene): EnvironmentHandles {
  drawFloors(scene);
  drawRugs(scene);
  drawWalls(scene);
  drawLobbyDressing(scene);
  const handles = drawOfficeDressing(scene);
  const doorwayGlow = drawDoorway(scene);
  drawSignage(scene);
  return { lamps: handles.lamps, doorwayGlow };
}

function drawFloors(scene: Phaser.Scene): void {
  const g = scene.add.graphics();
  g.setDepth(DEPTH.floor);

  // Lobby base
  g.fillStyle(THEME.lobbyFloor, 1);
  g.fillRect(LAYOUT.lobby.x, LAYOUT.lobby.y, LAYOUT.lobby.width, LAYOUT.lobby.height);
  // Office base (slightly cooler)
  g.fillStyle(THEME.officeFloor, 1);
  g.fillRect(LAYOUT.office.x, LAYOUT.office.y, LAYOUT.office.width, LAYOUT.office.height);

  // Parquet planks — wide alternating strips across both rooms
  const plankH = 36;
  for (let y = LAYOUT.room.y; y < LAYOUT.room.bottom; y += plankH) {
    const row = Math.floor((y - LAYOUT.room.y) / plankH);
    const isLobbyStripe = row % 2 === 0;
    g.fillStyle(isLobbyStripe ? THEME.lobbyFloorPlank : THEME.lobbyFloor, isLobbyStripe ? 0.55 : 0);
    if (isLobbyStripe) {
      g.fillRect(LAYOUT.lobby.x, y, LAYOUT.lobby.width, plankH);
    }

    const isOfficeStripe = row % 2 === 1;
    if (isOfficeStripe) {
      g.fillStyle(THEME.officeFloorPlank, 0.55);
      g.fillRect(LAYOUT.office.x, y, LAYOUT.office.width, plankH);
    }
  }

  // Thin seam lines for parquet grain
  g.lineStyle(1, 0x090c12, 0.5);
  for (let y = LAYOUT.room.y + plankH; y < LAYOUT.room.bottom; y += plankH) {
    g.lineBetween(LAYOUT.lobby.x, y, LAYOUT.lobby.x + LAYOUT.lobby.width, y);
    g.lineBetween(LAYOUT.office.x, y, LAYOUT.office.x + LAYOUT.office.width, y);
  }

  // Subtle warm gradient band near the lobby entrance/right side — implied
  // pool of light from somewhere off-screen
  drawSoftGlow(scene, 325, 360, 260, 0xffb860, 0.045, DEPTH.floorOverlay);
  drawSoftGlow(scene, 795, 360, 200, 0xffb860, 0.04, DEPTH.floorOverlay);
}

function drawRugs(scene: Phaser.Scene): void {
  const g = scene.add.graphics();
  g.setDepth(DEPTH.rug);

  // Lobby lounge rug under the armchair / coffee area
  drawRug(g, 270, 430, 260, 140, THEME.rugDeep, THEME.rugMid, THEME.rugGold);

  // Smaller runner under the reception foot area
  drawRug(g, 110, 170, 220, 70, THEME.rugDeep, THEME.rugMid, THEME.rugGold, 0.8);

  // Office rug under the desk
  drawRug(g, 715, 150, 170, 100, 0x1e1a28, 0x2a2338, THEME.brassDeep, 0.9);
}

function drawRug(
  g: Phaser.GameObjects.Graphics,
  x: number,
  y: number,
  w: number,
  h: number,
  deep: number,
  mid: number,
  trim: number,
  alpha = 1
): void {
  g.fillStyle(deep, 0.78 * alpha);
  g.fillRoundedRect(x, y, w, h, 6);
  g.fillStyle(mid, 0.55 * alpha);
  g.fillRoundedRect(x + 10, y + 8, w - 20, h - 16, 4);
  g.lineStyle(1, trim, 0.55 * alpha);
  g.strokeRoundedRect(x + 6, y + 4, w - 12, h - 8, 5);
  g.strokeRoundedRect(x + 14, y + 12, w - 28, h - 24, 3);
}

function drawWalls(scene: Phaser.Scene): void {
  const g = scene.add.graphics();
  g.setDepth(DEPTH.wallBack);

  // Top wall band (back wall of the room)
  g.fillStyle(THEME.wallDark, 1);
  g.fillRect(0, 0, 960, LAYOUT.room.y);
  g.fillStyle(THEME.wallMid, 1);
  g.fillRect(0, 0, 960, 30);

  // Decorative brass trim line along the top of the back wall
  g.fillStyle(THEME.brassDeep, 0.9);
  g.fillRect(0, LAYOUT.room.y - 6, 960, 2);
  g.fillStyle(THEME.brass, 0.6);
  g.fillRect(0, LAYOUT.room.y - 4, 960, 1);

  // Wainscoting panels across the back wall
  const panelW = 60;
  g.lineStyle(1, THEME.wallTrimDark, 0.8);
  for (let x = 10; x < 950; x += panelW) {
    g.strokeRoundedRect(x, 18, panelW - 10, 48, 2);
  }

  // Outer walls (sides + bottom) — subtle so they don't compete
  g.fillStyle(THEME.wallDark, 1);
  g.fillRect(0, LAYOUT.room.y, LAYOUT.room.x, 520); // left
  g.fillRect(LAYOUT.room.right, LAYOUT.room.y, 960 - LAYOUT.room.right, 520); // right
  g.fillRect(0, LAYOUT.room.bottom, 960, 640 - LAYOUT.room.bottom); // bottom

  // Inner divider wall (top + bottom of doorway)
  drawDividerWall(g, LAYOUT.doorway.x, 80, LAYOUT.doorway.width, 220);
  drawDividerWall(g, LAYOUT.doorway.x, 360, LAYOUT.doorway.width, 240);

  // Thin floor-wall shadow line against the back wall to anchor depth
  const shadowG = scene.add.graphics();
  shadowG.setDepth(DEPTH.floorOverlay);
  shadowG.fillStyle(0x000000, 0.35);
  shadowG.fillRect(LAYOUT.lobby.x, LAYOUT.lobby.y, LAYOUT.lobby.width, 8);
  shadowG.fillRect(LAYOUT.office.x, LAYOUT.office.y, LAYOUT.office.width, 8);
}

function drawDividerWall(
  g: Phaser.GameObjects.Graphics,
  x: number,
  y: number,
  w: number,
  h: number
): void {
  g.fillStyle(THEME.wallDark, 1);
  g.fillRect(x, y, w, h);
  g.fillStyle(THEME.wallLight, 0.8);
  g.fillRect(x, y, 2, h);
  g.fillStyle(THEME.wallTrimDark, 1);
  g.fillRect(x + w - 2, y, 2, h);
  // Brass accent strip running the divider (subtle column gilding)
  g.fillStyle(THEME.brassDeep, 0.55);
  g.fillRect(x + w / 2 - 0.5, y + 6, 1, h - 12);
}

interface LobbyProp {
  /** reserved for future richer handles */ _?: undefined;
}

function drawLobbyDressing(scene: Phaser.Scene): LobbyProp {
  const g = scene.add.graphics();
  g.setDepth(DEPTH.propBack);

  // Reception counter — rich wood base, dark marble top, brass edge
  const rcx = 120;
  const rcy = 100;
  const rcw = 200;
  const rch = 40;
  // Counter shadow/base (under side)
  g.fillStyle(THEME.woodDeep, 1);
  g.fillRect(rcx, rcy + 4, rcw, rch);
  // Counter wood front panel
  g.fillStyle(THEME.woodDark, 1);
  g.fillRect(rcx, rcy + 10, rcw, rch - 6);
  // Wood plank seams
  g.lineStyle(1, THEME.woodDeep, 0.9);
  for (let i = 1; i < 5; i++) {
    const sx = rcx + (rcw / 5) * i;
    g.lineBetween(sx, rcy + 12, sx, rcy + rch + 2);
  }
  // Marble countertop
  g.fillStyle(0x2a2f3a, 1);
  g.fillRect(rcx - 4, rcy, rcw + 8, 12);
  g.fillStyle(0x3b4050, 0.5);
  g.fillRect(rcx - 4, rcy + 1, rcw + 8, 2);
  // Brass edge under the countertop
  g.fillStyle(THEME.brassDeep, 1);
  g.fillRect(rcx - 4, rcy + 10, rcw + 8, 2);
  g.fillStyle(THEME.brass, 0.85);
  g.fillRect(rcx - 4, rcy + 10, rcw + 8, 1);

  // Small brass desk lamp on the counter (left side)
  drawLamp(scene, rcx + 16, rcy - 2, 0.8);
  // A ledger / paper stack on the counter (right side)
  g.fillStyle(0xd8c9a5, 0.9);
  g.fillRect(rcx + rcw - 60, rcy - 4, 32, 8);
  g.fillStyle(0x3a2f1e, 0.9);
  g.fillRect(rcx + rcw - 60, rcy - 4, 32, 2);

  // Lounge area: armchair at (340, 480) + coffee table front
  drawArmchair(g, 340, 480);

  // Coffee table (small square between chair and middle)
  g.fillStyle(THEME.woodDeep, 1);
  g.fillRect(408, 488, 46, 30);
  g.fillStyle(THEME.woodMid, 1);
  g.fillRect(410, 486, 42, 24);
  g.fillStyle(THEME.woodHighlight, 0.45);
  g.fillRect(410, 486, 42, 3);

  // Trash bin (540, 500, 40x40)
  drawTrashBin(g, 540, 500);

  // Floor-standing planter in corner of lobby for ambience
  drawPlanter(g, 60, 540);
  drawPlanter(g, 600, 540);

  // A framed picture on the back wall of the lobby
  drawFramedArt(g, 220, 20, 70, 44, THEME.brassDeep);
  drawFramedArt(g, 470, 20, 60, 44, THEME.brassDeep);

  return {};
}

function drawArmchair(g: Phaser.GameObjects.Graphics, x: number, y: number): void {
  // Dimensions match the wall collider: 80x40 at (340,480)
  // Base shadow
  g.fillStyle(THEME.shadow, 0.3);
  g.fillEllipse(x + 40, y + 44, 84, 14);
  // Seat
  g.fillStyle(0x3a2025, 1);
  g.fillRoundedRect(x, y + 6, 80, 36, 6);
  // Seat cushion highlight
  g.fillStyle(0x5a2d34, 1);
  g.fillRoundedRect(x + 4, y + 4, 72, 20, 4);
  g.fillStyle(0x7a3b44, 0.55);
  g.fillRoundedRect(x + 4, y + 4, 72, 4, 2);
  // Armrests
  g.fillStyle(0x321a1f, 1);
  g.fillRoundedRect(x - 4, y + 4, 12, 34, 3);
  g.fillRoundedRect(x + 72, y + 4, 12, 34, 3);
  // Back cushion
  g.fillStyle(0x4a252b, 1);
  g.fillRoundedRect(x + 6, y - 8, 68, 14, 4);
}

function drawTrashBin(g: Phaser.GameObjects.Graphics, x: number, y: number): void {
  g.fillStyle(THEME.shadow, 0.3);
  g.fillEllipse(x + 20, y + 44, 42, 10);
  // Bin body
  g.fillStyle(0x1a1d26, 1);
  g.fillRoundedRect(x + 2, y + 4, 36, 36, 4);
  g.fillStyle(0x2a3040, 1);
  g.fillRoundedRect(x + 4, y + 6, 32, 4, 2);
  // Brass rim
  g.fillStyle(THEME.brassDeep, 0.9);
  g.fillRect(x + 2, y + 4, 36, 2);
  g.fillStyle(THEME.brass, 0.7);
  g.fillRect(x + 2, y + 4, 36, 1);
  // Subtle paper peeking out
  g.fillStyle(0xd8c9a5, 0.85);
  g.fillTriangle(x + 14, y + 6, x + 22, y + 2, x + 20, y + 10);
}

function drawPlanter(g: Phaser.GameObjects.Graphics, x: number, y: number): void {
  g.fillStyle(THEME.shadow, 0.3);
  g.fillEllipse(x, y + 28, 40, 10);
  // Pot
  g.fillStyle(THEME.woodDeep, 1);
  g.fillRoundedRect(x - 14, y + 6, 28, 22, 2);
  g.fillStyle(THEME.brassDeep, 0.85);
  g.fillRect(x - 14, y + 6, 28, 2);
  // Foliage silhouette (dark moody greens)
  g.fillStyle(0x1a2620, 1);
  g.fillCircle(x - 8, y - 4, 12);
  g.fillCircle(x + 6, y - 8, 10);
  g.fillCircle(x + 10, y + 2, 9);
  g.fillStyle(0x24342a, 0.6);
  g.fillCircle(x - 4, y - 8, 6);
}

function drawFramedArt(
  g: Phaser.GameObjects.Graphics,
  x: number,
  y: number,
  w: number,
  h: number,
  trim: number
): void {
  g.fillStyle(0x0a0d13, 1);
  g.fillRect(x, y, w, h);
  g.fillStyle(trim, 0.9);
  g.fillRect(x, y, w, 2);
  g.fillRect(x, y + h - 2, w, 2);
  g.fillRect(x, y, 2, h);
  g.fillRect(x + w - 2, y, 2, h);
  // A gestural mark on the canvas (just hints)
  g.fillStyle(0x3a2d1a, 0.7);
  g.fillRect(x + 8, y + h - 14, w - 16, 6);
  g.fillStyle(0x6a5030, 0.4);
  g.fillCircle(x + w / 2, y + h / 2, 6);
}

function drawOfficeDressing(scene: Phaser.Scene): { lamps: Phaser.GameObjects.Graphics[] } {
  const g = scene.add.graphics();
  g.setDepth(DEPTH.propBack);

  // Desk at (740,160,120x50)
  const dx = 740;
  const dy = 160;
  const dw = 120;
  const dh = 50;
  // Shadow under desk
  g.fillStyle(THEME.shadow, 0.3);
  g.fillEllipse(dx + dw / 2, dy + dh + 10, dw + 30, 18);
  // Desk wood
  g.fillStyle(THEME.woodDark, 1);
  g.fillRect(dx, dy + 8, dw, dh);
  g.fillStyle(THEME.woodMid, 1);
  g.fillRect(dx, dy + 6, dw, 12);
  g.fillStyle(THEME.woodHighlight, 0.5);
  g.fillRect(dx, dy + 6, dw, 2);
  // Drawer seams
  g.lineStyle(1, THEME.woodDeep, 0.9);
  g.lineBetween(dx + dw / 3, dy + 18, dx + dw / 3, dy + dh + 6);
  g.lineBetween(dx + (2 * dw) / 3, dy + 18, dx + (2 * dw) / 3, dy + dh + 6);
  // Brass drawer handles
  g.fillStyle(THEME.brass, 1);
  g.fillRect(dx + dw / 6 - 4, dy + 30, 8, 2);
  g.fillRect(dx + dw / 2 - 4, dy + 30, 8, 2);
  g.fillRect(dx + (5 * dw) / 6 - 4, dy + 30, 8, 2);
  // A closed folder + pen on the desk
  g.fillStyle(0x2a1a14, 1);
  g.fillRect(dx + 64, dy - 4, 44, 14);
  g.fillStyle(THEME.brass, 0.8);
  g.fillRect(dx + 64, dy - 4, 44, 2);

  // Desk lamp on the desk
  const lamp = scene.add.graphics();
  lamp.setDepth(DEPTH.propBack);
  drawDeskLamp(lamp, dx + 14, dy - 10);

  // Cabinet (840, 430, 70x70)
  drawCabinet(g, 840, 430);

  // Hanging pendant light suggested by a warm glow on the desk — actual
  // glow sprite is added by SceneFx.drawLightPools.

  // Small bookshelf silhouette against the back wall
  drawBookshelf(g, 680, 82);

  return { lamps: [lamp] };
}

function drawDeskLamp(g: Phaser.GameObjects.Graphics, x: number, y: number): void {
  // Base
  g.fillStyle(THEME.woodDeep, 1);
  g.fillEllipse(x, y + 18, 14, 6);
  // Stem
  g.fillStyle(THEME.brassDeep, 1);
  g.fillRect(x - 1, y, 2, 18);
  // Shade
  g.fillStyle(THEME.brassDeep, 1);
  g.fillTriangle(x - 10, y, x + 10, y, x, y - 8);
  g.fillStyle(THEME.brass, 1);
  g.fillRect(x - 10, y, 20, 4);
  g.fillStyle(THEME.brassBright, 0.9);
  g.fillRect(x - 10, y, 20, 1);
  // Bulb glow
  g.fillStyle(THEME.amberSoft, 0.6);
  g.fillCircle(x, y + 5, 5);
}

function drawCabinet(g: Phaser.GameObjects.Graphics, x: number, y: number): void {
  g.fillStyle(THEME.shadow, 0.3);
  g.fillEllipse(x + 35, y + 78, 78, 12);
  // Body
  g.fillStyle(THEME.woodDeep, 1);
  g.fillRect(x, y, 70, 70);
  g.fillStyle(THEME.woodDark, 1);
  g.fillRect(x + 2, y + 2, 66, 66);
  // Two doors
  g.fillStyle(THEME.woodMid, 1);
  g.fillRect(x + 4, y + 4, 30, 62);
  g.fillRect(x + 36, y + 4, 30, 62);
  g.fillStyle(THEME.woodHighlight, 0.4);
  g.fillRect(x + 4, y + 4, 30, 2);
  g.fillRect(x + 36, y + 4, 30, 2);
  // Inset panels
  g.lineStyle(1, THEME.woodDeep, 0.9);
  g.strokeRect(x + 8, y + 10, 22, 50);
  g.strokeRect(x + 40, y + 10, 22, 50);
  // Brass knobs
  g.fillStyle(THEME.brassBright, 1);
  g.fillCircle(x + 30, y + 36, 2);
  g.fillCircle(x + 40, y + 36, 2);
  g.fillStyle(THEME.brassDeep, 1);
  g.fillCircle(x + 30, y + 37, 1);
  g.fillCircle(x + 40, y + 37, 1);
}

function drawBookshelf(g: Phaser.GameObjects.Graphics, x: number, y: number): void {
  // Compact silhouette bookshelf suggesting depth on the back office wall
  const w = 40;
  const h = 60;
  g.fillStyle(THEME.woodDeep, 1);
  g.fillRect(x, y - h, w, h);
  g.fillStyle(THEME.woodDark, 1);
  g.fillRect(x + 2, y - h + 2, w - 4, h - 4);
  // Shelves
  g.lineStyle(1, THEME.woodDeep, 0.9);
  for (let i = 1; i < 4; i++) {
    const sy = y - h + (h / 4) * i;
    g.lineBetween(x + 2, sy, x + w - 2, sy);
  }
  // Book spines (tinted darks + a brass-backed volume)
  g.fillStyle(0x3a1c1f, 1);
  g.fillRect(x + 4, y - h + 4, 6, 10);
  g.fillStyle(0x1e2838, 1);
  g.fillRect(x + 12, y - h + 4, 5, 10);
  g.fillStyle(THEME.brassDeep, 1);
  g.fillRect(x + 19, y - h + 5, 4, 9);
  g.fillStyle(0x2a1a14, 1);
  g.fillRect(x + 25, y - h + 4, 7, 10);
  // Second shelf
  g.fillStyle(0x2a3040, 1);
  g.fillRect(x + 4, y - h + 18, 9, 10);
  g.fillStyle(0x3a2417, 1);
  g.fillRect(x + 15, y - h + 18, 5, 10);
  g.fillStyle(THEME.brass, 0.6);
  g.fillRect(x + 22, y - h + 20, 4, 8);
}

function drawDoorway(scene: Phaser.Scene): Phaser.GameObjects.Graphics {
  const g = scene.add.graphics();
  g.setDepth(DEPTH.wallBack + 1);
  // Door frame — dark mahogany with brass trim
  g.fillStyle(THEME.woodDeep, 1);
  g.fillRect(LAYOUT.doorway.x - 2, 294, LAYOUT.doorway.width + 4, 8);
  g.fillRect(LAYOUT.doorway.x - 2, 358, LAYOUT.doorway.width + 4, 8);
  g.fillStyle(THEME.brassDeep, 0.9);
  g.fillRect(LAYOUT.doorway.x - 2, 302, LAYOUT.doorway.width + 4, 1);
  g.fillRect(LAYOUT.doorway.x - 2, 358, LAYOUT.doorway.width + 4, 1);

  // Amber warm pool spilling through the doorway onto both rooms.
  const glow = scene.add.graphics();
  glow.setDepth(DEPTH.lightPool);
  drawGlowInto(glow, 640, 330, 90, THEME.amberGlow, 0.22);
  drawGlowInto(glow, 606, 330, 70, THEME.amberGlow, 0.14);
  drawGlowInto(glow, 672, 330, 70, THEME.amberGlow, 0.14);
  return glow;
}

function drawSignage(scene: Phaser.Scene): void {
  // Brass plaque above the reception counter
  const plaqueG = scene.add.graphics();
  plaqueG.setDepth(DEPTH.propBack);
  plaqueG.fillStyle(THEME.woodDeep, 1);
  plaqueG.fillRect(140, 20, 160, 34);
  plaqueG.fillStyle(THEME.brassDeep, 1);
  plaqueG.fillRect(144, 24, 152, 26);
  plaqueG.fillStyle(THEME.brass, 1);
  plaqueG.fillRect(144, 24, 152, 3);
  plaqueG.fillStyle(THEME.brassBright, 0.9);
  plaqueG.fillRect(144, 24, 152, 1);

  scene.add
    .text(220, 37, "THE MERIDIAN", {
      fontFamily: "Georgia, 'Times New Roman', serif",
      fontSize: "14px",
      color: "#1d140a",
      fontStyle: "bold"
    })
    .setOrigin(0.5, 0.5)
    .setDepth(DEPTH.propBack + 1);

  // Subtle room labels in brass
  scene.add
    .text(325, 88, "LOBBY", {
      fontFamily: "Inter, system-ui, sans-serif",
      fontSize: "10px",
      color: THEME.signText,
      fontStyle: "bold"
    })
    .setOrigin(0.5, 0)
    .setAlpha(0.55)
    .setDepth(DEPTH.propBack);

  scene.add
    .text(795, 88, "BACK OFFICE", {
      fontFamily: "Inter, system-ui, sans-serif",
      fontSize: "10px",
      color: THEME.signText,
      fontStyle: "bold"
    })
    .setOrigin(0.5, 0)
    .setAlpha(0.55)
    .setDepth(DEPTH.propBack);
}

function drawLamp(scene: Phaser.Scene, x: number, y: number, scale: number): void {
  const g = scene.add.graphics();
  g.setDepth(DEPTH.propBack);
  g.scale = scale;
  drawDeskLamp(g, x / scale, y / scale);
}

// ---- shared glow helper (used by floors + doorway) ----

function drawSoftGlow(
  scene: Phaser.Scene,
  x: number,
  y: number,
  radius: number,
  color: number,
  alpha: number,
  depth: number
): void {
  const g = scene.add.graphics();
  g.setDepth(depth);
  drawGlowInto(g, x, y, radius, color, alpha);
}

export function drawGlowInto(
  g: Phaser.GameObjects.Graphics,
  x: number,
  y: number,
  radius: number,
  color: number,
  alpha: number
): void {
  const steps = 6;
  for (let i = steps; i >= 1; i--) {
    const t = i / steps;
    g.fillStyle(color, alpha * (1 - t) * (1 - t));
    g.fillCircle(x, y, radius * t);
  }
}
