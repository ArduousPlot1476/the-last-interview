import Phaser from "phaser";
import type { InteractablePlacement } from "../types/game";

export interface InteractableTarget {
  data: InteractablePlacement;
  sprite: Phaser.GameObjects.Container;
  radius: number;
  /** When true the hotspot has been consumed (e.g. a one-time clue). */
  consumed: boolean;
}

/**
 * Tracks the player's nearest interactable and dispatches an `interact` event
 * when the interact key is pressed while a target is in range. UI and scene
 * logic subscribe to the events rather than the raw input.
 */
export class InteractionSystem extends Phaser.Events.EventEmitter {
  private readonly targets: InteractableTarget[] = [];
  private current: InteractableTarget | null = null;

  constructor(
    scene: Phaser.Scene,
    private readonly getPlayerPosition: () => { x: number; y: number }
  ) {
    super();

    const interactKeys = [
      scene.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.E),
      scene.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE)
    ].filter((k): k is Phaser.Input.Keyboard.Key => !!k);

    for (const key of interactKeys) {
      key.on("down", () => this.tryInteract());
    }
  }

  register(target: InteractableTarget): void {
    this.targets.push(target);
  }

  consume(id: string): void {
    const t = this.targets.find((t) => t.data.id === id);
    if (t) t.consumed = true;
  }

  update(): void {
    const player = this.getPlayerPosition();
    let nearest: InteractableTarget | null = null;
    let nearestDistSq = Number.POSITIVE_INFINITY;

    for (const target of this.targets) {
      if (target.consumed) continue;
      const dx = target.data.x - player.x;
      const dy = target.data.y - player.y;
      const distSq = dx * dx + dy * dy;
      if (distSq <= target.radius * target.radius && distSq < nearestDistSq) {
        nearest = target;
        nearestDistSq = distSq;
      }
    }

    if (nearest !== this.current) {
      if (this.current) this.emit("target-left", this.current);
      this.current = nearest;
      if (this.current) this.emit("target-entered", this.current);
    }
  }

  getCurrent(): InteractableTarget | null {
    return this.current;
  }

  private tryInteract(): void {
    if (!this.current || this.current.consumed) return;
    this.emit("interact", this.current);
  }
}
