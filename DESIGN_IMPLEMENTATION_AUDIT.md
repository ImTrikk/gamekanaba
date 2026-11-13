# Design ↔ Implementation Audit

**Scope:** Reconcile the existing GameKanaBa? frontend implementation against `GAME_DESIGN.md`, which was added after most functionality was already built.
**Type:** Audit only. No source, styling, configuration, dependency, or documentation files were modified to produce this report. The only repository change is the addition of this file.
**Date:** 2026-11-13

---

## 1. Executive Summary

GameKanaBa? is functionally far along: host auth, game/question CRUD, session creation with PIN/QR join, guest registration, realtime gameplay (lock/reveal/advance/pause/resume/end), server-backed scoring, a leaderboard, and final results all exist and are wired end-to-end (`src/features/*`, `src/pages/*`). The core multiplayer mechanics described in `GameKanaBa_Project_Plan.md` phases 1–5 appear implemented.

`GAME_DESIGN.md`, however, was introduced after this functionality was built and describes a visual/UX system — brand palette, typography scale, large-type gameplay screens, dashboard-grade host tooling (cards/dialogs/tables), animation, and accessibility — that the current UI does not yet express. The implementation today is a consistent but intentionally minimal, grayscale, "default shadcn" treatment with almost no custom visual identity, no brand color, no card/dialog/table primitives, and almost no animation.

**Headline finding:** this is overwhelmingly a **design-compliance gap**, not a **functional** one. Nearly every feature required by the design doc already exists and works; what's missing is its visual/interaction layer (tokens, primitives, typography scale, animation, some accessibility affordances). A smaller number of findings are genuine functional/UX gaps independent of visual styling (e.g., no destructive-action confirmation, no countdown `aria-live` region, QR code lacks an accessible name).

One process-level discrepancy: `CLAUDE.md` instructs reading `DESIGN_GUIDELINES.md` before frontend work, but no such file exists — `GAME_DESIGN.md` is the file that actually fills that role. This is flagged under §7 (Conflicting Requirements) rather than corrected, per the audit-only constraint.

---

## 2. Existing Implementation Overview

- **Stack:** React 19, Vite, TypeScript, React Router, TanStack Query, Supabase (`@supabase/supabase-js`), Tailwind CSS v4 (`@theme inline` token system), shadcn/ui on top of `@base-ui/react`, `class-variance-authority`, `lucide-react`, `react-qr-code`, `zod`. No animation library beyond `tw-animate-css` (CSS-only keyframe utilities).
- **Structure:** feature-based (`src/features/{answers,auth,gameplay,games,leaderboard,questions,sessions}`) with thin route pages in `src/pages/*`, matching `AGENTS.md` §2 and `IMPLEMENTATION_GUIDELINES.md` §5.4.
- **shadcn primitives present:** `button.tsx`, `input.tsx`, `label.tsx`, `select.tsx` only (`src/components/ui/`). **No** `card`, `dialog`/`alert-dialog`, `table`, `badge`, `checkbox`, `switch`, `tabs`, `skeleton`, `tooltip`, or toast component exists anywhere in the repo.
- **Design tokens (`src/index.css`):** fully centralized via Tailwind v4 `@theme inline` + CSS variables in `oklch` color space (background/foreground/primary/secondary/muted/accent/destructive/border/input/ring/sidebar/chart, plus a radius scale at lines 42–48). **All non-destructive colors are achromatic grayscale** (e.g. `--primary: oklch(0.205 0 0)` at line 58) — there is no brand hue, secondary brand color, or accent color defined anywhere.
- **Pages covering the three experiences the design doc defines:**
  - Player: `LandingPage`, `JoinGamePage`, `GuestRegistrationPage`, `PlayerLobbyPage`, `PlayerGameScreenPage`, `LeaderboardPage`, `FinalResultsPage`.
  - Host: `HostSignInPage`, `HostDashboardPage`, `GameBuilderPage`, `GameSettingsPage`, `HostLobbyPage`, `HostGameScreenPage`.
  - Gameplay/presentation logic shared via `src/features/gameplay/*` (`useCountdown.ts`, `useGameplay.ts`) and `src/features/leaderboard/*`.
