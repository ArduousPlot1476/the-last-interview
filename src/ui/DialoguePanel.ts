import type { DialogueLine } from "../types/dialogue";
import type { EvidenceOption } from "../types/contradiction";

export interface DialogueChoice {
  id: string;
  label: string;
  heard: boolean;
  kind: "topic" | "contradiction";
}

export interface ContradictionPrompt {
  prompt: string;
  options: EvidenceOption[];
}

/**
 * A suspect conversation as seen by the panel. The panel is dumb about
 * investigation state — the scene feeds it choices, resolves them to lines,
 * applies their effects on complete, and (for contradictions) exposes an
 * evidence picker.
 */
export interface DialogueSession {
  speakerLabel: string;
  greeting: DialogueLine[];
  /** Re-queried every time the choice list is displayed. */
  getChoices(): DialogueChoice[];
  /** Returns the lines for a heard topic. */
  beginTopic(topicId: string): DialogueLine[];
  /** Called once the player has read every line for a topic. */
  finishTopic(topicId: string): void;
  /** Open the evidence picker for a contradiction. */
  beginContradiction(contradictionId: string): ContradictionPrompt;
  /**
   * Resolve the contradiction with the chosen evidence id. Returns the lines
   * to play next (success or failure).
   */
  presentEvidence(
    contradictionId: string,
    evidenceId: string
  ): { success: boolean; lines: DialogueLine[] };
  onLeave?: () => void;
}

type Mode = "lines" | "choices" | "evidence";

/**
 * DOM controller for the dialogue overlay. Handles three modes:
 *   - "lines":    walk a sequence of lines with Continue, then call a hook
 *   - "choices":  present topic + contradiction choices
 *   - "evidence": evidence picker for a contradiction
 */
export class DialoguePanel {
  private readonly root: HTMLElement;
  private readonly speakerEl: HTMLElement;
  private readonly lineEl: HTMLElement;
  private readonly choicesEl: HTMLElement;
  private readonly evidenceEl: HTMLElement;
  private readonly evidencePromptEl: HTMLElement;
  private readonly evidenceListEl: HTMLElement;
  private readonly evidenceCancelBtn: HTMLButtonElement;
  private readonly nextBtn: HTMLButtonElement;
  private readonly leaveBtn: HTMLButtonElement;
  private readonly closeBtn: HTMLButtonElement;

  private session: DialogueSession | null = null;
  private mode: Mode = "lines";
  private currentLines: DialogueLine[] = [];
  private lineIndex = 0;
  private onLinesEnd: (() => void) | null = null;
  private activeContradictionId: string | null = null;

  constructor() {
    this.root = requireEl("#dialogue-panel");
    this.speakerEl = requireEl("#dialogue-speaker");
    this.lineEl = requireEl("#dialogue-line");
    this.choicesEl = requireEl("#dialogue-choices");
    this.evidenceEl = requireEl("#dialogue-evidence");
    this.evidencePromptEl = requireEl("#dialogue-evidence-prompt");
    this.evidenceListEl = requireEl("#dialogue-evidence-list");
    this.evidenceCancelBtn = requireEl<HTMLButtonElement>("#dialogue-evidence-cancel");
    this.nextBtn = requireEl<HTMLButtonElement>("#dialogue-next");
    this.leaveBtn = requireEl<HTMLButtonElement>("#dialogue-leave");
    this.closeBtn = requireEl<HTMLButtonElement>("#dialogue-close");

    this.nextBtn.addEventListener("click", () => this.advance());
    this.leaveBtn.addEventListener("click", () => this.close());
    this.closeBtn.addEventListener("click", () => this.close());
    this.evidenceCancelBtn.addEventListener("click", () => this.cancelEvidence());
  }

  isOpen(): boolean {
    return !this.root.classList.contains("hidden");
  }

  advance(): void {
    if (!this.session) return;
    if (this.mode === "lines") this.advanceLine();
  }

  open(session: DialogueSession): void {
    this.session = session;
    this.speakerEl.textContent = session.speakerLabel;
    this.root.classList.remove("hidden");
    this.root.setAttribute("aria-hidden", "false");
    this.playLines(session.greeting, () => this.enterChoices());
  }

  close(): void {
    if (!this.isOpen()) return;
    this.root.classList.add("hidden");
    this.root.setAttribute("aria-hidden", "true");
    this.session?.onLeave?.();
    this.session = null;
    this.currentLines = [];
    this.lineIndex = 0;
    this.onLinesEnd = null;
    this.activeContradictionId = null;
  }

  // ------- line mode -------

  private playLines(lines: DialogueLine[], onEnd: () => void): void {
    this.mode = "lines";
    this.currentLines = lines.slice();
    this.lineIndex = 0;
    this.onLinesEnd = onEnd;

    this.choicesEl.classList.add("hidden");
    this.evidenceEl.classList.add("hidden");
    this.lineEl.classList.remove("hidden");
    this.leaveBtn.classList.add("hidden");
    this.nextBtn.classList.remove("hidden");

    if (this.currentLines.length === 0) {
      onEnd();
      return;
    }
    this.renderCurrentLine();
    this.nextBtn.focus();
  }

