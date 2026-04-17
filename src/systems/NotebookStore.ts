import Phaser from "phaser";
import { caseData } from "../data/caseData";
import type { ClueData } from "../types/game";

/**
 * Session-scoped store for collected clues. Emits "clue-added" when a new
 * clue is added. Designed to be extended in Milestone 2 with dialogue state
 * flags and in Milestone 3 with accusation/contradiction tracking.
 */
export class NotebookStore extends Phaser.Events.EventEmitter {
  private readonly cluesById: Map<string, ClueData>;
  private readonly collected = new Set<string>();

  constructor() {
    super();
    this.cluesById = new Map(caseData.clues.map((c) => [c.id, c]));
  }

  has(clueId: string): boolean {
    return this.collected.has(clueId);
  }

  addClue(clueId: string): ClueData | null {
    if (this.collected.has(clueId)) return null;
    const clue = this.cluesById.get(clueId);
    if (!clue) {
      console.warn(`[NotebookStore] Unknown clue id: ${clueId}`);
      return null;
    }
    this.collected.add(clueId);
    this.emit("clue-added", clue);
    return clue;
  }

  listCollected(): ClueData[] {
    return caseData.clues.filter((c) => this.collected.has(c.id));
  }

  count(): number {
    return this.collected.size;
  }
}