- **Project-plan phase status:** `GameKanaBa_Project_Plan.md` §16 checklists (lines 871–933) are all unchecked in the document text, but recent commits (`e4a9778` gameplay wiring, `e5adac7` leaderboard RPC, `2579610` leaderboard/final-results UI) show Phases 1–5 functionality is substantively implemented; Phase 6 (multi-client/concurrency/security hardening tests) has no corresponding test files in the repo and appears not yet started. The design-guidelines commit (`2dde450`) landed after this functional work, confirming the premise of this audit.

---

## 3. Design vs. Implementation — Per-Screen Classification

Legend: **F** = Functional completeness, **D** = Design compliance, independently assessed per Additional Requirement A.

| Screen / Area | F | D | Classification | Notes |
|---|---|---|---|---|
| `LandingPage.tsx` | Minimal | None | **MISSING** | File is a literal stub: `export function LandingPage() { return <h1>Landing Page</h1> }` (`src/pages/LandingPage.tsx:1-3`). No layout, no CTA, no branding — this is the one screen that is functionally, not just visually, incomplete relative to §4.1's "Landing page" requirement. |
| `JoinGamePage.tsx` | Complete | Partial | REFINEMENT | PIN entry form works (loading/error states present); uses only default-size `Input`/`Button` (32px height, §5 below), no mobile-specific touch sizing, generic centered-form layout. |
| `GuestRegistrationPage.tsx` | Complete | Partial | REFINEMENT | Same pattern — functional, pending/error states handled, no visual distinction from a generic auth form. |
| `PlayerLobbyPage.tsx` | Complete | Partial | REFINEMENT | Loading/error/not-joined/waiting states all present as plain text; no card, no animated "waiting" indicator despite being a wait screen. |
| `PlayerGameScreenPage.tsx` | Complete | Low | REFINEMENT | Full gameplay loop works (answer submit, lock, reveal, leaderboard-after-reveal). Countdown is plain inline text (`src/pages/PlayerGameScreenPage.tsx:27`), answer buttons are raw `<button>` not the shadcn `Button` (lines 37–51), correctness highlight hardcodes `border-green-500 bg-green-50` (line 47) instead of a semantic token. Typography scale (`text-lg`/`text-xl`) is the same as administrative pages, not a dedicated "large, high-contrast gameplay" scale. |
| `LeaderboardPage.tsx` / `FinalResultsPage.tsx` | Complete | Low | REFINEMENT | Both reuse `LeaderboardList` (`src/features/leaderboard/components/LeaderboardList.tsx`), itself fully functional (loading/error/empty states, rank + score, lines 6–10). No visual distinction between the final results screen and a mid-game leaderboard (no podium/celebration treatment) despite §4.1 listing "Final results" as its own screen. |
| `HostSignInPage.tsx` | Complete | Partial | REFINEMENT | Auth flow works with pending/error states; the sign-in/sign-up toggle is a raw underlined `<button>` rather than the shadcn `Button`/`link` variant — inconsistent primitive usage, not a functional defect. |
| `HostDashboardPage.tsx` | Complete | Low | REFINEMENT | Game CRUD (create/delete/navigate) works, loading/empty/error handled (`src/pages/HostDashboardPage.tsx:55-60`). Layout is a single centered `max-w-2xl` column (line 31), not the grid/sidebar "dashboard" look §4.2 implies; game list is `<ul>/<li>` with `rounded-md border p-3` (lines 62-67), not a `Card`/`Table` component (none exists in the repo). |
| `GameBuilderPage.tsx` | Complete | Low | REFINEMENT | Composes `QuestionList` + `AddQuestionForm`; same single-column layout and plain-list pattern as above. Delete actions fire immediately with no confirmation step (see §6). |
| `GameSettingsPage.tsx` | Complete | Partial | REFINEMENT | Uses shadcn `Select` for timer value but plain native `<input type="checkbox">` for boolean settings — no `Checkbox`/`Switch` primitive exists, so these controls visually diverge from the rest of the token-driven UI. |
| `HostLobbyPage.tsx` | Complete | Partial | REFINEMENT | PIN is rendered at `text-5xl font-semibold tracking-widest` — the one screen in the app that already matches the "prominent" sizing §4.3 asks for elsewhere. Participant list is still `<ul>/<li>` with the same generic border pattern. No join-event animation/toast. |
| `HostGameScreenPage.tsx` | Complete | Low | REFINEMENT | Full host control set implemented and functional (start/lock/reveal/advance/pause/resume/end — `src/pages/HostGameScreenPage.tsx:78-117`). Same plain-text countdown (line 48) and hardcoded green reveal highlight (line 58) as the player screen. Controls are an undifferentiated flex row — "End session" (destructive) sits visually equal-weight next to "Pause" (line 94 vs 111). |
| Design tokens / palette | N/A | MISSING | **MISSING** | `src/index.css` defines a complete token *system* but every token resolves to grayscale (lines 52-118) except `--destructive`. No primary/secondary/accent brand color exists, directly contradicting §3's "Primary brand color / Secondary brand color / Accent color" requirement. This is a design-system gap, not a missing feature. |
| Typography scale | N/A | MISSING | **MISSING** | No dedicated heading/display/gameplay/countdown/score type scale exists beyond ad hoc Tailwind utility classes (`text-xl`, `text-2xl`, etc.) reused identically across admin and gameplay contexts. §3 explicitly calls for separate tokens for these. |
| Card / Dialog / Table primitives | N/A | MISSING | **MISSING** | None of these shadcn primitives exist in `src/components/ui/`. Every list in the app (games, questions, participants, leaderboard, answer choices) is a manually-styled `<ul>/<li>` or `<ol>/<li>`. §6 explicitly names cards, dialogs, and tables as required reusable patterns. |
| Animation / transitions | N/A | MISSING | **MISSING** | The only animation in the entire codebase is the shadcn-generated `select.tsx` popup's open/close fade+zoom+slide (`src/components/ui/select.tsx:83`, via `tw-animate-css`). No page transitions, answer-feedback animation, leaderboard rank-change animation, countdown urgency animation, or lobby-arrival animation exists, despite §7 listing all of these as expected. |
| `prefers-reduced-motion` handling | N/A | UNCLEAR | UNCLEAR | No `prefers-reduced-motion` media query or `motion-reduce:` variant exists anywhere. Given animation surface area today is a single popup transition, the practical impact is small, but it cannot be verified as compliant since no explicit handling exists either way. |
| Confirmation for destructive actions | Partial | N/A | **MISSING** | Delete actions in `HostDashboardPage.tsx:79`, `QuestionList.tsx` (reorder/delete), and `HostLobbyPage.tsx:67` fire immediately on click. This is a functional/UX gap (irreversible action, no confirm step), not purely visual, and there is no `Dialog`/`AlertDialog` primitive to build one with yet. |