  private advanceLine(): void {
    if (this.lineIndex < this.currentLines.length - 1) {
      this.lineIndex += 1;
      this.renderCurrentLine();
      return;
    }
    const onEnd = this.onLinesEnd;
    this.onLinesEnd = null;
    this.currentLines = [];
    this.lineIndex = 0;
    onEnd?.();
  }

  private renderCurrentLine(): void {
    const line = this.currentLines[this.lineIndex];
    this.lineEl.textContent = line?.text ?? "";
    const isLast = this.lineIndex >= this.currentLines.length - 1;
    this.nextBtn.textContent = isLast ? "…" : "Continue";
  }

  // ------- choice mode -------

  private enterChoices(): void {
    if (!this.session) return;
    this.mode = "choices";
    this.lineEl.classList.add("hidden");
    this.evidenceEl.classList.add("hidden");
    this.nextBtn.classList.add("hidden");
    this.leaveBtn.classList.remove("hidden");
    this.choicesEl.classList.remove("hidden");
    this.renderChoices();
    this.leaveBtn.focus();
  }

  private renderChoices(): void {
    if (!this.session) return;
    const choices = this.session.getChoices();
    this.choicesEl.innerHTML = "";

    if (choices.length === 0) {
      const empty = document.createElement("li");
      empty.className = "dialogue-choice empty";
      empty.textContent = "— no more questions for now —";
      this.choicesEl.appendChild(empty);
      return;
    }

    for (const choice of choices) {
      const li = document.createElement("li");
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "dialogue-choice-btn";
      if (choice.kind === "contradiction") btn.classList.add("challenge");
      if (choice.heard) btn.classList.add("heard");
      const prefix =
        choice.kind === "contradiction" ? "⚑ " : choice.heard ? "✓ " : "";
      btn.textContent = `${prefix}${choice.label}`;
      btn.addEventListener("click", () => this.selectChoice(choice));
      li.appendChild(btn);
      this.choicesEl.appendChild(li);
    }
  }

  private selectChoice(choice: DialogueChoice): void {
    if (!this.session) return;
    if (choice.kind === "topic") {
      const session = this.session;
      const lines = session.beginTopic(choice.id);
      this.playLines(lines, () => {
        session.finishTopic(choice.id);
        this.enterChoices();
      });
    } else {
      this.enterEvidence(choice.id);
    }
  }

  // ------- evidence mode -------

  private enterEvidence(contradictionId: string): void {
    if (!this.session) return;
    this.mode = "evidence";
    this.activeContradictionId = contradictionId;
    const { prompt, options } = this.session.beginContradiction(contradictionId);

    this.lineEl.classList.add("hidden");
    this.choicesEl.classList.add("hidden");
    this.nextBtn.classList.add("hidden");
    this.leaveBtn.classList.add("hidden");
    this.evidenceEl.classList.remove("hidden");

    this.evidencePromptEl.textContent = prompt;
    this.evidenceListEl.innerHTML = "";

    if (options.length === 0) {
      const empty = document.createElement("li");
      empty.className = "evidence-option empty";
      empty.textContent = "You have nothing to put to them.";
      this.evidenceListEl.appendChild(empty);
    } else {
      for (const opt of options) {
        const li = document.createElement("li");
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "evidence-option-btn";
        const kind = document.createElement("span");
        kind.className = "evidence-kind";
        kind.textContent = opt.kind === "clue" ? "Clue" : "Testimony";
        const title = document.createElement("span");
        title.className = "evidence-title";
        title.textContent = opt.title;
        const detail = document.createElement("span");
        detail.className = "evidence-detail";
        detail.textContent = opt.detail;
        btn.appendChild(kind);
        btn.appendChild(title);
        btn.appendChild(detail);
        btn.addEventListener("click", () => this.submitEvidence(opt.id));
        li.appendChild(btn);
        this.evidenceListEl.appendChild(li);
      }
    }

    this.evidenceCancelBtn.focus();
  }

  private submitEvidence(evidenceId: string): void {
    if (!this.session || !this.activeContradictionId) return;
    const result = this.session.presentEvidence(this.activeContradictionId, evidenceId);
    this.activeContradictionId = null;
    this.playLines(result.lines, () => this.enterChoices());
  }

  private cancelEvidence(): void {
    this.activeContradictionId = null;
    this.enterChoices();
  }
}

function requireEl<T extends HTMLElement = HTMLElement>(selector: string): T {
  const el = document.querySelector<T>(selector);
  if (!el) throw new Error(`Missing required UI element: ${selector}`);
  return el;
}
