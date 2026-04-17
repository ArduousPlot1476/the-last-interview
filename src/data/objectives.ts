import type { Objective } from "../types/dialogue";

/**
 * Open leads the player can work on. Each has a visibility gate (when it
 * first appears in the notebook) and a completion gate (when it gets a ✓).
 * Completed objectives stay on the list for reference — they're the trail
 * of progress the player has built.
 */
export const objectives: Objective[] = [
  {
    id: "obj-canvass-lobby",
    order: 10,
    title: "Canvass the lobby for evidence",
    hint: "Inspect every object of interest in the lobby.",
    completeWhen: {
      clues: ["clue-reception-log", "clue-coffee-cup", "clue-torn-note"]
    }
  },
  {
    id: "obj-meet-suspects",
    order: 20,
    title: "Speak with Rosa, Ivy, and Desmond",
    hint: "Get an opening statement from each of them.",
    completeWhen: {
      topicsHeard: ["rosa-tonight", "ivy-where-were-you", "desmond-where-were-you"]
    }
  },
  {
    id: "obj-lobby-timeline",
    order: 30,
    title: "Establish who was in the lobby and when",
    hint: "Rosa saw everything from the desk. Ask her.",
    completeWhen: {
      testimony: ["testimony-rosa-ivy-lobby", "testimony-rosa-vale-11pm"]
    }
  },
  {
    id: "obj-investigate-office",
    order: 40,
    title: "Investigate the back office",
    hint: "The doorway is on the east wall of the lobby.",
    visibleWhen: {
      testimony: ["testimony-rosa-vale-11pm"]
    },
    completeWhen: {
      clues: ["clue-office-ledger", "clue-broken-pen"]
    }
  },
  {
    id: "obj-press-desmond-ledger",
    order: 50,
    title: "Press Desmond about the 409 upgrade",
    hint: "The ledger says he approved it himself. Ask why.",
    visibleWhen: { clues: ["clue-office-ledger"] },
    completeWhen: { testimony: ["testimony-desmond-denies-meeting"] }
  },
  {
    id: "obj-press-desmond-pen",
    order: 60,
    title: "Ask Desmond about Vale's broken pen",
    hint: "It's engraved 'A.V.' and it's on his cabinet. He'll have to explain.",
    visibleWhen: { clues: ["clue-broken-pen"] },
    completeWhen: { testimony: ["testimony-desmond-pen-excuse"] }
  },
  {
    id: "obj-confront-ivy-note",
    order: 70,
    title: "Match the torn note to its writer",
    hint: "The handwriting is neat and slanted. Someone in this hotel wrote it.",
    visibleWhen: { clues: ["clue-torn-note"] },
    completeWhen: { flags: ["ivy-confirmed-source"] }
  },
  {
    id: "obj-reason-vale-here",
    order: 80,
    title: "Find out why Vale came to the Meridian",
    hint: "It wasn't a vacation. Someone here knows what the story was.",
    visibleWhen: { flags: ["ivy-admitted-waiting"] },
    completeWhen: { flags: ["vale-investigating-desmond"] }
  },
  {
    id: "obj-revisit-rosa-history",
    order: 90,
    title: "Ask Rosa about Desmond's history with Vale",
    hint: "Rosa is willing to talk once the ledger's anomaly is out in the open.",
    visibleWhen: { flags: ["rosa-questions-desmond"] },
    completeWhen: { testimony: ["testimony-rosa-vale-complaint"] }
  },
  {
    id: "obj-final-confront",
    order: 100,
    title: "Confront Desmond with Vale's story",
    hint: "Once you know what Vale was writing, put it to Desmond directly.",
    visibleWhen: { flags: ["vale-investigating-desmond"] },
    completeWhen: { flags: ["desmond-hostile"] }
  }
];
