import Phaser from "phaser";
import { GAME_HEIGHT, GAME_WIDTH } from "../game/config";
import { Player } from "../entities/Player";
import { InvestigationState } from "../systems/InvestigationState";
import { InteractionSystem, InteractableTarget } from "../systems/InteractionSystem";
import { DialoguePanel, DialogueSession, DialogueChoice } from "../ui/DialoguePanel";
import { NotebookPanel } from "../ui/NotebookPanel";
import { AccusationPanel } from "../ui/AccusationPanel";
import { interactables, playerSpawn, walls } from "../data/interactables";
import { caseData } from "../data/caseData";
import type { ClueData, InteractablePlacement } from "../types/game";
import { DEPTH, THEME } from "../render/VisualTheme";
import { drawEnvironment } from "../render/EnvironmentArt";
import {
  addDoorwayPulse,
  addDustMotes,
  addHotspotHalo,
  addIdleBob,
  addLampFlicker,
  attachShadow,
  drawVignette
} from "../render/SceneFx";

const INTERACT_RADIUS = 64;
const TOAST_MS = 2600;

/**
 * Playable investigation scene. Responsibilities:
 *   - Build static environment (rooms + walls)
 *   - Spawn player and interactables
 *   - Wire the InteractionSystem to the InvestigationState and UI
 *   - Route Tab to the notebook and Esc to close panels
 *   - Surface the accusation button when the threshold is met
 *   - Host the start-overlay + help-panel + toast stack
 *
 * Narrative state lives in InvestigationState. The scene only coordinates
 * input/world/UI and hands DialogueSessions to the DialoguePanel.
 */
export class InvestigationScene extends Phaser.Scene {
  private player!: Player;
  private state!: InvestigationState;
  private interactionSystem!: InteractionSystem;
  private dialoguePanel!: DialoguePanel;
  private notebookPanel!: NotebookPanel;
  private accusationPanel!: AccusationPanel;

  private promptText!: Phaser.GameObjects.Text;
  private highlightGfx!: Phaser.GameObjects.Graphics;
  private currentTarget: InteractableTarget | null = null;
  private readonly evidenceHalos = new Map<string, Phaser.GameObjects.Image>();
  private toastStackEl!: HTMLElement;
  private objectiveEl!: HTMLElement;
  private accuseBtn!: HTMLButtonElement;
  private startOverlayEl!: HTMLElement;
  private helpPanelEl!: HTMLElement;
  private startDismissed = false;

  constructor() {
    super("InvestigationScene");
  }

  create(): void {
    this.physics.world.setBounds(0, 60, GAME_WIDTH, GAME_HEIGHT - 60);

    this.buildEnvironment();
    const wallGroup = this.buildWallColliders();

    this.player = new Player(this, playerSpawn.x, playerSpawn.y, "player");
    this.player.sprite.setDepth(DEPTH.player);
    this.physics.add.collider(this.player.sprite, wallGroup);
    attachShadow(this, this.player.sprite, 16, 0.8);

    this.state = new InvestigationState();
    this.dialoguePanel = new DialoguePanel();
    this.notebookPanel = new NotebookPanel(this.state);
    this.accusationPanel = new AccusationPanel(this.state);
    this.toastStackEl = requireEl("#toast-stack");
    this.objectiveEl = requireEl("#objective");
    this.accuseBtn = requireEl<HTMLButtonElement>("#accusation-button");
    this.startOverlayEl = requireEl("#start-overlay");
    this.helpPanelEl = requireEl("#help-panel");
    this.accuseBtn.addEventListener("click", () => this.openAccusation());

    this.interactionSystem = new InteractionSystem(this, () => ({
      x: this.player.x,
      y: this.player.y
    }));

    this.highlightGfx = this.add.graphics();
    this.highlightGfx.setDepth(DEPTH.highlight);

    this.promptText = this.add.text(0, 0, "", {
      fontFamily: "Inter, system-ui, sans-serif",
      fontSize: "13px",
      color: "#f3e4c0",
      backgroundColor: "#0b0d12e6",
      padding: { x: 8, y: 4 },
      stroke: "#000000",
      strokeThickness: 2
    });
    this.promptText.setDepth(DEPTH.prompt);
    this.promptText.setOrigin(0.5, 1);
    this.promptText.setVisible(false);

    this.spawnInteractables();
    this.wireInteractionEvents();
    this.wireGlobalKeys();
    this.wireStartOverlay();
    this.wireHelpPanel();

    this.state.notebook.on("clue-added", (clue: ClueData) => {
      this.showToast(`Clue added: ${clue.title}`, "clue");
    });
    this.state.dialogue.on(
      "testimony-recorded",
      (entry: { statement: string }) => {
        const summary = entry.statement.length > 70
          ? `${entry.statement.slice(0, 67)}…`
          : entry.statement;
        this.showToast(`Testimony recorded: ${summary}`, "testimony");
      }
    );
    this.state.dialogue.on("contradiction-resolved", (id: string) => {
      const c = this.state.getContradiction(id);
      if (c) this.showToast(`Contradiction resolved: ${c.resolutionSummary}`, "contradiction");
    });

    this.state.on("state-changed", () => {
      this.refreshObjectiveHud();
      this.refreshAccusationButton();
    });
    this.refreshObjectiveHud();
    this.refreshAccusationButton();
  }

