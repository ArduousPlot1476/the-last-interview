import type { Condition, DialogueLine, RecordedTestimony } from "./dialogue";

/**
 * An authored contradiction. When a suspect has made a statement that the
 * player can challenge, a matching Contradiction exposes a "press them"
 * choice in dialogue. Selecting it opens an evidence picker; presenting
 * one of `validEvidence` plays `successLines` and commits `onSuccess`.
 * Any other choice plays `failureLines` and leaves state untouched.
 */
export interface Contradiction {
  id: string;
  suspectId: string;
  /** Topic-choice label shown in the dialogue list. */
  label: string;
  /** The statement being challenged. Must already have been heard. */
  targetTestimonyId: string;
  /** IDs of clues or testimony entries that are accepted as a challenge. */
  validEvidence: string[];
  /**
   * Whether this contradiction counts toward the strong-ending threshold.
   * Case canon: both critical contradictions must be resolved, plus the
   * vale-investigating-desmond flag, to reach the Justice ending.
   */
  critical: boolean;
  /** Shown at the top of the evidence picker. */
  prompt: string;
  successLines: DialogueLine[];
  failureLines: DialogueLine[];
  requires?: Condition;
  onSuccess?: {
    records?: RecordedTestimony[];
    setsFlags?: string[];
  };
  /** One-line summary shown in the notebook after resolution. */
  resolutionSummary: string;
}

/**
 * A row shown in the dialogue evidence picker. The picker shows every piece
 * of evidence the player currently holds, so the answer isn't given away.
 */
export interface EvidenceOption {
  id: string;
  kind: "clue" | "testimony";
  title: string;
  detail: string;
}

export interface Ending {
  id: string;
  title: string;
  subtitle: string;
  /** Paragraphs rendered in the ending screen, in order. */
  lines: string[];
}
