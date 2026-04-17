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

const INTERACT_RADIUS = 64;

/**
 * Playable investigation scene. Responsibilities:
 *   - Build static environment (rooms + walls)
 *   - Spawn player and interactables
 *   - Wire the InteractionSystem to the InvestigationState and UI
 *   - Route Tab to the notebook and Esc to close panels
 *   - Surface the accusation button when the threshold is met
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
  private toastEl!: HTMLElement;
  private objectiveEl!: HTMLElement;
  private accuseBtn!: HTMLButtonElement;
  private toastTimer?: number;

  constructor() {
    super("InvestigationScene");
  }

  create(): void {
    this.physics.world.setBounds(0, 60, GAME_WIDTH, GAME_HEIGHT - 60);

    this.drawEnvironment();
    const wallGroup = this.buildWallColliders();

    this.player = new Player(this, playerSpawn.x, playerSpawn.y, "player");
    this.physics.add.collider(this.player.sprite, wallGroup);

    this.state = new InvestigationState();
    this.dialoguePanel = new DialoguePanel();
    this.notebookPanel = new NotebookPanel(this.state);
    this.accusationPanel = new AccusationPanel(this.state);
    this.toastEl = requireEl("#toast");
    this.objectiveEl = requireEl("#objective");
    this.accuseBtn = requireEl<HTMLButtonElement>("#accusation-button");
    this.accuseBtn.addEventListener("click", () => this.openAccusation());

    this.interactionSystem = new InteractionSystem(this, () => ({
      x: this.player.x,
      y: this.player.y
    }));

    this.highlightGfx = this.add.graphics();
    this.highlightGfx.setDepth(4);

    this.promptText = this.add.text(0, 0, "", {
      fontFamily: "Inter, system-ui, sans-serif",
      fontSize: "13px",
      color: "#e6edf3",
      backgroundColor: "#0e1116cc",
      padding: { x: 6, y: 3 }
    });
    this.promptText.setDepth(11);
    this.promptText.setOrigin(0.5, 1);
    this.promptText.setVisible(false);

    this.spawnInteractables();
    this.wireInteractionEvents();
    this.wireGlobalKeys();

    this.state.notebook.on("clue-added", (clue: ClueData) => {
      this.showToast(`Clue added: ${clue.title}`);
    });
    this.state.dialogue.on(
      "testimony-recorded",
      (entry: { statement: string }) => {
        const summary = entry.statement.length > 70
          ? `${entry.statement.slice(0, 67)}…`
          : entry.statement;
        this.showToast(`Testimony recorded: ${summary}`);
      }
    );
    this.state.dialogue.on("contradiction-resolved", (id: string) => {
      const c = this.state.getContradiction(id);
      if (c) this.showToast(`Contradiction resolved: ${c.resolutionSummary}`);
    });

    this.state.on("state-changed", () => {
      this.refreshObjectiveHud();
      this.refreshAccusationButton();
    });
    this.refreshObjectiveHud();
    this.refreshAccusationButton();
  }

  update(): void {
    const panelOpen =
      this.dialoguePanel.isOpen() ||
      this.notebookPanel.isOpen() ||
      this.accusationPanel.isOpen();
    this.player.setInputEnabled(!panelOpen);
    this.player.update();
    if (!panelOpen) this.interactionSystem.update();
    this.renderHighlight();
  }

  // ------- environment -------

  private drawEnvironment(): void {
    const floors = this.add.graphics();
    floors.fillStyle(0x1a2028, 1);
    floors.fillRect(20, 80, 610, 520);
    floors.fillStyle(0x1f2730, 1);
    floors.fillRect(650, 80, 290, 520);

    floors.lineStyle(1, 0x232b35, 1);
    for (let x = 20; x <= 940; x += 40) {
      floors.lineBetween(x, 80, x, 600);
    }
    for (let y = 80; y <= 600; y += 40) {
      floors.lineBetween(20, y, 940, y);
    }

    this.add
      .text(325, 90, "HOTEL LOBBY", {
        fontFamily: "Inter, system-ui, sans-serif",
        fontSize: "12px",
        color: "#5b6572",
        fontStyle: "bold"
      })
      .setOrigin(0.5, 0);
    this.add
      .text(795, 90, "BACK OFFICE", {
        fontFamily: "Inter, system-ui, sans-serif",
        fontSize: "12px",
        color: "#5b6572",
        fontStyle: "bold"
      })
      .setOrigin(0.5, 0);

    this.add
      .text(640, 330, "▸", {
        fontSize: "16px",
        color: "#d0a656"
      })
      .setOrigin(0.5, 0.5);

    const wallGfx = this.add.graphics();
    wallGfx.fillStyle(0x2c333d, 1);
    wallGfx.lineStyle(1, 0x3a424d, 1);
    for (const w of walls) {
      wallGfx.fillRect(w.x, w.y, w.width, w.height);
      wallGfx.strokeRect(w.x, w.y, w.width, w.height);
    }
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
    container.setDepth(5);

    if (data.kind === "evidence") {
      const icon = this.add.image(0, 0, "evidence-icon");
      icon.setScale(1.1);
      container.add(icon);
    } else if (data.kind === "suspect") {
      const icon = this.add.image(0, -2, "suspect-icon");
      const suspect = caseData.suspects.find((s) => s.id === data.suspectId);
      if (suspect?.portraitTint !== undefined) icon.setTint(suspect.portraitTint);
      icon.setScale(1.2);
      container.add(icon);
    }

    const label = this.add.text(0, 22, data.label, {
      fontFamily: "Inter, system-ui, sans-serif",
      fontSize: "11px",
      color: "#8b949e"
    });
    label.setOrigin(0.5, 0);
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
      if (
        this.dialoguePanel.isOpen() ||
        this.notebookPanel.isOpen() ||
        this.accusationPanel.isOpen()
      )
        return;
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
      this.promptText.setVisible(false);
      this.currentTarget = null;
    } else {
      this.showToast("Nothing new here.");
    }
  }

  private handleSuspect(t: InteractableTarget): void {
    const { data } = t;
    if (data.kind !== "suspect") return;
    const suspect = caseData.suspects.find((s) => s.id === data.suspectId);
    if (!suspect) return;

    this.player.setInputEnabled(false);

    const session: DialogueSession = {
      speakerLabel: `${suspect.name} — ${suspect.role}`,
      greeting: suspect.greeting.map((text) => ({ text })),
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
    if (
      this.dialoguePanel.isOpen() ||
      this.notebookPanel.isOpen() ||
      this.accusationPanel.isOpen()
    )
      return;
    if (!this.state.canAccuse()) return;
    this.player.setInputEnabled(false);
    this.accusationPanel.open();
  }

  private wireGlobalKeys(): void {
    const kb = this.input.keyboard;
    if (!kb) return;

    kb.addKey(Phaser.Input.Keyboard.KeyCodes.TAB).on("down", (e: KeyboardEvent) => {
      e.preventDefault?.();
      if (this.dialoguePanel.isOpen() || this.accusationPanel.isOpen()) return;
      this.notebookPanel.toggle();
    });
    kb.addKey(Phaser.Input.Keyboard.KeyCodes.I).on("down", () => {
      if (this.dialoguePanel.isOpen() || this.accusationPanel.isOpen()) return;
      this.notebookPanel.toggle();
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
      if (this.accusationPanel.isOpen()) this.accusationPanel.close();
    });

    const advanceIfDialogue = () => {
      if (this.dialoguePanel.isOpen()) this.dialoguePanel.advance();
    };
    kb.addKey(Phaser.Input.Keyboard.KeyCodes.E).on("down", advanceIfDialogue);
    kb.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE).on("down", advanceIfDialogue);

    kb.addCapture(["TAB"]);
  }

  private renderHighlight(): void {
    this.highlightGfx.clear();
    if (!this.currentTarget) return;
    const { x, y } = this.currentTarget.data;
    this.highlightGfx.lineStyle(2, 0xd0a656, 0.9);
    this.highlightGfx.strokeCircle(x, y, 22);
    this.promptText.setPosition(x, y - 26);
  }

  private refreshObjectiveHud(): void {
    const leads = this.state.getVisibleObjectives();
    const nextOpen = leads.find((l) => !l.complete);
    if (!nextOpen) {
      this.objectiveEl.textContent =
        "All current leads resolved. Check the notebook for your next move.";
      return;
    }
    this.objectiveEl.textContent = `Lead: ${nextOpen.objective.title}`;
  }

  private refreshAccusationButton(): void {
    const ready = this.state.canAccuse();
    this.accuseBtn.classList.toggle("hidden", !ready);
    this.accuseBtn.disabled = !ready;
  }

  private showToast(message: string): void {
    this.toastEl.textContent = message;
    this.toastEl.classList.remove("hidden");
    requestAnimationFrame(() => this.toastEl.classList.add("show"));
    if (this.toastTimer !== undefined) window.clearTimeout(this.toastTimer);
    this.toastTimer = window.setTimeout(() => {
      this.toastEl.classList.remove("show");
      this.toastTimer = window.setTimeout(() => {
        this.toastEl.classList.add("hidden");
      }, 260);
    }, 2400);
  }
}

function requireEl<T extends HTMLElement = HTMLElement>(selector: string): T {
  const el = document.querySelector<T>(selector);
  if (!el) throw new Error(`Missing required UI element: ${selector}`);
  return el;
}