  update(): void {
    const panelOpen = this.isAnyPanelOpen();
    this.player.setInputEnabled(!panelOpen && this.startDismissed);
    this.player.update();
    if (!panelOpen && this.startDismissed) this.interactionSystem.update();
    this.renderHighlight();
  }

  private isAnyPanelOpen(): boolean {
    return (
      this.dialoguePanel.isOpen() ||
      this.notebookPanel.isOpen() ||
      this.accusationPanel.isOpen() ||
      this.isHelpOpen() ||
      !this.startDismissed
    );
  }

  // ------- environment -------

  private buildEnvironment(): void {
    const { lamps, doorwayGlow } = drawEnvironment(this);
    for (const lamp of lamps) addLampFlicker(this, lamp);
    addDoorwayPulse(this, doorwayGlow);

    // Ambient dust motes + final vignette sit on top of everything.
    addDustMotes(this);
    drawVignette(this);
  }

  private buildWallColliders(): Phaser.Physics.Arcade.StaticGroup {
    const group = this.physics.add.staticGroup();
    for (const w of walls) {
      const rect = this.add.rectangle(
        w.x + w.width / 2,
        w.y + w.height / 2,
        w.width,
        w.height
      );
      rect.setVisible(false);
      this.physics.add.existing(rect, true);
      group.add(rect);
    }
    return group;
  }

  // ------- interactable rendering -------

  // ------- interactables -------

  private spawnInteractables(): void {
    for (const data of interactables) {
      const container = this.buildInteractableSprite(data);
      this.interactionSystem.register({
        data,
        sprite: container,
        radius: data.radius ?? INTERACT_RADIUS,
        consumed: false
      });
    }
  }

  private buildInteractableSprite(data: InteractablePlacement): Phaser.GameObjects.Container {
    const container = this.add.container(data.x, data.y);
    container.setDepth(data.kind === "suspect" ? DEPTH.character : DEPTH.prop);

    if (data.kind === "evidence") {
      // Warm brass halo underneath to cue "interactable"
      const halo = addHotspotHalo(this, data.x, data.y);
      if (halo) this.evidenceHalos.set(data.id, halo);

      const icon = this.add.image(0, 0, "evidence-icon");
      icon.setScale(1);
      container.add(icon);

      // Gentle up-and-down float for evidence pips
      this.tweens.add({
        targets: icon,
        y: -3,
        duration: 1800 + Math.random() * 600,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut"
      });
    } else if (data.kind === "suspect") {
      // Soft drop shadow under suspect
      const shadow = this.add.image(0, 20, "fx-shadow");
      shadow.setAlpha(0.55);
      container.add(shadow);

      const icon = this.add.image(0, -4, "suspect-icon");
      const suspect = caseData.suspects.find((s) => s.id === data.suspectId);
      if (suspect?.portraitTint !== undefined) icon.setTint(suspect.portraitTint);
      icon.setScale(1.05);
      container.add(icon);

      // Subtle idle breathing
      addIdleBob(this, icon, 1.2, 2400 + Math.random() * 600);
    }

    const label = this.add.text(0, 24, data.label, {
      fontFamily: "Inter, system-ui, sans-serif",
      fontSize: "11px",
      color: THEME.labelText,
      stroke: "#000000",
      strokeThickness: 3
    });
    label.setOrigin(0.5, 0);
    label.setAlpha(0.85);
    container.add(label);

    return container;
  }

