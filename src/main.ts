import Phaser from "phaser";
import { gameConfig } from "./game/config";

window.addEventListener("load", () => {
  new Phaser.Game(gameConfig);
});
