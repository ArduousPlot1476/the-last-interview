export type InteractableKind = "evidence" | "suspect";

export interface ClueData {
  id: string;
  title: string;
  description: string;
  sourceLocation?: string;
}

export interface SuspectData {
  id: string;
  name: string;
  role: string;
  portraitTint?: number;
  /** 1–3 lines shown before the topic choices on first open. */
  greeting: string[];
  /**
   * Short profile blurb shown in the notebook. Does not reveal the truth —
   * this is the surface-level framing of who they are and why they're here.
   */
  profile: string;
}

export interface CaseData {
  id: string;
  title: string;
  summary: string;
  suspects: SuspectData[];
  clues: ClueData[];
}

export interface EvidencePlacement {
  id: string;
  kind: "evidence";
  clueId: string;
  x: number;
  y: number;
  label: string;
  radius?: number;
}

export interface SuspectPlacement {
  id: string;
  kind: "suspect";
  suspectId: string;
  x: number;
  y: number;
  label: string;
  radius?: number;
}

export type InteractablePlacement = EvidencePlacement | SuspectPlacement;

