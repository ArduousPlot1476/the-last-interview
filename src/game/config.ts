import Phaser from "phaser";
import { BootScene } from "../scenes/BootScene";
import { PreloadScene } from "../scenes/PreloadScene";
import { InvestigationScene } from "../scenes/InvestigationScene";

export const GAME_WIDTH = 960;
export const GAME_HEIGHT = 640;

export const gameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: "game-root",
  backgroundColor: "#0e1116",
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  pixelArt: false,
  physics: {
    default: "arcade",
    arcade: {
      gravity: { x: 0, y: 0 },
      debug: false
    }
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  scene: [BootScene, PreloadScene, InvestigationScene]
};
