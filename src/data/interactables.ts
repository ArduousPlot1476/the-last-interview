import type { InteractablePlacement } from "../types/game";

// Canvas target: 960 x 640. Lobby on the left, back office on the right,
// connected by a doorway at x=640, y=300-360.
export const interactables: InteractablePlacement[] = [
  // Lobby evidence
  {
    id: "hotspot-reception-log",
    kind: "evidence",
    clueId: "clue-reception-log",
    x: 160,
    y: 150,
    label: "Reception Log"
  },
  {
    id: "hotspot-coffee-cup",
    kind: "evidence",
    clueId: "clue-coffee-cup",
    x: 380,
    y: 470,
    label: "Coffee Cup"
  },
  {
    id: "hotspot-torn-note",
    kind: "evidence",
    clueId: "clue-torn-note",
    x: 560,
    y: 520,
    label: "Trash Bin"
  },

  // Back-office evidence
  {
    id: "hotspot-office-ledger",
    kind: "evidence",
    clueId: "clue-office-ledger",
    x: 780,
    y: 200,
    label: "Office Ledger"
  },
  {
    id: "hotspot-broken-pen",
    kind: "evidence",
    clueId: "clue-broken-pen",
    x: 870,
    y: 470,
    label: "Cabinet"
  },

  // Suspects
  {
    id: "npc-rosa",
    kind: "suspect",
    suspectId: "suspect-concierge",
    x: 240,
    y: 200,
    label: "Rosa Marin"
  },
  {
    id: "npc-ivy",
    kind: "suspect",
    suspectId: "suspect-guest",
    x: 470,
    y: 260,
    label: "Ivy Chen"
  },
  {
    id: "npc-desmond",
    kind: "suspect",
    suspectId: "suspect-manager",
    x: 750,
    y: 330,
    label: "Desmond Lark"
  }
];

// Static collision rectangles defining the two rooms and a dividing wall
// with a doorway gap. Walls are drawn and used for player collision.
export interface WallRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export const walls: WallRect[] = [
  // Outer perimeter (lobby + office combined)
  { x: 0, y: 60, width: 960, height: 20 }, // top wall
  { x: 0, y: 600, width: 960, height: 20 }, // bottom wall
  { x: 0, y: 60, width: 20, height: 560 }, // left wall
  { x: 940, y: 60, width: 20, height: 560 }, // right wall

  // Divider between lobby (left) and back office (right), with a gap at y 300-360
  { x: 630, y: 80, width: 20, height: 220 },
  { x: 630, y: 360, width: 20, height: 240 },

  // Lobby furniture as collision (reception counter, armchair, planter)
  { x: 120, y: 100, width: 200, height: 40 }, // reception counter
  { x: 340, y: 480, width: 80, height: 40 }, // armchair
  { x: 540, y: 500, width: 40, height: 40 }, // trash bin

  // Office furniture (desk, cabinet)
  { x: 740, y: 160, width: 120, height: 50 }, // desk
  { x: 840, y: 430, width: 70, height: 70 } // cabinet
];

export const playerSpawn = { x: 320, y: 400 };