---

## 4. Screens / Components Requiring Refinement (Design-Compliance Only)

These already satisfy their functional requirements; the only work needed is visual/interaction polish, per Additional Requirement A (do not reclassify as MISSING):

- `JoinGamePage.tsx`, `GuestRegistrationPage.tsx` — mobile touch-target sizing, visual identity.
- `PlayerLobbyPage.tsx` — waiting-state visual treatment, card-based participant display.
- `PlayerGameScreenPage.tsx`, `HostGameScreenPage.tsx` — countdown prominence, answer-button componentization, semantic success color.
- `LeaderboardPage.tsx`, `FinalResultsPage.tsx` — final-results-specific visual distinction.
- `HostSignInPage.tsx` — toggle control consistency.
- `HostDashboardPage.tsx`, `GameBuilderPage.tsx` — dashboard layout, card/table adoption.
- `GameSettingsPage.tsx` — checkbox/switch primitive adoption.
- `HostLobbyPage.tsx` — participant-list card treatment, join animation.

---

## 5. Missing Design Elements

| # | Requirement (GAME_DESIGN.md §) | Evidence | Severity | Effort |
|---|---|---|---|---|
| 1 | Brand/secondary/accent color tokens (§3 Colors) | `src/index.css:51-118` — all color tokens are grayscale oklch values except `--destructive` | HIGH | MEDIUM |
| 2 | Distinct typography scale for display/heading/body/gameplay/countdown/score (§3 Typography) | No such tokens in `src/index.css`; pages reuse raw Tailwind size utilities ad hoc, e.g. `PlayerGameScreenPage.tsx:27,30`, `HostGameScreenPage.tsx:48,51` | HIGH | MEDIUM |
| 3 | Card / Dialog / Table component primitives (§6 Component Standards) | `src/components/ui/` contains only button/input/label/select; every list in the app is a hand-rolled `<ul>/<li>` (`HostDashboardPage.tsx:62-67`, `LeaderboardList.tsx:13-31`, `HostLobbyPage.tsx:60`) | HIGH | MEDIUM |
| 4 | Prominent countdown timer with urgency treatment (§4.3) | Plain inline text in both `PlayerGameScreenPage.tsx:27` and `HostGameScreenPage.tsx:48`; `useCountdown.ts` exposes only a raw number, no urgency/low-time state for UI to react to | CRITICAL | MEDIUM |
| 5 | Gameplay/presentation-specific high-contrast, large-type screens (§4.3) | Gameplay screens use the same type scale as admin CRUD pages — no dedicated scale exists to apply | HIGH | MEDIUM |
| 6 | Meaningful animations for feedback, transitions, score updates, lobby arrivals (§7) | Only animation in the app is the generated `select.tsx` popup transition (line 83); no `framer-motion` or equivalent is installed | MEDIUM | LARGE |
| 7 | Confirmation step for destructive actions (implied by §6 Dialogs + general usability) | Immediate deletes with no dialog: `HostDashboardPage.tsx:79`, `HostLobbyPage.tsx:67`, question list reorder/delete controls | MEDIUM | SMALL |
| 8 | Accessible name for QR code graphic (§8 Accessibility: "accessible names for icon-only buttons", extended principle) | `react-qr-code` renders an unlabeled `<svg>` in `src/features/sessions/components/SessionQrCode.tsx`; no `aria-label`/`role` passed | LOW | SMALL |
| 9 | `aria-live` region for the countdown / answer-progress count (§8 Accessibility, general practice — not explicitly named in the doc) | No `aria-live` anywhere; countdown and "`{answerCount} of {participants} answered`" (`HostGameScreenPage.tsx:67`) update silently for assistive tech | LOW | SMALL |

