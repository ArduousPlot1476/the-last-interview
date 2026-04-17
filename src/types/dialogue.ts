/**
 * Conditions are evaluated by InvestigationState. All listed requirements
 * must be satisfied for the condition to return true. An undefined or empty
 * condition is always satisfied. Designed as AND-only for M2 — OR branches
 * can layer on in M3 without changing the shape.
 */
export interface Condition {
  clues?: string[];
  testimony?: string[];
  flags?: string[];
  topicsHeard?: string[];
}

export interface DialogueLine {
  /** Optional attribution prefix shown in the line body. Defaults to speaker. */
  speaker?: string;
  text: string;
}

/**
 * A single topic the player can pick while talking to a suspect. A topic can
 * gate itself on clues/flags/prior testimony, play a sequence of lines, then
 * record testimony and set state flags.
 */
export interface DialogueTopic {
  id: string;
  suspectId: string;
  /** Choice button label. */
  label: string;
  lines: DialogueLine[];
  requires?: Condition;
  /** Testimony entries recorded into the notebook when this topic finishes. */
  records?: RecordedTestimony[];
  /** Flags set on the dialogue state when this topic finishes. */
  setsFlags?: string[];
  /** Lower sorts earlier in the choice list; defaults to 100. */
  order?: number;
}

export interface RecordedTestimony {
  id: string;
  statement: string;
}

export interface TestimonyEntry {
  id: string;
  suspectId: string;
  statement: string;
  sourceTopicId: string;
}

export interface Objective {
  id: string;
  title: string;
  hint?: string;
  /** If omitted, the objective is visible from session start. */
  visibleWhen?: Condition;
  completeWhen: Condition;
  /** Lower sorts earlier in the list; defaults to 100. */
  order?: number;
}
