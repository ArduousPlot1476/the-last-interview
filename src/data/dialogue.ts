import type { DialogueTopic } from "../types/dialogue";

/**
 * Authored suspect dialogue for Milestone 2. Each topic is gated on the
 * investigation state (clues + flags + prior testimony) and, when heard,
 * can record testimony and set flags that unlock further topics.
 *
 * Testimony IDs and flag names are referenced by objectives (see
 * src/data/objectives.ts) and by other topics' `requires` blocks.
 */
export const dialogueTopics: DialogueTopic[] = [
  // -------------------------------------------------------------------------
  // Rosa Marin — Night Concierge
  // -------------------------------------------------------------------------
  {
    id: "rosa-tonight",
    suspectId: "suspect-concierge",
    label: "What did you see tonight?",
    order: 10,
    lines: [
      {
        text: "Rosa: Vale came down once. Around eleven. He asked me to hold a courier package for him."
      },
      {
        text: "Rosa: He was writing in a little notebook as he spoke to me. He didn't look at me once."
      },
      {
        text: "Rosa: That was the last I saw him alive."
      }
    ],
    records: [
      {
        id: "testimony-rosa-vale-11pm",
        statement:
          "Rosa saw Vale at the desk around 11 PM. He was distracted, writing in a notebook, asked her to hold a courier package."
      }
    ]
  },
  {
    id: "rosa-lobby-guests",
    suspectId: "suspect-concierge",
    label: "Who else was in the lobby tonight?",
    order: 20,
    lines: [
      {
        text: "Rosa: The guest from 411. Miss Chen. She sat in the armchair by the window for the better part of an hour."
      },
      {
        text: "Rosa: She ordered a coffee. She didn't drink much of it. She kept checking her watch."
      },
      { text: "Rosa: Around 11:30 she went upstairs. She came back down maybe ten minutes later, pale." }
    ],
    records: [
      {
        id: "testimony-rosa-ivy-lobby",
        statement:
          "Rosa saw Ivy Chen waiting in the lobby for ~1 hour. Ordered coffee, barely drank it, checked her watch. Went upstairs ~11:30, came back pale ~10 min later."
      }
    ],
    setsFlags: ["rosa-mentioned-ivy-waited"]
  },
  {
    id: "rosa-log",
    suspectId: "suspect-concierge",
    label: "About this rushed log entry…",
    order: 30,
    requires: { clues: ["clue-reception-log"] },
    lines: [
      { text: "Rosa: Let me see that. … Yes. That's him. He never signs that sloppy." },
      {
        text: "Rosa: He said — and I remember this exactly — 'I need to be upstairs in five minutes. I'm finishing a conversation.'"
      },
      { text: "Rosa: He was nervous, Detective. Or angry. I couldn't quite tell." }
    ],
    records: [
      {
        id: "testimony-rosa-vale-upstairs",
        statement:
          "Rosa says Vale told her at 11:04 PM he needed to be 'upstairs in five minutes to finish a conversation.' He seemed nervous or angry."
      }
    ]
  },
  {
    id: "rosa-ledger",
    suspectId: "suspect-concierge",
    label: "About this 409 upgrade in the ledger…",
    order: 40,
    requires: { clues: ["clue-office-ledger"] },
    lines: [
      {
        text: "Rosa: That's Desmond's signature. He upgraded Mr. Vale himself?"
      },
      {
        text: "Rosa: He didn't run it past the desk. That is not how we do things here. Every comp goes through me first."
      },
      {
        text: "Rosa: If you're asking me whether that looks normal — no. It does not."
      }
    ],
    records: [
      {
        id: "testimony-rosa-upgrade-unusual",
        statement:
          "Rosa confirms Desmond approved Vale's 409 upgrade without going through the desk. She considers this procedurally unusual."
      }
    ],
    setsFlags: ["rosa-questions-desmond"]
  },
  {
    id: "rosa-desmond-history",
    suspectId: "suspect-concierge",
    label: "Why would Desmond bypass procedure?",
    order: 50,
    requires: { flags: ["rosa-questions-desmond"] },
    lines: [
      { text: "Rosa: I shouldn't be the one telling you this, but — Mr. Vale was not a stranger to Desmond." },
      {
        text: "Rosa: Last year a journalist filed a complaint about financial irregularities at the hotel. The name on the complaint was A. Vale."
      },
      {
        text: "Rosa: Desmond was questioned. The matter was dropped. Or, rather, it was made to go away."
      }
    ],
    records: [
      {
        id: "testimony-rosa-vale-complaint",
        statement:
          "Rosa says Vale filed a complaint last year about financial irregularities at the hotel. Desmond was questioned; the matter was 'made to go away.'"
      }
    ],
    setsFlags: ["learned-vale-desmond-history"]
  },

  // -------------------------------------------------------------------------
  // Ivy Chen — Hotel Guest
  // -------------------------------------------------------------------------
  {
    id: "ivy-where-were-you",
    suspectId: "suspect-guest",
    label: "Where were you tonight?",
    order: 10,
    lines: [
      { text: "Ivy: Mostly in the lobby. Then my room. I didn't sleep well." },
      { text: "Ivy: I heard arguing through the wall around midnight. A man's voice. Then nothing." },
      { text: "Ivy: I turned the television up. I'm not proud of it." }
    ],
    records: [
      {
        id: "testimony-ivy-heard-arguing",
        statement:
          "Ivy claims she heard a man arguing through the wall of 409 around midnight, then silence. She turned the TV up."
      }
    ]
  },
  {
    id: "ivy-knew-vale",
    suspectId: "suspect-guest",
    label: "Did you know Mr. Vale?",
    order: 20,
    lines: [
      { text: "Ivy: We shared an elevator once. That's all." },
      { text: "Ivy: I recognized his byline. He wrote for the Ledger. I read him occasionally." }
    ],
    records: [
      {
        id: "testimony-ivy-knew-vale-surface",
        statement: "Ivy says she only knew Vale from his byline in the Ledger and one elevator ride."
      }
    ]
  },
  {
    id: "ivy-coffee",
    suspectId: "suspect-guest",
    label: "Whose coffee was that in the lobby?",
    order: 30,
    requires: { clues: ["clue-coffee-cup"] },
    lines: [
      { text: "Ivy: That… that's mine. Yes." },
      { text: "Ivy: I was waiting for someone. He never came down. So I went up." },
      { text: "Ivy: Alright. I knocked on 409 at eleven-thirty. No one answered. That is all I did." }
    ],
    records: [
      {
        id: "testimony-ivy-waited-for-vale",
        statement:
          "Ivy admits the lobby coffee was hers. She was waiting for Vale. When he didn't come down she went to 409 at 11:30 and knocked. No answer, she says."
      }
    ],
    setsFlags: ["ivy-admitted-waiting"]
  },
  {
    id: "ivy-note",
    suspectId: "suspect-guest",
    label: "About this torn note…",
    order: 40,
    requires: { clues: ["clue-torn-note"], flags: ["ivy-admitted-waiting"] },
    lines: [
      { text: "Ivy: Where did you— yes. I wrote that." },
      {
        text: "Ivy: Vale was meeting me. I was his source. I was going on record tonight. That's why I came here."
      },
      { text: "Ivy: When he didn't come down I panicked and threw the note away. I shouldn't have." }
    ],
    records: [
      {
        id: "testimony-ivy-was-source",
        statement:
          "Ivy wrote the '409 at 11:30' note. She was Vale's source and was going on record tonight. She threw the note away when he didn't show."
      }
    ],
    setsFlags: ["ivy-confirmed-source"]
  },
  {
    id: "ivy-story",
    suspectId: "suspect-guest",
    label: "What were you giving him?",
    order: 50,
    requires: { flags: ["ivy-confirmed-source"] },
    lines: [
      { text: "Ivy: I used to work in the accounts office here. Before Desmond." },
      {
        text: "Ivy: The books don't balance, Detective. They haven't for two years. Money moves through this hotel that should not be moving."
      },
      { text: "Ivy: Vale was going to publish. I had the tape. He wanted it tonight." }
    ],
    records: [
      {
        id: "testimony-ivy-embezzlement-story",
        statement:
          "Ivy was going to provide Vale with evidence of financial irregularities at the Meridian — she worked accounts there before Desmond. Vale intended to publish."
      }
    ],
    setsFlags: ["vale-investigating-desmond"]
  },

  // -------------------------------------------------------------------------
  // Desmond Lark — Hotel Manager
  // -------------------------------------------------------------------------
  {
    id: "desmond-where-were-you",
    suspectId: "suspect-manager",
    label: "Where were you tonight?",
    order: 10,
    lines: [
      { text: "Desmond: Back office. Receipts. From eight until I heard the scream at a quarter past midnight." },
      { text: "Desmond: No one came through. No one left. I am, unfortunately, an alibi of one." }
    ],
    records: [
      {
        id: "testimony-desmond-alibi-office",
        statement:
          "Desmond claims he was alone in the back office reconciling receipts from 8 PM until the 12:15 AM scream. No witnesses."
      }
    ]
  },
  {
    id: "desmond-knew-vale",
    suspectId: "suspect-manager",
    label: "Your relationship with Mr. Vale?",
    order: 20,
    lines: [
      { text: "Desmond: I checked him in. I did not know him." },
      { text: "Desmond: He was a guest. I have two hundred guests a month. I don't know any of them." }
    ],
    records: [
      {
        id: "testimony-desmond-barely-knew-vale",
        statement:
          "Desmond claims he only knew Vale as one of 'two hundred guests a month.' Denies any personal knowledge."
      }
    ]
  },
  {
    id: "desmond-ledger",
    suspectId: "suspect-manager",
    label: "Why did you upgrade him to 409 yourself?",
    order: 30,
    requires: { clues: ["clue-office-ledger"] },
    lines: [
      { text: "Desmond: It was a courtesy. He was a repeat guest." },
      {
        text: "Desmond: I was at the desk when he arrived, Rosa was away from the counter, so I did it myself. There is nothing unusual about that."
      },
      { text: "Desmond: I did not speak with him after check-in. I was in the office all night." }
    ],
    records: [
      {
        id: "testimony-desmond-denies-meeting",
        statement:
          "Desmond claims the 409 upgrade was a routine courtesy because Rosa was away. He denies speaking with Vale after check-in."
      }
    ],
    setsFlags: ["desmond-denies-second-meeting"]
  },
  {
    id: "desmond-pen",
    suspectId: "suspect-manager",
    label: "About this broken pen on your cabinet…",
    order: 40,
    requires: { clues: ["clue-broken-pen"] },
    lines: [
      { text: "Desmond: That — that is not mine. Put that down." },
      { text: "Desmond: A guest must have left it. I was going to return it in the morning." },
      {
        text: "Desmond: I have three hundred things to do in a night, Detective. I do not catalogue every object on my furniture."
      }
    ],
    records: [
      {
        id: "testimony-desmond-pen-excuse",
        statement:
          "Desmond claims Vale's engraved fountain pen was 'left by a guest' and he was going to return it. He is visibly rattled by the question."
      }
    ],
    setsFlags: ["desmond-rattled-by-pen"]
  },
  {
    id: "desmond-investigation",
    suspectId: "suspect-manager",
    label: "About the story Vale was writing…",
    order: 50,
    requires: { flags: ["vale-investigating-desmond"] },
    lines: [
      { text: "Desmond: So she told you. Of course she told you. She'd love to see me hang." },
      { text: "Desmond: That story was fiction. The complaint last year was dismissed. The complaint this year would have been dismissed as well." },
      { text: "Desmond: If someone put Adrian Vale in the ground, Detective — they did my industry a favor. But it was not me." }
    ],
    records: [
      {
        id: "testimony-desmond-hostile",
        statement:
          "Confronted with Vale's investigation, Desmond calls the story fiction and implies he is glad Vale is dead. Denies involvement."
      }
    ],
    setsFlags: ["desmond-hostile"]
  }
];