---

## 6. Conflicting Requirements

1. **`CLAUDE.md` references a nonexistent file.** `CLAUDE.md` lines 30-33 instruct: *"Before implementing frontend features, read `DESIGN_GUIDELINES.md`."* No file by that name exists in the repository; `GAME_DESIGN.md` is the file that actually contains this content (confirmed by its content matching the described "design system, visual direction, responsive design requirements, accessibility standards, and component conventions"). This is either a stale filename in `CLAUDE.md` or a renamed/misnamed file at commit `2dde450` — **UNCLEAR which is intended**; flagging rather than resolving, per the audit-only constraint.
2. **No functional conflict identified.** No case was found where the existing implementation's *behavior* (as opposed to its visuals) contradicts a design requirement — all identified issues are either visual/interaction gaps or process/documentation mismatches (item 1 above).

---

## 7. Potential Regression Risks

| Proposed adjustment area | Change type | Regression risk |
|---|---|---|
| Add brand color tokens to `src/index.css` | Visual-only | Low — tokens are already referenced indirectly everywhere via Tailwind's `@theme inline`; changing values, not structure, should not break any component, but must be checked in both light and dark mode (`.dark` block, lines 86-118) and against WCAG contrast. |
| Add `Card`/`Dialog`/`Table` shadcn primitives and migrate existing `<ul>/<li>` lists to them | Interaction-UX + visual | Medium — touches every list-rendering screen (`HostDashboardPage`, `GameBuilderPage`'s `QuestionList`, `HostLobbyPage`, `LeaderboardList`). Each migration must preserve existing data-fetching/mutation wiring (TanStack Query hooks are untouched; only the JSX wrapper changes) and existing `key`/loading/empty/error branches. Do this incrementally, one list at a time, per `IMPLEMENTATION_GUIDELINES.md` §3.3. |
| Add confirmation dialog before delete actions | Functional-behavior (adds a step) | Low-medium — changes user flow (extra click), must not block the existing `deleteGame.mutate(game.id)`-style mutation calls, just gate them behind confirmation. Verify no existing test/flow assumes single-click delete. |
| Redesign countdown with urgency state | Interaction-UX | Low — `useCountdown.ts` is explicitly documented as non-authoritative/display-only (its own comment, lines 3-4); adding a derived `isLow`/`isCritical` boolean is additive and doesn't touch the authoritative deadline logic in `useGameplay.ts`. |
| Introduce an animation library (e.g. for transitions/feedback) | Architectural (new dependency) | Medium — requires justification and approval per `AGENTS.md` §2 and `IMPLEMENTATION_GUIDELINES.md` §11 ("Do not introduce dependencies without a clear reason... Explain why the new dependency is necessary"); `tw-animate-css` may cover simpler cases without a new dependency at all. |
| Rebuild `LandingPage.tsx` | Functional + visual (net-new) | Low — currently a no-op stub, so there is nothing to regress; this is pure addition. |
| Replace raw `<button>` elements with shadcn `Button` (answer choices, host sign-in toggle) | Visual-only | Low, provided `Button`'s existing size variants are used or extended rather than the component's event-handling logic being changed — must check default height (`h-8`, 32px) is overridden for mobile answer buttons rather than silently keeping a sub-touch-target size. |

**General note:** No finding in this audit recommends replacing a working implementation merely to achieve superficial shadcn/ui consistency (Additional Requirement D) — every recommended adjustment above is tied to a concrete design-doc requirement or an independent usability/accessibility gap, not stylistic preference alone.

---

## 8. Recommended Implementation Order

Ordered per Additional Requirement E's priority tiers, adjusted where the evidence above warrants:

1. **Critical usability/gameplay issues**
   - Countdown prominence + urgency treatment (Finding #4) — affects every active-question screen for both players and host.
   - `LandingPage.tsx` implementation (currently a stub — the only truly MISSING screen).
2. **Core design-system inconsistencies**
   - Brand/accent color tokens (Finding #1).
   - Typography scale, including a gameplay/large-type tier (Finding #2, #5).
   - `Card`/`Dialog`/`Table` primitives (Finding #3) — needed before most downstream screen refinements can be done consistently.
3. **Player-facing experience**
   - `PlayerGameScreenPage.tsx`, `PlayerLobbyPage.tsx`, `JoinGamePage.tsx`, `GuestRegistrationPage.tsx` refinements (componentize answer buttons, semantic success color, mobile touch targets, card-based lobby).
   - `FinalResultsPage.tsx` visual distinction from mid-game leaderboard.
4. **Host-facing experience**
   - `HostDashboardPage.tsx` / `GameBuilderPage.tsx` dashboard layout + table/card adoption.
   - `GameSettingsPage.tsx` checkbox/switch primitive adoption.
   - `HostLobbyPage.tsx` participant list card treatment.
   - Destructive-action confirmation dialogs (Finding #7) — grouped here since it depends on the Dialog primitive from tier 2.
5. **Gameplay and presentation experience**
   - `HostGameScreenPage.tsx` control-grouping/visual hierarchy (separate destructive "End session" from routine controls).
   - Leaderboard rank-change / score-update animation.
6. **Accessibility and responsive refinements**
   - QR code `aria-label` (Finding #8).
   - `aria-live` regions for countdown/answer-progress (Finding #9).
   - `prefers-reduced-motion` handling once any new animation is introduced.
7. **Minor visual polish**
   - Lobby join-event animation/toast, remaining icon-button aria-labels (e.g. `QuestionList.tsx` reorder arrows), QR code container using a token instead of hardcoded `bg-white`.

---

## 9. Acceptance Criteria for Recommended Changes

- **Brand color tokens:** `src/index.css` defines non-grayscale `--primary`/`--secondary`/`--accent` values in both `:root` and `.dark`; all existing components using `bg-primary`/`text-primary`/etc. render with the new hue with no markup changes required; contrast ratios meet WCAG AA against their paired foreground tokens.
- **Typography scale:** New `--font-size-*` or equivalent tokens exist for display/heading/gameplay/countdown/score tiers; `PlayerGameScreenPage.tsx` and `HostGameScreenPage.tsx` countdown and question text use the new gameplay-tier tokens instead of ad hoc `text-xl`/`text-2xl`.
- **Card/Dialog/Table primitives:** New files added under `src/components/ui/` following existing shadcn conventions (CVA + `cn`, matching `button.tsx`'s structure); at least one existing list screen (e.g. `HostDashboardPage.tsx`) migrated to use them with no change to its data-fetching/mutation behavior, verified by manual browser testing of create/delete flows.
- **Countdown urgency:** `useCountdown.ts` exposes a derived urgency indicator; consuming screens visually escalate (color/size) below an agreed threshold (e.g. ≤5s) without altering the authoritative deadline/lock logic in `useGameplay.ts`.
- **Destructive-action confirmation:** Delete flows in `HostDashboardPage.tsx`, `HostLobbyPage.tsx`, and question list management require an explicit confirm step before the existing mutation (`deleteGame.mutate`, etc.) fires; cancel leaves state unchanged.
- **LandingPage:** Renders real content (branding, value proposition, host/player entry points) consistent with the new token/typography system; no functional routing changes required since it's currently a dead-end stub.
- **Accessibility items:** QR code has a non-empty `aria-label`/`role="img"`; countdown and answer-progress text are wrapped in an element with `aria-live="polite"`; verified with a screen reader or axe-style automated check.
- **Regression check for every item above:** run `npm run build` (TypeScript + Vite build) and `npm run lint` after each logical unit, and manually exercise the affected host/player flow end-to-end per `IMPLEMENTATION_GUIDELINES.md` §9, before proposing a commit.

---

## 10. Assumptions and Unresolved Questions

- Assumed `GAME_DESIGN.md` is the intended design reference despite the `CLAUDE.md` → `DESIGN_GUIDELINES.md` filename mismatch (§6, item 1). **Needs confirmation.**
- Treated `GameKanaBa_Project_Plan.md` §16 phase checkboxes as stale/unmaintained rather than authoritative, since commit history shows Phase 5 functionality already merged while every checkbox remains unchecked. **Worth confirming current approved phase explicitly**, since `IMPLEMENTATION_GUIDELINES.md` §3.1 requires working one phase at a time and design-compliance work doesn't map cleanly onto the existing phase list.
- `prefers-reduced-motion` was classified UNCLEAR rather than MISSING because the current animation surface is a single library-generated popup transition; whether this rises to a real gap depends on how much animation work is approved in tier 5/6 above.
- No backend/Supabase schema or RLS policy was reviewed as part of this audit — `GAME_DESIGN.md` is a frontend-only document, and `IMPLEMENTATION_GUIDELINES.md` §6 security requirements were out of scope for a design-compliance audit. If the user wants backend security re-reviewed too, that should be a separate, explicitly-scoped task.

---

**This document is an audit only. No recommendation above constitutes approval to implement. Please review and indicate which items (and in what order) to proceed with.**
