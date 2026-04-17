import { caseData } from "../data/caseData";
import type { InvestigationState } from "../systems/InvestigationState";
import type { Ending } from "../types/contradiction";

/**
 * Terminal panel that runs the accusation flow. Three views inside one modal:
 *   - "choose":  pick a suspect to accuse
 *   - "confirm": dossier of what you have / don't have against them
 *   - "ending":  the narrative outcome; Restart reloads the page
 *
 * Opening the panel disables scene input; closing it re-enables (unless we're
 * already on the ending view, which locks the game).
 */
export class AccusationPanel {
  private readonly root: HTMLElement;
  private readonly chooseEl: HTMLElement;
  private readonly chooseListEl: HTMLElement;
  private readonly chooseCancelBtn: HTMLButtonElement;

  private readonly confirmEl: HTMLElement;
  private readonly confirmSuspectEl: HTMLElement;
  private readonly confirmDossierEl: HTMLElement;
  private readonly confirmBackBtn: HTMLButtonElement;
  private readonly confirmSubmitBtn: HTMLButtonElement;

  private readonly endingEl: HTMLElement;
  private readonly endingTitleEl: HTMLElement;
  private readonly endingSubtitleEl: HTMLElement;
  private readonly endingBodyEl: HTMLElement;
  private readonly endingRestartBtn: HTMLButtonElement;

  private pendingSuspectId: string | null = null;
  private onClosed: (() => void) | null = null;

  constructor(private readonly state: InvestigationState) {
    this.root = requireEl("#accusation-panel");
    this.chooseEl = requireEl("#accuse-choose");
    this.chooseListEl = requireEl("#accuse-choose-list");
    this.chooseCancelBtn = requireEl<HTMLButtonElement>("#accuse-choose-cancel");

    this.confirmEl = requireEl("#accuse-confirm");
    this.confirmSuspectEl = requireEl("#accuse-confirm-suspect");
    this.confirmDossierEl = requireEl("#accuse-confirm-dossier");
    this.confirmBackBtn = requireEl<HTMLButtonElement>("#accuse-confirm-back");
    this.confirmSubmitBtn = requireEl<HTMLButtonElement>("#accuse-confirm-submit");

    this.endingEl = requireEl("#accuse-ending");
    this.endingTitleEl = requireEl("#accuse-ending-title");
    this.endingSubtitleEl = requireEl("#accuse-ending-subtitle");
    this.endingBodyEl = requireEl("#accuse-ending-body");
    this.endingRestartBtn = requireEl<HTMLButtonElement>("#accuse-ending-restart");

    this.chooseCancelBtn.addEventListener("click", () => this.close());
    this.confirmBackBtn.addEventListener("click", () => this.showChoose());
    this.confirmSubmitBtn.addEventListener("click", () => this.submit());
    this.endingRestartBtn.addEventListener("click", () => window.location.reload());
  }

  isOpen(): boolean {
    return !this.root.classList.contains("hidden");
  }

  open(onClosed?: () => void): void {
    this.onClosed = onClosed ?? null;
    this.pendingSuspectId = null;
    this.root.classList.remove("hidden");
    this.root.setAttribute("aria-hidden", "false");
    this.showChoose();
  }

  close(): void {
    if (!this.isOpen()) return;
    this.root.classList.add("hidden");
    this.root.setAttribute("aria-hidden", "true");
    const cb = this.onClosed;
    this.onClosed = null;
    cb?.();
  }

  // ------- choose view -------

  private showChoose(): void {
    this.showView("choose");
    this.chooseListEl.innerHTML = "";
    for (const suspect of caseData.suspects) {
      const li = document.createElement("li");
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "accuse-suspect-btn";
      const title = document.createElement("span");
      title.className = "accuse-suspect-name";
      title.textContent = suspect.name;
      const role = document.createElement("span");
      role.className = "accuse-suspect-role";
      role.textContent = suspect.role;
      btn.appendChild(title);
      btn.appendChild(role);
      btn.addEventListener("click", () => this.showConfirm(suspect.id));
      li.appendChild(btn);
      this.chooseListEl.appendChild(li);
    }
    this.chooseCancelBtn.focus();
  }

  // ------- confirm view -------

  private showConfirm(suspectId: string): void {
    this.pendingSuspectId = suspectId;
    const suspect = caseData.suspects.find((s) => s.id === suspectId);
    if (!suspect) return;

    this.showView("confirm");
    this.confirmSuspectEl.textContent = `${suspect.name} — ${suspect.role}`;

    this.confirmDossierEl.innerHTML = "";
    this.confirmDossierEl.appendChild(
      dossierRow("Clues on file", String(this.state.notebook.listCollected().length))
    );
    this.confirmDossierEl.appendChild(
      dossierRow("Testimony recorded", String(this.state.dialogue.listTestimony().length))
    );
    const resolved = this.state.listResolvedContradictions();
    const criticalResolved = resolved.filter((c) => c.critical).length;
    this.confirmDossierEl.appendChild(
      dossierRow("Contradictions resolved", `${resolved.length} (${criticalResolved} critical)`)
    );
    const motive = this.state.dialogue.hasFlag("vale-investigating-desmond");
    this.confirmDossierEl.appendChild(
      dossierRow("Motive established", motive ? "Yes" : "Not yet")
    );

    this.confirmSubmitBtn.focus();
  }

  // ------- ending view -------

  private submit(): void {
    if (!this.pendingSuspectId) return;
    const suspect = caseData.suspects.find((s) => s.id === this.pendingSuspectId);
    if (!suspect) return;

    const ending = this.state.determineEnding(this.pendingSuspectId);
    this.showEnding(ending, suspect.name);
  }

  private showEnding(ending: Ending, accusedName: string): void {
    this.showView("ending");
    this.endingTitleEl.textContent = ending.title;
    this.endingSubtitleEl.textContent = interpolate(ending.subtitle, accusedName);
    this.endingBodyEl.innerHTML = "";
    for (const line of ending.lines) {
      const p = document.createElement("p");
      p.textContent = interpolate(line, accusedName);
      this.endingBodyEl.appendChild(p);
    }
    this.endingRestartBtn.focus();
  }

  private showView(view: "choose" | "confirm" | "ending"): void {
    this.chooseEl.classList.toggle("hidden", view !== "choose");
    this.confirmEl.classList.toggle("hidden", view !== "confirm");
    this.endingEl.classList.toggle("hidden", view !== "ending");
  }
}

function dossierRow(label: string, value: string): HTMLLIElement {
  const li = document.createElement("li");
  const labelEl = document.createElement("span");
  labelEl.className = "dossier-label";
  labelEl.textContent = label;
  const valueEl = document.createElement("span");
  valueEl.className = "dossier-value";
  valueEl.textContent = value;
  li.appendChild(labelEl);
  li.appendChild(valueEl);
  return li;
}

function interpolate(text: string, name: string): string {
  return text.replace(/\{name\}/g, name);
}

function requireEl<T extends HTMLElement = HTMLElement>(selector: string): T {
  const el = document.querySelector<T>(selector);
  if (!el) throw new Error(`Missing required UI element: ${selector}`);
  return el;
}