  private wireInteractionEvents(): void {
    this.interactionSystem.on("target-entered", (t: InteractableTarget) => {
      this.currentTarget = t;
      const verb = t.data.kind === "evidence" ? "inspect" : "talk to";
      this.promptText.setText(`[E] ${verb} ${t.data.label}`);
      this.promptText.setVisible(true);
    });

    this.interactionSystem.on("target-left", () => {
      this.currentTarget = null;
      this.promptText.setVisible(false);
    });

    this.interactionSystem.on("interact", (t: InteractableTarget) => {
      if (this.isAnyPanelOpen()) return;
      if (t.data.kind === "evidence") {
        this.handleEvidence(t);
      } else {
        this.handleSuspect(t);
      }
    });
  }

  private handleEvidence(t: InteractableTarget): void {
    if (t.data.kind !== "evidence") return;
    const clue = this.state.notebook.addClue(t.data.clueId);
    if (clue) {
      this.interactionSystem.consume(t.data.id);
      t.sprite.setAlpha(0.45);
      const halo = this.evidenceHalos.get(t.data.id);
      if (halo) {
        this.tweens.add({
          targets: halo,
          alpha: 0,
          duration: 300,
          onComplete: () => halo.destroy()
        });
        this.evidenceHalos.delete(t.data.id);
      }
      this.promptText.setVisible(false);
      this.currentTarget = null;
    } else {
      this.showToast("Nothing new here.", "info");
    }
  }

  private handleSuspect(t: InteractableTarget): void {
    const { data } = t;
    if (data.kind !== "suspect") return;
    const suspect = caseData.suspects.find((s) => s.id === data.suspectId);
    if (!suspect) return;

    this.player.setInputEnabled(false);

    const alreadyGreeted = this.state.dialogue.hasGreetedSuspect(suspect.id);
    this.state.dialogue.markSuspectGreeted(suspect.id);

    const session: DialogueSession = {
      speakerLabel: `${suspect.name} — ${suspect.role}`,
      greeting: alreadyGreeted ? [] : suspect.greeting.map((text) => ({ text })),
      getChoices: () => {
        const topicChoices: DialogueChoice[] = this.state
          .getVisibleTopics(suspect.id)
          .map((topic) => ({
            id: topic.id,
            label: topic.label,
            heard: this.state.dialogue.hasHeardTopic(topic.id),
            kind: "topic" as const
          }));
        const contradictionChoices: DialogueChoice[] = this.state
          .getVisibleContradictions(suspect.id)
          .map((c) => ({
            id: c.id,
            label: c.label,
            heard: false,
            kind: "contradiction" as const
          }));
        return [...contradictionChoices, ...topicChoices];
      },
      beginTopic: (topicId) => {
        const topic = this.state
          .getVisibleTopics(suspect.id)
          .find((t) => t.id === topicId);
        return topic?.lines ?? [];
      },
      finishTopic: (topicId) => {
        const topic = this.state
          .getVisibleTopics(suspect.id)
          .find((t) => t.id === topicId);
        if (topic) this.state.completeTopic(topic);
      },
      beginContradiction: (contradictionId) => {
        const c = this.state.getContradiction(contradictionId);
        return {
          prompt: c?.prompt ?? "",
          options: this.state.getAllOwnedEvidence()
        };
      },
      presentEvidence: (contradictionId, evidenceId) => {
        return this.state.presentEvidence(contradictionId, evidenceId);
      }
    };

    this.dialoguePanel.open(session);
  }

  private openAccusation(): void {
    if (this.isAnyPanelOpen()) return;
    if (!this.state.canAccuse()) return;
    this.player.setInputEnabled(false);
    this.accusationPanel.open();
  }

  private wireGlobalKeys(): void {
    const kb = this.input.keyboard;
    if (!kb) return;

    kb.addKey(Phaser.Input.Keyboard.KeyCodes.TAB).on("down", (e: KeyboardEvent) => {
      e.preventDefault?.();
      if (!this.startDismissed) return;
      if (this.dialoguePanel.isOpen() || this.accusationPanel.isOpen() || this.isHelpOpen()) return;
      this.notebookPanel.toggle();
    });
    kb.addKey(Phaser.Input.Keyboard.KeyCodes.I).on("down", () => {
      if (!this.startDismissed) return;
      if (this.dialoguePanel.isOpen() || this.accusationPanel.isOpen() || this.isHelpOpen()) return;
      this.notebookPanel.toggle();
    });
    kb.addKey(Phaser.Input.Keyboard.KeyCodes.H).on("down", () => {
      if (!this.startDismissed) return;
      if (this.dialoguePanel.isOpen() || this.accusationPanel.isOpen()) return;
      this.toggleHelp();
    });

    kb.addKey(Phaser.Input.Keyboard.KeyCodes.ESC).on("down", () => {
      if (this.dialoguePanel.isOpen()) {
        this.dialoguePanel.close();
        return;
      }
      if (this.notebookPanel.isOpen()) {
        this.notebookPanel.close();
        return;
      }
      if (this.isHelpOpen()) {
        this.closeHelp();
        return;
      }
      if (this.accusationPanel.isOpen()) this.accusationPanel.close();
    });

    const advanceIfDialogue = () => {
      if (this.dialoguePanel.isOpen()) this.dialoguePanel.advance();
    };
    kb.addKey(Phaser.Input.Keyboard.KeyCodes.E).on("down", advanceIfDialogue);
    kb.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE).on("down", advanceIfDialogue);

