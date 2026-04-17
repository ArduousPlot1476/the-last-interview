import { caseData } from "../data/caseData";
import type { InvestigationState } from "../systems/InvestigationState";

/**
 * DOM controller for the notebook. Renders:
 *   - the static case summary and suspects list
 *   - the dynamic list of open leads/objectives
 *   - collected evidence (clues)
 *   - recorded testimony, grouped by suspect
 *
 * Re-renders dynamic sections on every InvestigationState "state-changed"
 * event, but only does DOM work when the panel is actually open.
 */
export class NotebookPanel {
  private readonly root: HTMLElement;
  private readonly caseEl: HTMLElement;
  private readonly suspectsEl: HTMLElement;
  private readonly leadsEl: HTMLElement;
  private readonly cluesEl: HTMLElement;
  private readonly testimonyEl: HTMLElement;
  private readonly contradictionsEl: HTMLElement;
  private readonly closeBtn: HTMLButtonElement;

  constructor(private readonly state: InvestigationState) {
    this.root = requireEl("#notebook-panel");
    this.caseEl = requireEl("#notebook-case");
    this.suspectsEl = requireEl("#notebook-suspects");
    this.leadsEl = requireEl("#notebook-leads");
    this.cluesEl = requireEl("#notebook-clues");
    this.testimonyEl = requireEl("#notebook-testimony");
    this.contradictionsEl = requireEl("#notebook-contradictions");
    this.closeBtn = requireEl<HTMLButtonElement>("#notebook-close");

    this.closeBtn.addEventListener("click", () => this.close());
    this.state.on("state-changed", () => {
      if (this.isOpen()) this.renderDynamic();
    });

    this.renderStatic();
    this.renderDynamic();
  }

  isOpen(): boolean {
    return !this.root.classList.contains("hidden");
  }

  toggle(): void {
    if (this.isOpen()) this.close();
    else this.open();
  }

  open(): void {
    this.renderDynamic();
    this.root.classList.remove("hidden");
    this.root.setAttribute("aria-hidden", "false");
  }

  close(): void {
    this.root.classList.add("hidden");
    this.root.setAttribute("aria-hidden", "true");
  }

  // ------- static -------

  private renderStatic(): void {
    this.caseEl.textContent = `${caseData.title} — ${caseData.summary}`;
    this.suspectsEl.innerHTML = "";
    for (const s of caseData.suspects) {
      const li = document.createElement("li");
      const title = document.createElement("span");
      title.className = "clue-title";
      title.textContent = s.name;
      const role = document.createElement("span");
      role.className = "clue-meta";
      role.textContent = s.role;
      const profile = document.createElement("div");
      profile.className = "suspect-profile";
      profile.textContent = s.profile;
      li.appendChild(title);
      li.appendChild(role);
      li.appendChild(profile);
      this.suspectsEl.appendChild(li);
    }
  }

  // ------- dynamic -------

  private renderDynamic(): void {
    this.renderLeads();
    this.renderClues();
    this.renderTestimony();
    this.renderContradictions();
  }

  private renderLeads(): void {
    const leads = this.state.getVisibleObjectives();
    this.leadsEl.innerHTML = "";
    if (leads.length === 0) {
      this.leadsEl.appendChild(emptyLi("No open leads yet. Start by walking the lobby."));
      return;
    }
    for (const { objective, complete } of leads) {
      const li = document.createElement("li");
      if (complete) li.classList.add("complete");
      const title = document.createElement("span");
      title.className = "clue-title";
      title.textContent = complete ? `✓ ${objective.title}` : `• ${objective.title}`;
      li.appendChild(title);
      if (objective.hint && !complete) {
        const hint = document.createElement("span");
        hint.className = "clue-meta";
        hint.textContent = objective.hint;
        li.appendChild(hint);
      }
      this.leadsEl.appendChild(li);
    }
  }

  private renderClues(): void {
    const collected = this.state.notebook.listCollected();
    this.cluesEl.innerHTML = "";
    if (collected.length === 0) {
      this.cluesEl.appendChild(emptyLi("No evidence collected yet. Press E near an object to inspect it."));
      return;
    }
    for (const clue of collected) {
      const li = document.createElement("li");
      const title = document.createElement("span");
      title.className = "clue-title";
      title.textContent = clue.title;
      const body = document.createElement("div");
      body.textContent = clue.description;
      li.appendChild(title);
      li.appendChild(body);
      if (clue.sourceLocation) {
        const meta = document.createElement("span");
        meta.className = "clue-meta";
        meta.textContent = `Found: ${clue.sourceLocation}`;
        li.appendChild(meta);
      }
      this.cluesEl.appendChild(li);
    }
  }

  private renderTestimony(): void {
    const entries = this.state.dialogue.listTestimony();
    this.testimonyEl.innerHTML = "";
    if (entries.length === 0) {
      this.testimonyEl.appendChild(emptyLi("No testimony recorded yet. Press E to talk to a suspect."));
      return;
    }
    const bySuspect = new Map<string, typeof entries>();
    for (const e of entries) {
      const list = bySuspect.get(e.suspectId) ?? [];
      list.push(e);
      bySuspect.set(e.suspectId, list);
    }
    for (const suspect of caseData.suspects) {
      const list = bySuspect.get(suspect.id);
      if (!list || list.length === 0) continue;
      for (const entry of list) {
        const li = document.createElement("li");
        const challenged = this.state.dialogue.isTestimonyChallenged(entry.id);
        if (challenged) li.classList.add("challenged");
        const title = document.createElement("span");
        title.className = "clue-title";
        title.textContent = suspect.name;
        if (challenged) {
          const badge = document.createElement("span");
          badge.className = "testimony-badge";
          badge.textContent = "⚑ Challenged";
          title.appendChild(document.createTextNode(" "));
          title.appendChild(badge);
        }
        const body = document.createElement("div");
        body.textContent = entry.statement;
        li.appendChild(title);
        li.appendChild(body);
        this.testimonyEl.appendChild(li);
      }
    }
  }

  private renderContradictions(): void {
    const resolved = this.state.listResolvedContradictions();
    this.contradictionsEl.innerHTML = "";
    if (resolved.length === 0) {
      this.contradictionsEl.appendChild(
        emptyLi("No contradictions resolved yet. Press a suspect on a lie.")
      );
      return;
    }
    for (const c of resolved) {
      const li = document.createElement("li");
      const title = document.createElement("span");
      title.className = "clue-title";
      title.textContent = c.critical ? `⚑ ${c.label}` : c.label;
      const body = document.createElement("div");
      body.textContent = c.resolutionSummary;
      li.appendChild(title);
      li.appendChild(body);
      this.contradictionsEl.appendChild(li);
    }
  }
}

function emptyLi(text: string): HTMLLIElement {
  const li = document.createElement("li");
  li.className = "empty";
  li.textContent = text;
  return li;
}

function requireEl<T extends HTMLElement = HTMLElement>(selector: string): T {
  const el = document.querySelector<T>(selector);
  if (!el) throw new Error(`Missing required UI element: ${selector}`);
  return el;
}
