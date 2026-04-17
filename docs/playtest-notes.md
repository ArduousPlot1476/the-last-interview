# Playtest notes — shipped state (M4)

A concise record of where the game reads well, where it reads rough, and what we decided to accept for the shipped slice. This is the shipping-pass snapshot — not a bug tracker (see [`bugs.md`](bugs.md) for that).

## Pacing

- Target session length: 10–20 minutes. Actual runs in internal playtesting land in **12–17 minutes** for a full Justice run; **5–8 minutes** for a speed-run Insufficient; **~3 minutes** for a deliberate Wrong ending.
- The "moment of understanding" — the player noticing that the pen contradicts Desmond's denial — consistently happens around **minute 9–11** on a fresh player.
- Dead air risk is concentrated **immediately after collecting the office ledger**: until the player walks back to either Ivy or Rosa, there are no new topics. The objective HUD nudges this but doesn't force it.

## What reads well

- **Progress strip in the notebook.** Every playtester glanced at it at least twice per run. "0/5" ticking up is satisfying and doubles as feedback that an action "did something."
- **`⚑ CHALLENGE` choice group.** Splitting challenges out from questions in the dialogue panel makes the challenge feel *earned* and also lowers accidental-click friction. Nobody missed a challenge prompt in the M4 pass.
- **"Why this ending" checklist.** This was the single biggest comprehension win from M3 to M4. Players who previously got the Insufficient ending and asked "what did I miss?" now see the answer directly on the ending screen and immediately know whether to restart.
- **Greeting skip on repeat visits.** Obvious in retrospect. The full greeting on visit 4+ to Desmond was the single most-skimmed block of text in M3 playtests.

## What reads rough (accepted for ship)

- **"Who should I talk to next?" mid-run.** The objective HUD gives one lead at a time; the notebook Leads tab gives all of them. A first-time player sometimes toggles between them looking for the "right" one. Acceptable: the game is short and branching; a dead end is recoverable in under a minute. Would want a clearer "next best action" hint in a post-ship polish.
- **Evidence picker shows every owned item.** Deliberate (hiding the right answer is the puzzle), but the list can hit ~8 items by mid-game and scrolling on a trackpad is slightly clumsy. Acceptable for v1.
- **Suspect portrait tints are the full visual identity.** Blue-ish / orange-ish / purple-ish placeholder silhouettes work at a glance once you've played but don't read as "Rosa / Desmond / Ivy" on first sight. Accepted — real art is out of M4 scope.
- **No audio.** Silence during dialogue makes pacing feel slightly clinical. Accepted for v1.
- **Restart reloads the page.** Clean, but it discards the start overlay dismiss state, so the overlay reappears. Arguably a feature (re-onboards) rather than a bug; accepted.

## Observations by suspect

- **Rosa.** Most "gateway" topics live here (the reception log, ledger reaction, Desmond history). Playtesters reach her first naturally because she's at the desk. No changes needed.
- **Ivy.** The torn-note → source-story chain is the hidden motive path. Players who ignore Ivy can still reach Insufficient, which is working as designed. A second playtest round might consider whether making her presence slightly more salient is worth it.
- **Desmond.** The payoff suspect. Works as intended — first conversation is hostile and uninformative by design; the build comes from outside his office, then returns with the pen.

## Interaction notes

- Wall collision is good enough; no one got stuck. The doorway from lobby to office is a single-width gap and reads fine.
- Gold highlight ring + `[E]` prompt is visible on every hotspot tested; no one had to hunt for an item.
- `Tab` conflict with browser focus is handled; nobody mentioned it.
- `H` for help is not discoverable without reading the HUD. Accepted — the start overlay covers the onboarding case, and the HUD hint is in the corner.

## Endings reached per 5-run sample

- Justice: 3 / 5 (full intent runs).
- Insufficient: 1 / 5 (deliberate speed run).
- Wrong: 1 / 5 (deliberate misaccusation).

No player reached an ending they did not intend to reach, which suggests the gate (openings + 3 clues + ≥1 critical contradiction) is tight enough to prevent accidental misfires.

## What would move a needle post-ship

In rough priority order if we opened a second polish pass:

1. **A "nothing new to ask" signal on a suspect.** When a suspect has zero unheard topics, light up a small indicator on their world sprite. Would cut the toggle-between-tabs-and-world behavior observed mid-run.
2. **Contradiction resolution → light world callout.** A quick environmental "something clicked" cue in the world after a successful press would reinforce the moment for players who don't read the toast carefully.
3. **Inter self-hosted.** Closes the fallback font variance across browsers.
4. **Minimal ambient audio.** A single lobby-hum loop + two UI clicks would lift perceived production value more than any other single change.
5. **Real suspect portraits.** Even simple line-art portraits in the dialogue panel would shift the game from "vertical slice" to "short indie title" in reviewer framing.

Those are not M4 work; they're the first things to queue when M4 is tagged.