    kb.addCapture(["TAB"]);
  }

  private wireStartOverlay(): void {
    const beginBtn = document.getElementById("start-begin");
    const dismiss = () => this.dismissStart();
    beginBtn?.addEventListener("click", dismiss);
    document.addEventListener(
      "keydown",
      (e) => {
        if (!this.startDismissed && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          dismiss();
        }
      },
      { once: false }
    );
  }

  private dismissStart(): void {
    if (this.startDismissed) return;
    this.startDismissed = true;
    this.startOverlayEl.classList.add("is-hidden");
    this.startOverlayEl.setAttribute("aria-hidden", "true");
  }

  private wireHelpPanel(): void {
    const close = document.getElementById("help-close");
    const dismiss = document.getElementById("help-dismiss");
    close?.addEventListener("click", () => this.closeHelp());
    dismiss?.addEventListener("click", () => this.closeHelp());
  }

  private isHelpOpen(): boolean {
    return !this.helpPanelEl.classList.contains("hidden");
  }

  private toggleHelp(): void {
    if (this.isHelpOpen()) this.closeHelp();
    else this.openHelp();
  }

  private openHelp(): void {
    this.helpPanelEl.classList.remove("hidden");
    this.helpPanelEl.setAttribute("aria-hidden", "false");
  }

  private closeHelp(): void {
    this.helpPanelEl.classList.add("hidden");
    this.helpPanelEl.setAttribute("aria-hidden", "true");
  }

  private renderHighlight(): void {
    this.highlightGfx.clear();
    if (!this.currentTarget) return;
    const { x, y, kind } = this.currentTarget.data;
    // Subtle pulsing radius so the ring feels alive but not distracting.
    const pulse = 1 + Math.sin(this.time.now / 260) * 0.06;
    const baseR = kind === "suspect" ? 26 : 22;
    this.highlightGfx.lineStyle(1, THEME.brassDeep, 0.55);
    this.highlightGfx.strokeCircle(x, y, (baseR + 4) * pulse);
    this.highlightGfx.lineStyle(2, THEME.brassBright, 0.95);
    this.highlightGfx.strokeCircle(x, y, baseR * pulse);
    this.promptText.setPosition(x, y - 30);
  }

  private refreshObjectiveHud(): void {
    const leads = this.state.getVisibleObjectives();
    const nextOpen = leads.find((l) => !l.complete);
    if (!nextOpen) {
      this.objectiveEl.textContent = this.state.canAccuse()
        ? "All leads resolved. When you are ready, press Make Accusation."
        : "All current leads resolved. Check the notebook for your next move.";
      return;
    }
    this.objectiveEl.textContent = `Lead: ${nextOpen.objective.title}`;
  }

  private refreshAccusationButton(): void {
    const ready = this.state.canAccuse();
    this.accuseBtn.classList.toggle("hidden", !ready);
    this.accuseBtn.disabled = !ready;
  }

  /**
   * Append one toast onto the stack. Each entry auto-dismisses; multiple
   * entries stack vertically so a burst of events (e.g. a contradiction that
   * also records new testimony) doesn't clobber the last message.
   */
  private showToast(
    message: string,
    kind: "clue" | "testimony" | "contradiction" | "info" = "info"
  ): void {
    const entry = document.createElement("div");
    entry.className = `toast-entry toast-${kind}`;
    entry.textContent = message;
    this.toastStackEl.appendChild(entry);
    requestAnimationFrame(() => entry.classList.add("show"));
    window.setTimeout(() => {
      entry.classList.remove("show");
      window.setTimeout(() => entry.remove(), 260);
    }, TOAST_MS);
  }
}

function requireEl<T extends HTMLElement = HTMLElement>(selector: string): T {
  const el = document.querySelector<T>(selector);
  if (!el) throw new Error(`Missing required UI element: ${selector}`);
  return el;
}
