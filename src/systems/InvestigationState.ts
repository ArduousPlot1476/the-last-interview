import Phaser from "phaser";
import { dialogueTopics } from "../data/dialogue";
import { objectives } from "../data/objectives";
import { contradictions } from "../data/contradictions";
import { endings } from "../data/endings";
import { caseData } from "../data/caseData";
import type { Condition, DialogueTopic, Objective } from "../types/dialogue";
import type { Contradiction, Ending, EvidenceOption } from "../types/contradiction";
import { NotebookStore } from "./NotebookStore";
import { DialogueState } from "./DialogueState";

/**
 * Facade over the notebook (evidence) and dialogue state stores. Owns the
 * condition evaluator and exposes the queries the UI/scene need:
 *
 *   - getVisibleTopics(suspectId)
 *   - getVisibleContradictions(suspectId)
 *   - getVisibleObjectives()
 *   - canAccuse()
 *   - determineEnding(suspectId)
 *
 * Emits a single "state-changed" signal whenever anything below it changes,
 * so UI can re-render without subscribing to every sub-event.
 */
export class InvestigationState extends Phaser.Events.EventEmitter {
  readonly notebook: NotebookStore;
  readonly dialogue: DialogueState;

  constructor() {
    super();
    this.notebook = new NotebookStore();
    this.dialogue = new DialogueState();

    this.notebook.on("clue-added", () => this.emit("state-changed"));
    this.dialogue.on("flag-set", () => this.emit("state-changed"));
    this.dialogue.on("topic-heard", () => this.emit("state-changed"));
    this.dialogue.on("testimony-recorded", () => this.emit("state-changed"));
    this.dialogue.on("contradiction-resolved", () => this.emit("state-changed"));
  }

  isSatisfied(cond?: Condition): boolean {
    if (!cond) return true;
    if (cond.clues?.some((id) => !this.notebook.has(id))) return false;
    if (cond.testimony?.some((id) => !this.dialogue.hasTestimony(id))) return false;
    if (cond.flags?.some((id) => !this.dialogue.hasFlag(id))) return false;
    if (cond.topicsHeard?.some((id) => !this.dialogue.hasHeardTopic(id))) return false;
    return true;
  }

  completeTopic(topic: DialogueTopic): void {
    this.dialogue.markTopicHeard(topic.id);
    if (topic.records) {
      for (const rec of topic.records) {
        this.dialogue.recordTestimony({
          id: rec.id,
          suspectId: topic.suspectId,
          statement: rec.statement,
          sourceTopicId: topic.id
        });
      }
    }
    if (topic.setsFlags) {
      for (const flag of topic.setsFlags) this.dialogue.setFlag(flag);
    }
  }

  getVisibleTopics(suspectId: string): DialogueTopic[] {
    return dialogueTopics
      .filter((t) => t.suspectId === suspectId && this.isSatisfied(t.requires))
      .sort((a, b) => (a.order ?? 100) - (b.order ?? 100));
  }

  getVisibleObjectives(): Array<{ objective: Objective; complete: boolean }> {
    return objectives
      .filter((o) => this.isSatisfied(o.visibleWhen))
      .sort((a, b) => (a.order ?? 100) - (b.order ?? 100))
      .map((o) => ({ objective: o, complete: this.isSatisfied(o.completeWhen) }));
  }

  /**
   * Contradictions the player can raise with this suspect right now: the
   * challenged testimony must have been heard, any extra requires must be met,
   * and the contradiction itself must not already be resolved.
   */
  getVisibleContradictions(suspectId: string): Contradiction[] {
    return contradictions.filter((c) => {
      if (c.suspectId !== suspectId) return false;
      if (this.dialogue.hasResolvedContradiction(c.id)) return false;
      if (!this.dialogue.hasTestimony(c.targetTestimonyId)) return false;
      return this.isSatisfied(c.requires);
    });
  }

  getContradiction(id: string): Contradiction | undefined {
    return contradictions.find((c) => c.id === id);
  }

  listResolvedContradictions(): Contradiction[] {
    return this.dialogue
      .listResolvedContradictions()
      .map((id) => contradictions.find((c) => c.id === id))
      .filter((c): c is Contradiction => Boolean(c));
  }

  /**
   * Every clue and every recorded testimony entry the player currently holds,
   * as picker rows. Ordered: clues first (by collection order), then testimony
   * (by record order).
   */
  getAllOwnedEvidence(): EvidenceOption[] {
    const options: EvidenceOption[] = [];
    for (const clue of this.notebook.listCollected()) {
      options.push({
        id: clue.id,
        kind: "clue",
        title: clue.title,
        detail: clue.description
      });
    }
    for (const t of this.dialogue.listTestimony()) {
      const suspect = caseData.suspects.find((s) => s.id === t.suspectId);
      options.push({
        id: t.id,
        kind: "testimony",
        title: suspect ? `${suspect.name}'s statement` : "Testimony",
        detail: t.statement
      });
    }
    return options;
  }

  /**
   * Attempt to resolve a contradiction with an evidence id. Returns the success
   * flag and the lines the dialogue should play. On success, records testimony
   * and sets flags authored in `onSuccess`.
   */
  presentEvidence(
    contradictionId: string,
    evidenceId: string
  ): { success: boolean; lines: Contradiction["successLines"] } {
    const c = this.getContradiction(contradictionId);
    if (!c) return { success: false, lines: [] };
    if (!c.validEvidence.includes(evidenceId)) {
      return { success: false, lines: c.failureLines };
    }
    const newlyResolved = this.dialogue.resolveContradiction(c.id, c.targetTestimonyId);
    if (newlyResolved && c.onSuccess) {
      if (c.onSuccess.records) {
        for (const rec of c.onSuccess.records) {
          this.dialogue.recordTestimony({
            id: rec.id,
            suspectId: c.suspectId,
            statement: rec.statement,
            sourceTopicId: c.id
          });
        }
      }
      if (c.onSuccess.setsFlags) {
        for (const flag of c.onSuccess.setsFlags) this.dialogue.setFlag(flag);
      }
    }
    return { success: true, lines: c.successLines };
  }

  /**
   * Gate for the accusation button. Requires:
   *   - Every suspect has an opening statement on record
   *   - At least three clues collected
   *   - At least one critical contradiction resolved
   */
  canAccuse(): boolean {
    const openingTopics = ["rosa-tonight", "ivy-where-were-you", "desmond-where-were-you"];
    if (openingTopics.some((t) => !this.dialogue.hasHeardTopic(t))) return false;
    if (this.notebook.listCollected().length < 3) return false;
    const resolvedCriticals = contradictions.filter(
      (c) => c.critical && this.dialogue.hasResolvedContradiction(c.id)
    );
    return resolvedCriticals.length >= 1;
  }

  /**
   * Decide the ending shown on accusation. Case canon: Desmond is the culprit.
   * Strong case = both critical contradictions resolved AND Vale's motive flag
   * learned. A weak case still accuses him but without the proof required to
   * make it stick. Any other suspect names an innocent.
   */
  determineEnding(accusedSuspectId: string): Ending {
    const culprit = "suspect-manager";
    const find = (id: string) => endings.find((e) => e.id === id)!;

    if (accusedSuspectId !== culprit) {
      return find("ending-wrong");
    }
    const bothCriticals = contradictions
      .filter((c) => c.critical)
      .every((c) => this.dialogue.hasResolvedContradiction(c.id));
    const knowsMotive = this.dialogue.hasFlag("vale-investigating-desmond");
    return bothCriticals && knowsMotive ? find("ending-justice") : find("ending-insufficient");
  }
}
