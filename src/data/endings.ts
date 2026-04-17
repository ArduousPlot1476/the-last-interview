import type { Ending } from "../types/contradiction";

/**
 * Three authored endings. Selection is decided by InvestigationState based on
 * the accused suspect + which critical contradictions + flags have been resolved
 * by the time the player commits. The `{name}` placeholder in the wrong-accusation
 * ending is interpolated against the accused suspect's display name.
 */
export const endings: Ending[] = [
  {
    id: "ending-justice",
    title: "Case Closed — Justice",
    subtitle: "Desmond Lark is led out of the Meridian in handcuffs.",
    lines: [
      "You put three things on the back-office desk: the broken fountain pen, Rosa's statement about the year-old complaint, and Ivy's account of the story Vale was going to press in the morning.",
      "Desmond looks at them for a long time without speaking. When he does speak, it is not to you.",
      "Desmond: He was going to ruin a hotel he'd never set foot in for a story no one asked for.",
      "Desmond: I asked him to wait. I asked him. He wouldn't.",
      "You do not ask him what happened in Suite 409 after that. The pen, the upgrade, the quiet hour between eleven-forty and a quarter past midnight — you already know.",
      "Detective: Desmond Lark. Stand up.",
      "The Meridian's night lobby will be quiet for a long time after this. Adrian Vale's last interview was filed to his editor at dawn, posthumously, by a reporter named Ivy Chen."
    ]
  },
  {
    id: "ending-insufficient",
    title: "The Right Name, The Wrong Case",
    subtitle: "Desmond Lark is charged. His lawyer is already on the train.",
    lines: [
      "You name Desmond Lark. He does not flinch.",
      "Desmond: On what, Detective? A guest who took ill? A pen a colleague misplaced? A complaint that was dismissed a year ago?",
      "You have the shape of it — the upgrade, the motive, the night in the back office. You do not have the one thing you needed: proof he was in 409.",
      "The precinct will book him. By morning, a lawyer whose name you recognize will post bail.",
      "Detective: I know it was you.",
      "Desmond: Knowing is not the job, Detective. Proving is.",
      "Somewhere a newsroom runs the story Adrian Vale did not live to file — carefully sourced, carefully hedged. The truth moves, eventually. Just not tonight, and not from your hand."
    ]
  },
  {
    id: "ending-wrong",
    title: "A Name Spoken In Error",
    subtitle: "{name} is taken in for questioning. The real killer remains at the Meridian.",
    lines: [
      "You name {name}. The room goes still.",
      "You have built a case that hangs together just well enough to hold — until morning. Until a witness is re-interviewed. Until a single contradiction surfaces that you did not close.",
      "The charge will not stick. Worse, the man who actually went to 409 at eleven-forty will watch the papers for two weeks, and when nothing comes, will exhale, and go back to reconciling receipts in a quiet back office.",
      "Somewhere, Adrian Vale's notebook — the one he was writing in at the desk — is being fed, page by page, into a furnace.",
      "Detective: … I'm sorry.",
      "It is not the kind of apology anyone accepts."
    ]
  }
];
