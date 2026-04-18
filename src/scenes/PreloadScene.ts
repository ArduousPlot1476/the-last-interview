import Phaser from "phaser";
import { buildTextures } from "../render/CharacterArt";

/**
 * Generates runtime textures (player, suspects, evidence pip, fx helpers) so
 * the project stays self-contained. Swap to real asset loads later via
 * `this.load.image(...)` if an art pack arrives.
 */
export class PreloadScene extends Phaser.Scene {
  constructor() {
    super("PreloadScene");
  }

  preload(): void {
    buildTextures(this);
  }

  create(): void {
    this.scene.start("InvestigationScene");
  }
}
