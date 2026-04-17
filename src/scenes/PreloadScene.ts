import Phaser from "phaser";

/**
 * Generates simple placeholder textures at runtime so the project is
 * self-contained for Milestone 1. Replace with real asset loads later
 * (`this.load.image(...)`, `this.load.spritesheet(...)`).
 */
export class PreloadScene extends Phaser.Scene {
  constructor() {
    super("PreloadScene");
  }

  preload(): void {
    this.buildPlayerTexture();
    this.buildEvidenceTexture();
    this.buildSuspectTexture();
  }

  create(): void {
    this.scene.start("InvestigationScene");
  }

  private buildPlayerTexture(): void {
    const g = this.add.graphics({ x: 0, y: 0 });
    g.fillStyle(0xe6edf3, 1);
    g.fillCircle(16, 16, 14);
    g.lineStyle(2, 0x2c333d, 1);
    g.strokeCircle(16, 16, 14);
    g.fillStyle(0x0e1116, 1);
    g.fillCircle(16, 12, 3);
    g.generateTexture("player", 32, 32);
    g.destroy();
  }

  private buildEvidenceTexture(): void {
    const g = this.add.graphics({ x: 0, y: 0 });
    const size = 28;
    const cx = size / 2;
    const cy = size / 2;
    g.fillStyle(0xd0a656, 1);
    g.beginPath();
    g.moveTo(cx, 2);
    g.lineTo(size - 2, cy);
    g.lineTo(cx, size - 2);
    g.lineTo(2, cy);
    g.closePath();
    g.fillPath();
    g.lineStyle(2, 0x3d3522, 1);
    g.strokePath();
    g.generateTexture("evidence-icon", size, size);
    g.destroy();
  }

  private buildSuspectTexture(): void {
    const g = this.add.graphics({ x: 0, y: 0 });
    // head + body silhouette
    g.fillStyle(0xffffff, 1);
    g.fillCircle(16, 10, 8);
    g.fillRoundedRect(6, 18, 20, 14, 4);
    g.lineStyle(2, 0x2c333d, 1);
    g.strokeCircle(16, 10, 8);
    g.strokeRoundedRect(6, 18, 20, 14, 4);
    g.generateTexture("suspect-icon", 32, 32);
    g.destroy();
  }
}
