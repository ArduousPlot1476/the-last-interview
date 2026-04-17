import type { CaseData } from "../types/game";

export const caseData: CaseData = {
  id: "case-01-the-last-interview",
  title: "The Last Interview",
  summary:
    "Journalist Adrian Vale was found unresponsive in Suite 409 of the Meridian Hotel after a late-night interview. The staff and one remaining guest are all that stand between you and the truth.",
  suspects: [
    {
      id: "suspect-concierge",
      name: "Rosa Marin",
      role: "Night Concierge",
      portraitTint: 0x6aa3d8,
      profile:
        "Ten years at the Meridian's front desk. Sees everyone who comes and goes and remembers it.",
      greeting: [
        "Rosa: Detective. I've been expecting you.",
        "Rosa: Ask what you need to ask. The lobby's quiet tonight."
      ]
    },
    {
      id: "suspect-manager",
      name: "Desmond Lark",
      role: "Hotel Manager",
      portraitTint: 0xc98c5a,
      profile:
        "Manager of two years. Was doing receipts in the back office the night of the incident, or so he says.",
      greeting: [
        "Desmond: A guest dies on my floor and suddenly I'm on a list. Wonderful.",
        "Desmond: Make this quick, Detective. I have a business to run."
      ]
    },
    {
      id: "suspect-guest",
      name: "Ivy Chen",
      role: "Hotel Guest — Suite 411",
      portraitTint: 0xb77bd0,
      profile:
        "Staying in 411, the room next to Vale's. Quiet, watchful, in no hurry to check out.",
      greeting: [
        "Ivy: I was wondering when you'd come find me.",
        "Ivy: I'll answer what I can. I'd rather not be dragged into this, if it's all the same."
      ]
    }
  ],
  clues: [
    {
      id: "clue-reception-log",
      title: "Reception Log Entry",
      description:
        "Adrian Vale signed out a package at 11:04 PM. Signature is rushed — the ink smears as if he left in a hurry.",
      sourceLocation: "Reception Desk"
    },
    {
      id: "clue-coffee-cup",
      title: "Half-Empty Coffee Cup",
      description:
        "Lipstick trace on the rim. Lobby paper coaster underneath is dated tonight. Someone was waiting a while.",
      sourceLocation: "Lobby Armchair"
    },
    {
      id: "clue-torn-note",
      title: "Torn Note Fragment",
      description:
        "Shredded stationery reads: \"...409 at 11:30 — don't be late. Bring the tape.\" The handwriting is neat, slanted right.",
      sourceLocation: "Lobby Trash Bin"
    },
    {
      id: "clue-office-ledger",
      title: "Back-Office Ledger",
      description:
        "A ledger entry for room 409 shows a 'complimentary upgrade' approved by D. Lark at 10:52 PM. No guest request is recorded.",
      sourceLocation: "Back Office Desk"
    },
    {
      id: "clue-broken-pen",
      title: "Broken Fountain Pen",
      description:
        "A silver fountain pen, cracked at the nib, ink still wet. Engraved: 'A.V.' The casing matches Vale's monogram.",
      sourceLocation: "Back Office Cabinet"
    }
  ]
};
