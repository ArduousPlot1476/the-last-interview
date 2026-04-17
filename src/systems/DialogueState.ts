import Phaser from "phaser";
import type { TestimonyEntry } from "../types/dialogue";

/**
 * Session state for dialogue progression: which topics the player has
 * heard, which flags have been set by authored topics, and which testimony
 * entries have been recorded into the notebook. No persistence — state is
 * owned by the active scene.
 */
export class DialogueState extends Phaser.Events.EventEmitter {
  private readonly flags = new Set<string>();
  private readonly heardTopics = new Set<string>();
  private readonly testimony = new Map<string, TestimonyEntry>();
  private readonly greetedSuspects = new Set<string>();

  hasGreetedSuspect(suspectId: string): boolean {
    return this.greetedSuspects.has(suspectId);
  }

  markSuspectGreeted(suspectId: string): void {
    this.greetedSuspects.add(suspectId);
  }

  setFlag(flag: string): boolean {
    if (this.flags.has(flag)) return false;
    this.flags.add(flag);
    this.emit("flag-set", flag);
    return true;
  }

  hasFlag(flag: string): boolean {
    return this.flags.has(flag);
  }

  markTopicHeard(topicId: string): boolean {
    if (this.heardTopics.has(topicId)) return false;
    this.heardTopics.add(topicId);
    this.emit("topic-heard", topicId);
    return true;
  }

  hasHeardTopic(topicId: string): boolean {
    return this.heardTopics.has(topicId);
  }

  recordTestimony(entry: TestimonyEntry): boolean {
    if (this.testimony.has(entry.id)) return false;
    this.testimony.set(entry.id, entry);
    this.emit("testimony-recorded", entry);
    return true;
  }

  hasTestimony(id: string): boolean {
    return this.testimony.has(id);
  }

  listTestimony(): TestimonyEntry[] {
    return Array.from(this.testimony.values());
  }

  private readonly resolvedContradictions = new Set<string>();
  private readonly challengedTestimony = new Set<string>();

  /**
   * Records that a contradiction has been closed by presenting valid evidence.
   * The `targetTestimonyId` is the statement that was challenged; we track it
   * separately so the notebook can flag the original testimony as contradicted.
   */
  resolveContradiction(contradictionId: string, targetTestimonyId: string): boolean {
    if (this.resolvedContradictions.has(contradictionId)) return false;
    this.resolvedContradictions.add(contradictionId);
    this.challengedTestimony.add(targetTestimonyId);
    this.emit("contradiction-resolved", contradictionId);
    return true;
  }

  hasResolvedContradiction(id: string): boolean {
    return this.resolvedContradictions.has(id);
  }

  listResolvedContradictions(): string[] {
    return Array.from(this.resolvedContradictions);
  }

  isTestimonyChallenged(testimonyId: string): boolean {
    return this.challengedTestimony.has(testimonyId);
  }
}
