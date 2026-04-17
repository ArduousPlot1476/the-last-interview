import type { Contradiction } from "../types/contradiction";

/**
 * Milestone 3 contradictions. Each appears as a dialogue choice once its
 * prerequisites are satisfied and disappears once resolved. Two are
 * critical (the Justice ending requires both); one is supporting.
 */
export const contradictions: Contradiction[] = [
  // Critical — proves Desmond met Vale after check-in
  {
    id: "contradiction-pen",
    suspectId: "suspect-manager",
    critical: true,
    label: "Press him on the pen.",
    targetTestimonyId: "testimony-desmond-denies-meeting",
    validEvidence: ["clue-broken-pen"],
    requires: {
      testimony: ["testimony-desmond-denies-meeting"],
      clues: ["clue-broken-pen"]
    },
    prompt:
      "Desmond has sworn he never spoke with Vale after check-in. What do you put on his desk?",
    successLines: [
      { text: "You set Vale's broken fountain pen on his desk. The 'A.V.' engraving catches the lamplight." },
      { text: "Desmond is still for a long moment." },
      { text: "Desmond: … fine. Fine. He came to the office at eleven-forty." },
      { text: "Desmond: He was going to press a story in the morning. He wanted me to quote myself for it." },
      { text: "Desmond: He put the pen down on the desk to — to sign something. I pushed his hand away. The pen broke. He left." },
      { text: "Detective: That is the first true thing you have said tonight, Mr. Lark." }
    ],
    failureLines: [
      { text: "You offer the item. Desmond glances at it, unmoved." },
      { text: "Desmond: I don't see what this has to do with whether I saw Mr. Vale tonight." },
      { text: "You decide to try a different angle." }
    ],
    onSuccess: {
      setsFlags: ["contradiction-met-vale"],
      records: [
        {
          id: "testimony-desmond-admits-meeting",
          statement:
            "Confronted with Vale's broken pen, Desmond admitted Vale came to the back office at 11:40 PM to press a story. They argued. Vale left."
        }
      ]
    },
    resolutionSummary:
      "Desmond admitted meeting Vale at 11:40 PM after claiming he never saw him again."
  },

  // Critical — proves Desmond knew Vale personally, despite his denial
  {
    id: "contradiction-knew-vale",
    suspectId: "suspect-manager",
    critical: true,
    label: "Press him: you claimed not to know Vale.",
    targetTestimonyId: "testimony-desmond-barely-knew-vale",
    validEvidence: ["testimony-rosa-vale-complaint"],
    requires: {
      testimony: ["testimony-desmond-barely-knew-vale", "testimony-rosa-vale-complaint"]
    },
    prompt:
      "Desmond has claimed Vale was a stranger to him. What do you put to him?",
    successLines: [
      { text: "You read from your notebook. 'Last year. A complaint filed by A. Vale against the Meridian's accounts. Inspected. Dropped.'" },
      { text: "Desmond: That matter was disposed of. It has no bearing on—" },
      { text: "Detective: You told me you didn't know any of two hundred guests a month. You knew this one, Mr. Lark. You knew him by name." },
      { text: "Desmond: … I knew him." }
    ],
    failureLines: [
      { text: "Desmond reads what you hand him without expression." },
      { text: "Desmond: I don't know what you think this proves, Detective." },
      { text: "You'll need something more specific." }
    ],
    onSuccess: {
      setsFlags: ["contradiction-knew-vale"],
      records: [
        {
          id: "testimony-desmond-admits-knew-vale",
          statement:
            "Presented with Rosa's account of last year's complaint, Desmond conceded he knew Vale personally — a direct reversal of his earlier denial."
        }
      ]
    },
    resolutionSummary:
      "Desmond conceded he knew Vale personally after denying it."
  },

  // Supporting — exposes Ivy's evasiveness (she is not the culprit)
  {
    id: "contradiction-ivy-source",
    suspectId: "suspect-guest",
    critical: false,
    label: "Press her: the elevator wasn't the whole story.",
    targetTestimonyId: "testimony-ivy-knew-vale-surface",
    validEvidence: ["clue-torn-note"],
    requires: {
      testimony: ["testimony-ivy-knew-vale-surface"],
      clues: ["clue-torn-note"]
    },
    prompt:
      "Ivy has said she barely knew Vale. What do you show her?",
    successLines: [
      { text: "You unfold the torn note in front of her. She looks at her own handwriting for a long moment." },
      { text: "Ivy: We had been writing to each other for a month." },
      { text: "Ivy: I was going on record tonight as his source. You were going to find that out, Detective. I would rather you found it out from me." },
      { text: "Detective: Lie to me once more and I will stop asking you politely." }
    ],
    failureLines: [
      { text: "Ivy studies what you're showing her without reacting." },
      { text: "Ivy: I don't follow, Detective. Is this meant to mean something to me?" }
    ],
    onSuccess: {
      setsFlags: ["contradiction-ivy-acknowledged", "ivy-confirmed-source"],
      records: [
        {
          id: "testimony-ivy-forthright",
          statement:
            "Pressed with the torn note in her own handwriting, Ivy acknowledged she'd been corresponding with Vale for a month and was his on-record source."
        }
      ]
    },
    resolutionSummary:
      "Ivy acknowledged she was Vale's source after first claiming she barely knew him."
  }
];
