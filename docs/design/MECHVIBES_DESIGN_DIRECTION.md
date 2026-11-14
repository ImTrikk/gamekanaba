# Mechvibes-Inspired Design Direction — GameKanaBa?

**Type:** Documentation only. No source, styles, configuration, dependencies, or other documentation files were modified to produce this document.
**Relationship to other docs:** This is a visual/interaction design *brief*, not a replacement. `DESIGN_GUIDELINES.md` remains the governing design-system spec; `DESIGN_IMPLEMENTATION_AUDIT.md` remains the compliance record. This document translates both into a concrete, screen-by-screen direction informed by Mechvibes (https://mechvibes.com/) as a reference for *product-first presentation, tactile interaction, and responsive feedback* — not its branding, colors, or layouts, none of which are reused here.
**Date:** 2026-11-14

---

## 0. Working-tree baseline (inspected before writing this document)

The following already exist in the current working tree and are treated as fixed inputs — **no new color values, type-scale tokens, or primitives are introduced below**:

- **Color tokens** (`src/index.css`): purple `--primary` / `--secondary`, orange `--accent`, green `--success`, red `--destructive`, full grayscale `--muted`/`--border`/etc., defined in both `:root` and `.dark`.
- **Gameplay type scale** (`src/index.css`): `--text-display`, `--text-heading`, `--text-gameplay-question`, `--text-gameplay-answer`, `--text-countdown`, `--text-score` — defined but **not yet consumed** by `PlayerGameScreenPage.tsx` or `HostGameScreenPage.tsx`, which still use ad hoc `text-xl`/`text-2xl` utilities.
- **Primitives** (`src/components/ui/`): `button`, `input`, `label`, `select` (pre-existing), plus `card`, `badge`, `checkbox`, `table`, `alert-dialog` (new, uncommitted). `badge.tsx` already defines `default`/`secondary`/`accent`/`success`/`destructive`/`outline` variants mapped to the existing color tokens.
- **Countdown logic** (`useCountdown.ts`): explicitly display-only; returns a plain `number | null`, ticks every 250ms, never enforces the deadline. This document treats it as a value to *render differently*, never to modify.
- **Current gameplay markup**: answer choices are raw `<button>` elements with a single border-color swap for selected/correct (`PlayerGameScreenPage.tsx:37-51`, `HostGameScreenPage.tsx:53-63`); the leaderboard is a plain `<ol>/<li>` (`LeaderboardList.tsx`); the lobby participant list is a plain `<ul>/<li>` (`HostLobbyPage.tsx:56-73`) with no join feedback.

This document specifies how those existing tokens and primitives should be *applied and extended with behavior* (states, motion, hierarchy) — not what they should be.

---

## 1. Design Principles

1. **Product-first, not decoration-first.** Every visual or motion addition must demonstrate a real product moment (answering, revealing, climbing the leaderboard, a player joining) — never ornamental for its own sake. This is the core Mechvibes lesson being borrowed: *show the mechanism, make it satisfying to use.*
2. **Identity over imitation.** GameKanaBa?'s purple/orange/green palette and existing type scale are the brand. Mechvibes informs *how confidently and tactilely* that identity is expressed — not what the identity is. No Mechvibes layout, iconography, or copy is reused.
3. **Concentrate intensity where players actually look.** High-contrast, large-type, and motion treatment is reserved for the shared live-session surfaces (landing hero, lobbies, gameplay, leaderboard/results). Administrative CRUD screens stay calm and utilitarian by design, not by oversight.
4. **Motion communicates state, it doesn't decorate it.** Every animation specified below exists to answer a player's implicit question ("did that register?", "how much time do I have?", "did I move up?"). An animation with no state-communication purpose is out of scope.
5. **Never compete with real-time correctness.** All motion and feedback is additive UI state layered on top of existing TanStack Query / Supabase Realtime data; nothing here changes `useGameplay.ts`, `useCountdown.ts`'s authoritative values, or any mutation/RPC contract.
6. **Accessible by default, not as a follow-up.** Motion respects `prefers-reduced-motion`; state is never color-only; interactive targets meet touch-size minimums. These are requirements of the direction, not optional polish.

---

## 2. Screen-Specific Design Requirements

### 2.1 Landing page (`LandingPage.tsx` — currently a stub)
- **Treatment: hero, highest visual intensity of any non-gameplay screen.** This is the one screen with a clean slate and the best opportunity to demonstrate the product the way Mechvibes' own homepage demonstrates typing feedback.
- Headline uses `--text-display`; supporting copy stays short (per the skill's "short paragraphs" guidance).
- Centerpiece: a **non-authoritative live preview** of an answer tile (see §3.1 for tile states), **lightly interactive, not auto-cycling.** The tile sits in its default state until the visitor taps it, then plays press → selected → reveal (correct) once, holds briefly, and resets to default so it can be tapped again. It never advances on its own.
  - **Rationale:** Mechvibes' own reference pattern is a keyboard the visitor presses, not a keyboard that types itself — the product is demonstrated *through the visitor's action*, which is this document's own §1 principle ("show the mechanism, make it satisfying to use"). An unprompted auto-cycling loop would also violate principle 4 ("every animation answers a player's implicit question") — nobody asked a question yet — and would need its own `prefers-reduced-motion` handling for a motion that runs with no user intent behind it, which the interactive version avoids entirely: with no autoplay, `prefers-reduced-motion` only has to drop the press/reveal transition speed (§5), not suppress a running loop.
  - This reuses the same tile component and states defined in §3.1 — it is a demo instance, not a second implementation, and submits nothing (no `useSubmitAnswer` call, no session/participant context).
- Two clear entry points: a primary CTA ("Join a game" → PIN entry flow) and a secondary CTA ("Host sign-in"), matching the existing player/host split already present in routing.
- No fabricated stats, testimonials, or review counts (per skill §4 — "do not fabricate statistics, reviews, or user feedback"), since none exist for this product yet.

### 2.2 Player gameplay (`PlayerGameScreenPage.tsx`)
- **Treatment: highest-contrast, large-type, single-focus screen.** The question and countdown are the only two things competing for attention; metadata (status label, leaderboard toggle) stays visually quiet.
- Adopt `--text-gameplay-question` for the question text and `--text-gameplay-answer` for answer-tile labels (currently `text-xl`/`text-lg` ad hoc utilities).
- Countdown is promoted to a primary visual element per §3.2, not a corner label.
- Answer tiles follow the full state spec in §3.1.
- Post-reveal leaderboard insert (`question.showLeaderboardAfterQuestion`) should visually feel like a *transition into* a different mode (e.g., tiles recede/mute as the leaderboard enters) rather than an appended block, reflecting the existing conditional render.

### 2.3 Host gameplay (`HostGameScreenPage.tsx`)
- **Treatment: command-console, not spectator.** The host needs fast scan-ability of "what state is this question in, how many have answered, what can I do next" — large type is used for status and countdown, but control affordance (button hierarchy) matters more here than on the player screen.
- Same countdown treatment as §3.2, same answer-list visual states as §3.1 (host sees the list, not interactive tiles — `disabled`/read-only styling, not a different visual language).
- **Control hierarchy fix (carried over from the audit, now scoped under this direction):** primary flow actions (Lock → Reveal → Next) stay visually grouped and prominent; `Pause`/`Resume` are secondary (`outline`, as already coded); `End session` is isolated from the primary group (spacing, not just color) so it cannot be mis-tapped during the lock→reveal→next rhythm.
- Answer-progress count (`{answerCount} of {participants.length} answered`) gets a lightweight progress indicator (e.g., a thin bar or the existing `Badge` success variant once full) rather than plain text — same data, clearer read at a glance.

### 2.4 Player and host lobbies (`PlayerLobbyPage.tsx`, `HostLobbyPage.tsx`)
- **Treatment: anticipation, not administration.** The lobby is the "warm-up" moment before gameplay — Mechvibes-style tactility here means the PIN and participant list feel alive, not like a loading screen.
- Host lobby: PIN display adopts a `Card` (already available) instead of the current raw `rounded-md border p-6` block; PIN itself stays at its current large/tracked-out treatment (`text-5xl tracking-widest` already matches "prominent" intent — preserve it).
- Participant list migrates from raw `<ul>/<li>` to `Card`/`Badge` per entry (e.g., name + a small "joined" `Badge` or a subtle status dot) — see §4.2 for arrival feedback.
- Player lobby's "waiting" state gets a single calm, continuous motion cue (e.g., a pulsing dot or breathing indicator) instead of static text, communicating "this is alive, not stuck" — short, low-amplitude, reduced-motion-safe (see §5).

### 2.5 Leaderboard and final results (`LeaderboardList.tsx`, `LeaderboardPage.tsx`, `FinalResultsPage.tsx`)
- **Treatment: the leaderboard is mid-game utility; final results is the payoff screen — these must look distinct**, per the audit's existing finding that they currently share identical presentation.
- Leaderboard (mid-game, inside `PlayerGameScreenPage`/`HostGameScreenPage`): compact `Card`-wrapped rows, rank in muted mono (as today), score in `--text-score` only for the current player's own row (player screen) or top 3 (host screen) — not every row, to avoid visual noise during a fast-paced moment.
- Final results: full-screen, `--text-display`-scale treatment for 1st place, a visually distinct top-3 podium grouping, and the rest of the field in a `Table` (already available) below it. This is the one place a slightly more celebratory, higher-contrast moment is earned — it only happens once per session.
- **Podium layout: vertically stacked, ranked top-to-bottom (1st, then 2nd, then 3rd), each a full-width `Card` — not a side-by-side 2nd–1st–3rd column arrangement.** Rationale, given §6's mobile-first requirement for this screen:
  - A 3-column side-by-side podium needs real horizontal room per column for a display name plus score; at mobile widths (the primary context for this screen, since players finish the session on the device they played on) that either forces truncation/wrapping or shrinks type below the "celebratory" intent this moment is meant to have.
  - A vertical stack scales cleanly from mobile to desktop with no breakpoint-specific rearrangement, and reading order (top to bottom = 1st to 3rd) matches scanning order, so nothing needs a visual "this one's actually 1st even though it's in the middle" convention the classic column podium relies on.
  - Size, not position, carries the ranking: 1st place's card uses `--text-display` for the name/score and is visually taller/more prominent (e.g., larger `Card` padding, a rank badge using `Badge`'s `success` or `accent` variant); 2nd and 3rd step down through `--text-heading`/`--text-score` and standard `Card` sizing, so the hierarchy reads even with color/motion stripped out (reduced-motion/contrast safe).
  - This stays consistent with the mid-game leaderboard's existing rank-in-muted-mono convention (`LeaderboardList.tsx:20`) — the podium is a size/prominence escalation of the same row shape, not a different visual language.
- Rank-change feedback is specified in §4.3.

### 2.6 Administrative screens (`HostDashboardPage`, `GameBuilderPage`, `GameSettingsPage`, `HostSignInPage`, `QuestionList`, `AddQuestionForm`, `AnswerEditor`)
- **Treatment: deliberately utilitarian — explicitly out of scope for Mechvibes-style flourish.** Per the brief's own constraint, `GameBuilderPage` and `GameSettingsPage` stay plain CRUD surfaces.
- The only changes in scope for this *direction* (not this document's implementation) are consistency moves already identified in the audit: adopt `Card`/`Table` for list layouts, `Checkbox` for boolean settings, `AlertDialog` for destructive confirmations, and the `Button` `link` variant for the sign-in/sign-up toggle. No new motion, no gameplay type scale, no celebratory treatment belongs here.
- Rationale ties directly to Mechvibes-skill guidance: "prioritize improvements based on impact" and avoid changing everything uniformly — admin screens are impact-low for visual intensity and high-risk for distraction if over-styled.

---

## 3. Interaction Specifications — Answer Tile

Defines the single most-repeated interaction in the product. Applies to the player-facing tile (`PlayerGameScreenPage.tsx`) and, in read-only form, to the host's answer list (`HostGameScreenPage.tsx`).

### 3.1 States

| State | Visual treatment | Notes |
|---|---|---|
| **Default** | `border-border` background `bg-card`, `--text-gameplay-answer` label, full-width tappable area | Matches existing untouched tile; no change needed to base look |
| **Hover** (pointer devices only) | Border shifts toward `--primary` at low opacity; no layout shift | Skip on touch — no hover state should be simulated on tap |
| **Pressed / active** | Scale to ~98% (`transform: scale(0.98)`) with the fast-duration timing in §5; border/ring to full `--primary` | This is the core "tactile" moment — must feel instant, no delay before visual feedback |
| **Selected** (submitted, pre-reveal) | Persistent `ring-2 ring-primary` + subtle `bg-primary/5` fill (current `border-primary ring-2 ring-primary` extended with a fill so the state reads at a glance, not just on the border) | Must remain visually distinct from "pressed" (transient) vs. "selected" (persistent) |
| **Locked** (any tile, once `question.isLocked`) | Reduce opacity slightly (existing `disabled:opacity-60` acceptable), remove hover/press affordance entirely, cursor `not-allowed` | Communicates "no longer actionable," not "disabled by error" |
| **Correct** (post-reveal) | `border-success bg-success/10` (existing), **plus** a one-time, short reveal animation (fade/scale-in of a check affordance) — see §5 for timing | Must never rely on color alone — pair with an icon or textual affordance for colorblind/contrast accessibility |
| **Incorrect** (post-reveal, was selected) | Muted fade (reduce to `text-muted-foreground`/`border-border`, no destructive-red treatment) — being wrong isn't an error state, it's a game outcome | Avoid `--destructive` here; that token is reserved for actual errors (failed mutations), not gameplay loss, to keep semantic meaning consistent app-wide |
| **Incorrect, not selected** (other wrong tiles post-reveal) | Same muted fade as above, no additional de-emphasis needed | Keeps focus on the player's own tile and the correct one |

### 3.2 Countdown visual hierarchy and urgency

- Promote the countdown from inline corner text to a primary element using the existing `--text-countdown` token, positioned so it's scannable without eye travel from the question (e.g., anchored near the question header, not buried next to a status label).
- **Thresholds are proportional to the configured timer, not fixed seconds.** `GameSettingsPage.tsx:34,41-43` constrains `timerSeconds` to exactly `10 | 20 | 30` — fixed absolute thresholds (e.g. a flat "≤10s = urgent") would put a 10-second question in the urgent tier for its *entire* duration and never show a neutral state. Thresholds are instead computed as a percentage of `timerSeconds`, with a floor so the urgent tier is never instant-only on the shortest timer:
  - **Accent threshold** = `round(timerSeconds * 0.5)`
  - **Destructive threshold** = `max(3, round(timerSeconds * 0.25))` — the `3` floor exists so the 10s timer still gets a perceivable (not single-tick) urgent window.

  | Configured timer | Neutral | Accent (`--accent`) | Destructive (`--destructive`, pulsing) |
  |---|---|---|---|
  | 10s | 10s → 6s | 5s → 4s | ≤ 3s |
  | 20s | 20s → 11s | 10s → 6s | ≤ 5s |
  | 30s | 30s → 16s | 15s → 9s | ≤ 8s |

- **Urgency ramp**, derived state only (no change to `useCountdown.ts`'s returned value or `useGameplay.ts`'s deadline logic):
  - Above the accent threshold: neutral — current `foreground`/`muted-foreground` tone.
  - At or below the accent threshold, above the destructive threshold: shift to `--accent` (existing orange) — "pay attention."
  - At or below the destructive threshold: shift to `--destructive` (existing red) and add a short pulse animation (see §5) — "urgent."
  - `0s` / locked: freeze at whatever value it reached, immediately transition into the "Locked" tile state (§3.1) rather than showing `0s` lingering.
- This urgency state is a pure presentational derivation — `accentAt`/`destructiveAt` computed from the question's own `timerSeconds` (already available alongside `deadlineAt` on `CurrentQuestion`) and compared against `secondsLeft` where it's consumed. It does not require modifying `useCountdown.ts`'s return type, though adding an optional derived helper there is an implementation-time decision, not a constraint of this document.

---

## 4. Interaction Specifications — Arrival & Update Feedback

### 4.1 Participant arrival (lobby)
- When a new participant appears in `useParticipants`' result (host lobby), the new row enters with a short slide/fade-in (§5 "entrance" timing) rather than an instant re-render — this is the primary "the room is alive" signal for the host.
- A transient, auto-dismissing acknowledgment (e.g., a brief highlight on the new row, or a small toast-style "X joined") is in scope; a persistent counter change (`Participants (N)`) already exists and should remain as the authoritative count, with the animation as a supplement, never a replacement.

### 4.2 Leaderboard / rank-change feedback
- **Scope: this is a behavior of `LeaderboardList.tsx` itself, independent of `showLeaderboardAfterQuestion`.** That setting (`GameSettingsPage.tsx:60-66`) only gates whether the mid-game leaderboard is inserted into `PlayerGameScreenPage.tsx`/`HostGameScreenPage.tsx` after a reveal — it says nothing about `LeaderboardList`'s own behavior once rendered. `LeaderboardPage.tsx` and `FinalResultsPage.tsx` both render the same shared `LeaderboardList` unconditionally, regardless of that setting. Gating the animation on `showLeaderboardAfterQuestion` would silently disable it on `FinalResultsPage` — the single highest-payoff moment for this feedback — for any host who turned the mid-game leaderboard off. The animation therefore runs every time `LeaderboardList` re-renders with changed data, in all three call sites (mid-game inline, standalone `LeaderboardPage`, `FinalResultsPage`); the setting's only effect remains visibility of the mid-game insert, unchanged from today.
- On a leaderboard refresh where a participant's `rank` decreases numerically (i.e., they moved up) relative to the previous render, the row animates a reorder (position transition, §5 "reorder" timing) rather than snapping.
- Score value updates (`totalScore` increasing) get a brief count-up or emphasis flash on the number itself, scoped to just-changed rows — not a full list re-flash.
- **Hard constraint carried from the existing audit:** this animation must never delay or block the underlying realtime data from rendering (`DESIGN_GUIDELINES.md` §7 / `AGENTS.md` §7). The animation is a transition applied *after* new data arrives, never a gate before it.

---

## 5. Animation: Duration, Easing, Reduced Motion, Accessibility

| Category | Duration | Easing | Examples |
|---|---|---|---|
| **Instant feedback** (press/tap) | 100–120ms | ease-out | Answer-tile press/scale |
| **State transition** (selected, locked, countdown color shift) | 150–200ms | ease-in-out | Tile ring/fill change, countdown color ramp |
| **Reveal** (correct/incorrect) | 200–300ms | ease-out | Correct-tile check affordance fade/scale-in |
| **Entrance** (lobby arrival, leaderboard row insert) | 200–250ms | ease-out | New participant row, new leaderboard entry |
| **Reorder** (leaderboard rank change) | 250–350ms | ease-in-out | Row position transition |
| **Ambient/looping** (lobby waiting pulse, countdown urgency pulse) | 1–1.5s cycle | ease-in-out, low amplitude | Waiting-state breathing dot, sub-5s countdown pulse |

Rules:
- No animation in any category exceeds ~350ms for a one-shot transition — this keeps the feel snappy (Mechvibes-style instant feedback), not showy.
- All categories must have a `prefers-reduced-motion: reduce` fallback that **removes motion, not meaning** — e.g., the countdown urgency ramp keeps its color change but drops the pulse; leaderboard reorder snaps to the new position instead of animating; entrance effects become an instant appearance instead of a slide/fade.
- No state is communicated by animation or color alone — every tile/urgency/arrival state in §3–4 also has a textual or iconographic signal (existing `aria-label`/status text patterns, extended where the audit already flagged gaps: QR code label, `aria-live` on countdown/answer-progress).
- Prefer the already-installed `tw-animate-css` utility classes before introducing any new animation dependency, consistent with the existing audit's Finding #6 and `IMPLEMENTATION_GUIDELINES.md` §11's justification requirement for new dependencies.

---

## 6. Responsive Design Expectations

- **Player-facing screens (landing, join, lobby, gameplay, leaderboard/results) are mobile-first.** Most players join via a phone scanning the lobby QR code; desktop is the secondary target for these screens, not the primary one.
- Answer tiles must meet a **minimum 44px touch target height** on mobile viewports (carried from the existing audit's Batch 3 criteria) — the current default `Button`/`Input` height (`h-8`, 32px) does not meet this and must be overridden specifically on gameplay tiles, not globally.
- **Host-facing admin screens (dashboard, builder, settings) are desktop-first**, since hosts are typically managing content at a larger screen, but must not horizontally overflow or break at tablet/narrow-desktop widths.
- The host *gameplay* and *lobby* screens sit in between: a host may run a session from a phone or tablet at a live event, so the control row (Lock/Reveal/Next/Pause/End) must wrap and remain tappable at mobile widths, not just desktop.
- No screen in scope relies on hover-only affordances for critical information (e.g., hover-to-reveal tooltips) given the touch-first player base.

---

## 7. Implementation Boundaries

This document is a design brief. The following are explicitly **out of scope** for any future implementation phase derived from it, and nothing here authorizes:

- New color tokens or palette values — all treatments above reuse the existing `--primary`/`--secondary`/`--accent`/`--success`/`--destructive`/grayscale tokens and the existing gameplay type scale as-is.
- New UI primitives beyond `Card`/`Badge`/`Checkbox`/`Table`/`AlertDialog`, already present in the working tree.
- Any change to `useGameplay.ts`, `useCountdown.ts`'s return contract, Supabase RLS policies, realtime subscription logic, or any mutation/RPC call signature. All urgency/arrival/reorder states described are derived presentational state only.
- Any new runtime dependency (e.g., a dedicated animation library) without the explicit justification and approval `IMPLEMENTATION_GUIDELINES.md` §11 already requires — this direction assumes `tw-animate-css` (already installed) is sufficient until proven otherwise.
- Any visual or motion treatment applied to `GameBuilderPage.tsx` or `GameSettingsPage.tsx` beyond adopting existing primitives (`Card`/`Table`/`Checkbox`) for consistency — these remain utilitarian by design.
- Implementation itself. Per `CLAUDE.md`'s mandatory rules, any future phase derived from this document requires explicit approval and is implemented one phase at a time, reviewed before commit.

---

## 8. Acceptance Criteria

A future implementation phase may be considered aligned with this direction when:

- Landing page exists with a hero headline, a live (non-authoritative) answer-tile preview reusing the states in §3.1, and clear host/player entry points — no fabricated social proof.
- `PlayerGameScreenPage.tsx` and `HostGameScreenPage.tsx` consume `--text-gameplay-question`/`--text-gameplay-answer`/`--text-countdown` instead of ad hoc size utilities.
- Answer tiles implement all seven states in §3.1, each with a non-color-only signal, and meet the 44px mobile touch-target minimum.
- Countdown implements the three-tier urgency ramp in §3.2 without any change to `useCountdown.ts`'s signature or `useGameplay.ts`'s authoritative deadline/lock timing (verified by manual test of a live countdown reaching 0).
- Lobby participant arrival and leaderboard rank/score changes animate per §4, verified to never delay the underlying realtime render (manual observation during a live multi-participant test session).
- All motion specified has a working `prefers-reduced-motion: reduce` fallback that preserves the state signal while removing animation.
- `GameBuilderPage.tsx` and `GameSettingsPage.tsx` show no treatment beyond primitive adoption (`Card`/`Table`/`Checkbox`) — no gameplay-tier typography, no new motion.
- `npm run build` and `npm run lint` pass, and the affected flow is manually exercised end-to-end, per `IMPLEMENTATION_GUIDELINES.md` §9, before any commit is proposed.

---

## Unresolved Design Decisions

None outstanding.

Resolved:
- Countdown urgency thresholds (§3.2) are defined as percentages of the configured `timerSeconds` (10/20/30, per `GameSettingsPage.tsx:34,41-43`) rather than fixed seconds, with a worked table for all three configured values.
- Leaderboard rank-change animation scope (§4.2) runs on every `LeaderboardList` render with changed data — mid-game, standalone, and final results alike — independent of `showLeaderboardAfterQuestion`, since that setting only gates mid-game visibility and gating the animation on it would have silently disabled it on `FinalResultsPage`.
- Landing page's live answer-tile preview (§2.1) is tap-to-demo, not auto-cycling — it plays its sequence once per tap and resets, never advancing unprompted, consistent with Mechvibes' own visitor-driven interaction pattern and this document's animation-with-purpose principle.
- Final-results podium (§2.5) is a vertically stacked, top-to-bottom ranked `Card` list (1st → 2nd → 3rd), not a side-by-side 2nd–1st–3rd column arrangement — chosen for mobile-first reading order and because size/typography (not position) carries the ranking, keeping it legible with motion or color stripped out.
