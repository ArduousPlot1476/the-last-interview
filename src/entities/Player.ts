import Phaser from "phaser";

const PLAYER_SPEED = 180;
const PLAYER_RADIUS = 14;

/**
 * Minimal top-down player. Uses arcade physics for collision with walls.
 * Visual is a placeholder circle; swap for a sprite in a later milestone.
 */
export class Player {
  readonly sprite: Phaser.Physics.Arcade.Sprite;
  private readonly keys: {
    up: Phaser.Input.Keyboard.Key;
    down: Phaser.Input.Keyboard.Key;
    left: Phaser.Input.Keyboard.Key;
    right: Phaser.Input.Keyboard.Key;
  };
  private readonly cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
  private inputEnabled = true;

  constructor(scene: Phaser.Scene, x: number, y: number, textureKey: string) {
    this.sprite = scene.physics.add.sprite(x, y, textureKey);
    // Texture is 32x32; center a radius-14 circular body inside it.
    this.sprite.setCircle(PLAYER_RADIUS, 2, 2);
    this.sprite.setCollideWorldBounds(true);
    this.sprite.setDepth(10);

    const kb = scene.input.keyboard;
    if (!kb) throw new Error("Keyboard input plugin unavailable");

    this.keys = {
      up: kb.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      down: kb.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      left: kb.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      right: kb.addKey(Phaser.Input.Keyboard.KeyCodes.D)
    };
    this.cursors = kb.createCursorKeys();
  }

  get x(): number {
    return this.sprite.x;
  }

  get y(): number {
    return this.sprite.y;
  }

  setInputEnabled(enabled: boolean): void {
    this.inputEnabled = enabled;
    if (!enabled) this.sprite.setVelocity(0, 0);
  }

  update(): void {
    if (!this.inputEnabled) {
      this.sprite.setVelocity(0, 0);
      return;
    }

    const up = this.keys.up.isDown || !!this.cursors?.up?.isDown;
    const down = this.keys.down.isDown || !!this.cursors?.down?.isDown;
    const left = this.keys.left.isDown || !!this.cursors?.left?.isDown;
    const right = this.keys.right.isDown || !!this.cursors?.right?.isDown;

    let vx = 0;
    let vy = 0;
    if (left) vx -= 1;
    if (right) vx += 1;
    if (up) vy -= 1;
    if (down) vy += 1;

    if (vx !== 0 && vy !== 0) {
      const inv = 1 / Math.SQRT2;
      vx *= inv;
      vy *= inv;
    }

    this.sprite.setVelocity(vx * PLAYER_SPEED, vy * PLAYER_SPEED);
  }
}
