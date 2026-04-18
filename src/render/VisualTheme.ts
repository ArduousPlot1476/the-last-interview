/**
 * Central palette and shared layout constants for the neo-noir hotel look.
 * Everything renderable should pull from here so the world/UI stay cohesive.
 */

export const THEME = {
  // Base
  void: 0x070a10,
  wallDark: 0x141923,
  wallMid: 0x1b2230,
  wallLight: 0x242c3c,
  wallTrimDark: 0x2a3245,
  wallTrimLight: 0x3a4560,

  // Floors
  lobbyFloor: 0x141a24,
  lobbyFloorPlank: 0x1a2230,
  lobbyFloorHighlight: 0x232c3d,
  officeFloor: 0x181e2a,
  officeFloorPlank: 0x202836,

  // Rugs / treatments
  rugDeep: 0x401821,
  rugMid: 0x5a2129,
  rugGold: 0x8a6a30,

  // Brass / amber accents
  brass: 0xd0a656,
  brassBright: 0xedc47a,
  brassDeep: 0x8a6a30,
  amber: 0xffb860,
  amberSoft: 0xffd892,
  amberGlow: 0xffa24a,

  // Wood
  woodDeep: 0x1d120b,
  woodDark: 0x2c1c12,
  woodMid: 0x4a2f1c,
  woodLight: 0x6b4724,
  woodHighlight: 0x8a6236,

  // Characters
  playerCoat: 0x28201e,
  playerCoatHighlight: 0x463832,
  playerAccent: 0xd0a656,
  playerSkin: 0xc99a78,
  playerShirt: 0xe6d3a8,

  // Evidence
  evidenceCore: 0xedc47a,
  evidenceGlow: 0xffa24a,
  evidenceRim: 0x8a6a30,

  // Shadow / fx
  shadow: 0x000000,

  // Text colors
  signText: "#d0a656",
  signTextDim: "#7a6a3c",
  labelText: "#b9a270",
  labelMuted: "#5a5040"
} as const;

export const LAYOUT = {
  room: {
    x: 20,
    y: 80,
    right: 940,
    bottom: 600
  },
  lobby: {
    x: 20,
    y: 80,
    width: 610,
    height: 520
  },
  office: {
    x: 650,
    y: 80,
    width: 290,
    height: 520
  },
  doorway: {
    x: 630,
    y: 300,
    width: 20,
    height: 60
  }
} as const;

/**
 * Phaser depth bands. Keeping these explicit prevents z-order regressions
 * when new layers are introduced.
 */
export const DEPTH = {
  floor: 0,
  floorOverlay: 1,
  rug: 2,
  wallBack: 3,
  lightPool: 4,
  propBack: 5,
  shadow: 6,
  prop: 7,
  highlight: 8,
  character: 10,
  player: 11,
  dust: 14,
  prompt: 18,
  vignette: 20
} as const;
