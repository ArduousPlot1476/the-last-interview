import { caseData } from "../data/caseData";
import { contradictions } from "../data/contradictions";
import type { InvestigationState } from "../systems/InvestigationState";
import type { TestimonyEntry } from "../types/dialogue";

type TabId = "leads" | "evidence" | "testimony" | "case";

/**
 * DOM controller for the notebook. Four tabs over a single panel:
 *   - Leads:      open objectives + resolved contradictions
 *   - Evidence:   collected clues
 *   - Testimony:  statements grouped by suspect, with ⚑ Challenged badges
 *   - Case:       case summary and suspect profiles
 *
 * A persistent progress header above the tabs surfaces at-a-glance counts so
 * the player can see how close the case is to accusation without hunting.
 * Re-renders only when the panel is open.
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
  private readonly tabButtons: HTMLButtonElement[];
  private readonly tabPanels: HTMLElement[];
  private readonly progressClues: HTMLElement;
  private readonly progressTestimony: HTMLElement;
  private readonly progressContradictions: HTMLElement;
  private readonly progressAccuse: HTMLElement;
  private activeTab: TabId = "leads";

  constructor(private readonly state: InvestigationState) {
    this.root = requireEl("#notebook-panel");
    this.caseEl = requireEl("#notebook-case");
    this.suspectsEl = requireEl("#notebook-suspects");
    this.leadsEl = requireEl("#notebook-leads");
    this.cluesEl = requireEl("#notebook-clues");
    this.testimonyEl = requireEl("#notebook-testimony");
    this.contradictionsEl = requireEl("#notebook-contradictions");
    this.closeBtn = requireEl<HTMLButtonElement>("#notebook-close");
    this.tabButtons = Array.from(
      document.querySelectorAll<HTMLButtonElement>(".notebook-tab")
    );
    this.tabPanels = Array.from(
      document.querySelectorAll<HTMLElement>(".notebook-tab-panel")
    );
    this.progressClues = requireEl("#progress-clues");
    this.progressTestimony = requireEl("#progress-testimony");
    this.progressContradictions = requireEl("#progress-contradictions");
    this.progressAccuse = requireEl("#progress-accuse");

    this.closeBtn.addEventListener("click", () => this.close());
    for (const btn of this.tabButtons) {
      btn.addEventListener("click", () => {
        const tab = btn.dataset.tab as TabId | undefined;
        if (tab) this.selectTab(tab);
      });
    }
    this.state.on("state-changed", () => {
      if (this.isOpen()) this.renderDynamic();
    });

    this.renderStatic();
    this.renderDynamic();
    this.selectTab(this.activeTab);
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

  private selectTab(tab: TabId): void {
    this.activeTab = tab;
    for (const btn of this.tabButtons) {
      btn.classList.toggle("is-active", btn.dataset.tab === tab);
    }
    for (const panel of this.tabPanels) {
      const match = panel.dataset.tab === tab;
      panel.classList.toggle("is-active", match);
      panel.toggleAttribute("hidden", !match);
    }
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
    this.renderProgress();
    this.renderLeads();
    this.renderClues();
    this.renderTestimony();
    this.renderContradictions();
  }

  private renderProgress(): void {
    const totalClues = caseData.clues.length;
    const collected = this.state.notebook.listCollected().length;
    this.progressClues.textContent = `${collected}/${totalClues}`;

    const testimonyCount = this.state.dialogue.listTestimony().length;
    this.progressTestimony.textContent = String(testimonyCount);

    const totalContradictions = contradictions.length;
    const resolved = this.state.listResolvedContradictions();
    const criticalResolved = resolved.filter((c) => c.critical).length;
    const criticalTotal = contradictions.filter((c) => c.critical).length;
    this.progressContradictions.textContent = `${resolved.length}/${totalContradictions} (crit ${criticalResolved}/${criticalTotal})`;

    const ready = this.state.canAccuse();
    this.progressAccuse.textContent = ready ? "Ready" : "Locked";
    this.progressAccuse.classList.toggle("is-ready", ready);
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
      const empty = document.createElement("div");
      empty.className = "notebook-empty";
      empty.textContent = "No testimony recorded yet. Press E to talk to a suspect.";
      this.testimonyEl.appendChild(empty);
      return;
    }
    const bySuspect = new Map<string, TestimonyEntry[]>();
    for (const e of entries) {
      const list = bySuspect.get(e.suspectId) ?? [];
      list.push(e);
      bySuspect.set(e.suspectId, list);
    }
    for (const suspect of caseData.suspects) {
      const list = bySuspect.get(suspect.id);
      if (!list || list.length === 0) continue;
      const group = document.createElement("section");
      group.className = "testimony-group";

      const header = document.createElement("header");
      header.className = "testimony-group-header";
      const name = document.createElement("span");
      name.className = "testimony-group-name";
      name.textContent = suspect.name;
      const role = document.createElement("span");
      role.className = "testimony-group-role";
      role.textContent = suspect.role;
      const challengedCount = list.filter((e) =>
        this.state.dialogue.isTestimonyChallenged(e.id)
      ).length;
      header.appendChild(name);
      header.appendChild(role);
      if (challengedCount > 0) {
        const count = document.createElement("span");
        count.className = "testimony-group-challenged";
        count.textContent = `${challengedCount} challenged`;
        header.appendChild(count);
      }
      group.appendChild(header);

      const ul = document.createElement("ul");
      ul.className = "notebook-list testimony-list";
      for (const entry of list) {
        const li = document.createElement("li");
        const challenged = this.state.dialogue.isTestimonyChallenged(entry.id);
        if (challenged) li.classList.add("challenged");
        if (challenged) {
          const badge = document.createElement("span");
          badge.className = "testimony-badge challenged";
          badge.textContent = "⚑ Challenged";
          li.appendChild(badge);
        }
        const body = document.createElement("div");
        body.className = "testimony-body";
        body.textContent = entry.statement;
        li.appendChild(body);
        ul.appendChild(li);
      }
      group.appendChild(ul);
      this.testimonyEl.appendChild(group);
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
      li.classList.add("resolved-contradiction");
      if (c.critical) li.classList.add("critical");
      const title = document.createElement("span");
      title.className = "clue-title";
      title.textContent = c.critical ? `⚑ Critical — ${c.label}` : c.label;
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
