# Design ↔ Implementation Audit

**Scope:** Compare the existing GameKanaBa? frontend implementation against `DESIGN_GUIDELINES.md`, which was introduced after most functionality was already built.
**Type:** Read-only analysis. No source, styles, configuration, dependencies, or existing documentation were modified. The only repository change is the creation of this file.
**Date:** 2026-11-13

---

## 1. Executive Summary

**Overall design compliance:** Low-to-moderate. The application has a real, centralized design-token system (Tailwind v4 `@theme inline` + CSS variables, `oklch` color space, a radius scale) and consistent architectural conventions, but the tokens themselves are entirely grayscale, there is no dedicated typography scale, only 4 of the shadcn/ui primitives `DESIGN_GUIDELINES.md` implies (button/input/label/select) exist, and there is effectively no custom animation. Visually, almost every screen looks like an unstyled shadcn/Tailwind scaffold rather than a branded product.

**Major strengths:**
- A genuine centralized token system already exists (`src/index.css`) — nothing is using raw inline hex styles; colors are sourced from CSS variables everywhere observed.
- Feature-based architecture (`src/features/*` + `src/pages/*`) cleanly separates data/business logic from presentation, matching `AGENTS.md` §2 and `IMPLEMENTATION_GUIDELINES.md` §5.4.
- Loading/error/empty states are handled with real logic (not missing) on nearly every data-driven screen — `isLoading`/`error`/`length === 0` branches are present consistently, just styled minimally.
- Core multiplayer gameplay — host controls (lock/reveal/advance/pause/resume/end), realtime question sync, answer submission, and leaderboard/scoring — is functionally complete and wired end-to-end.
- Accessible focus-visible styling is already built into the primitive layer (`button.tsx`, `input.tsx`, `select.tsx`).

**Major gaps:**
- No brand/secondary/accent color — every token is grayscale except `--destructive`.
- No dedicated typography scale for display/heading/gameplay/countdown/score tiers (`DESIGN_GUIDELINES.md` §3).
- No `Card`, `Dialog`/`AlertDialog`, `Table`, `Badge`, `Checkbox`/`Switch` primitives — every list in the app is a manually-styled `<ul>/<li>`.
- No prominent/urgency-aware countdown timer — rendered as plain inline text on both player and host gameplay screens.
- Almost no animation anywhere in the app (one shadcn-generated popup transition is the only exception).
- `LandingPage.tsx` is a one-line stub — the single screen that is functionally, not just visually, incomplete.

**General recommendation:** This is overwhelmingly a **design-compliance** problem, not a **functional** one (see §3/§4 for the explicit split). The recommended path is incremental: establish the missing design-system foundations (tokens, typography, Card/Dialog/Table primitives) first, then apply them screen-by-screen without touching the working data-fetching/mutation/realtime logic underneath. No rebuild is warranted or recommended.

An earlier draft of this audit flagged a filename mismatch (`CLAUDE.md` referenced `DESIGN_GUIDELINES.md` while the actual file was named `GAME_DESIGN.md`). That has since been resolved — the file was renamed to `DESIGN_GUIDELINES.md` (commit `1bb0ac3`), so `CLAUDE.md`'s reference is now accurate (see §7).

---

## 2. Existing Implementation Overview

**Frontend architecture:** React 19 + Vite + TypeScript + React Router + TanStack Query + Supabase (`@supabase/supabase-js`), organized feature-first under `src/features/{answers,auth,gameplay,games,leaderboard,questions,sessions}/{api,hooks,components}` with thin route components in `src/pages/*`. This matches the architecture conventions in `AGENTS.md` §2 and `IMPLEMENTATION_GUIDELINES.md` §5.4 — no architectural deviation was found.

**Existing design system:** Tailwind CSS v4 with a `@theme inline` token block in `src/index.css:8-49` mapping CSS variables (`--background`, `--foreground`, `--primary`, `--secondary`, `--muted`, `--accent`, `--destructive`, `--border`, `--input`, `--ring`, `--sidebar-*`, `--chart-*`) plus a radius scale (lines 42-48). Values are defined once in `:root` (lines 51-84) and `.dark` (lines 86-118) using `oklch()`. **Every color token except `--destructive` (line 66) and dark-mode `--sidebar-primary` (line 112) is achromatic** (e.g. `--primary: oklch(0.205 0 0)`, line 58) — the token *system* is real and centralized, but the token *values* carry no brand identity yet.

**UI component foundation:** shadcn/ui on top of `@base-ui/react`, using `class-variance-authority` for variants and a shared `cn()` helper (`cn` package). Only four primitives exist in `src/components/ui/`: `button.tsx`, `input.tsx`, `label.tsx`, `select.tsx`. `select.tsx` is also the only component in the app using an animation (`tw-animate-css` open/close classes, line 83). No `framer-motion` or other animation library is installed (confirmed in `package.json`).

**Existing player, host, and gameplay experiences:**
- **Player:** `LandingPage`, `JoinGamePage`, `GuestRegistrationPage`, `PlayerLobbyPage`, `PlayerGameScreenPage`, `LeaderboardPage`, `FinalResultsPage` — all routed and functional except `LandingPage`.
- **Host:** `HostSignInPage`, `HostDashboardPage`, `GameBuilderPage`, `GameSettingsPage`, `HostLobbyPage`, `HostGameScreenPage` — full CRUD + live session control implemented.
- **Gameplay/shared logic:** `src/features/gameplay/hooks/useCountdown.ts` (display-only countdown, explicitly non-authoritative per its own comment), `useGameplay.ts` (TanStack Query + Supabase Realtime subscription for current-question state and host actions), `src/features/leaderboard/*` (RPC-backed ranking).

**Project phase context:** `GameKanaBa_Project_Plan.md` §16 (lines 871-933) checklists are all unchecked in the document text, but commit history (`e4a9778`, `e5adac7`, `2579610`, `06fd128`) shows Phases 1-5 functionality already merged; Phase 6 (concurrency/security hardening tests) has no corresponding test files and appears not started. `DESIGN_GUIDELINES.md` landed in a later commit (`2dde450`) than this functional work, confirming the premise that design guidance arrived after implementation.

---

## 3. Design-vs-Implementation Assessment

| Design category (`DESIGN_GUIDELINES.md` §) | Compliance | Summary |
|---|---|---|
| §2 Design Direction / personality | Not established | No brand identity, illustration, or distinct visual tone exists yet; every screen uses the same neutral shadcn-default look. Cannot yet be judged "playful/energetic/modern" since no deliberate visual direction has been applied. |
| §3 Colors | Partial | Token *system* exists and is used consistently (no hardcoded hex found in CSS), but token *values* are grayscale-only — no primary/secondary/accent brand color. Two isolated hardcoded exceptions found: `border-green-500 bg-green-50` (`PlayerGameScreenPage.tsx:47`, `HostGameScreenPage.tsx:58`) and `bg-white` (`SessionQrCode.tsx:7`). |
| §3 Typography | Missing | Only `--font-sans`/`--font-heading` (same font) are defined; no display/heading/body/label/caption/gameplay/countdown/score type-scale tokens exist. Pages reuse ad hoc Tailwind size utilities (`text-lg`, `text-xl`, `text-2xl`) interchangeably across admin and gameplay contexts. |
| §3 Spacing / §3 Borders & Shadows | Aligned | Spacing and radius are consistently token- or utility-driven (`rounded-md`, the `--radius-*` scale); no evidence of arbitrary one-off spacing or shadow values. |
| §4.1 Player experience | Functionally complete, design partial | All required player screens exist and work except `LandingPage` (missing). Visual compliance (mobile-first sizing, touch targets, large readable gameplay type) is largely unmet. |
| §4.2 Host experience | Functionally complete, design partial | All required host screens exist and work. Visual compliance (dashboard-grade layout, consistent tables/dialogs/cards) is unmet — no such primitives exist yet. |
| §4.3 Gameplay/presentation experience | Functionally complete, design gap | Gameplay state machine (lock/reveal/advance, countdown, score reveal) works correctly, but the "distinct visual experience" requirement (high contrast, large type, prominent countdown) is not yet applied — gameplay screens share typography/spacing with administrative screens. |
| §5 Responsive design | Partial | No horizontal scroll or layout breakage observed in source; however, no explicit mobile-first touch-target sizing exists (`Button`/`Input` default to 32px height), so "actual interaction context" per device is not yet addressed. |
| §6 Component standards | Missing | Button/Input/Label/Select exist and are reused consistently where used. Card, Dialog, Table, Badge, Checkbox/Switch, loading-skeleton, and leaderboard-entry components do not exist; their absence forces every list/record screen into a repeated hand-rolled `<ul>/<li>` pattern. |
| §7 Interaction & animation | Missing | One animation exists app-wide (the generated `Select` popup). No button press-feedback beyond default `active:` state already built into `button.tsx`, no question/answer transitions, no leaderboard/score-update animation, no lobby-arrival animation, no explicit `prefers-reduced-motion` handling. |
| §8 Accessibility | Partial | Focus-visible styling exists at the primitive level (`button.tsx:6`, `input.tsx`, `select.tsx:41`) and one explicit `aria-label` exists (`AnswerEditor.tsx:61`). Gaps: unlabeled QR SVG, no `aria-live` for countdown/answer-progress, unlabeled icon-glyph reorder buttons (`QuestionList.tsx`), native unstyled checkboxes bypassing the app's focus-ring treatment (`GameSettingsPage.tsx:49,57`). |
| §9 Frontend architecture & styling | Aligned | Tailwind usage is consistent, no inline styling found besides the two hardcoded-color exceptions above, components separate host/player/gameplay concerns correctly, no unapproved extra UI library was introduced. |

---

## 4. Screen and Component Classification

**F** = Functional completeness. **D** = Design compliance (assessed independently of F, per §5 instructions — a complete feature with inconsistent styling is REFINEMENT, never MISSING).

| Screen / Component | Functional completeness | Design compliance | Evidence | Recommended action |
|---|---|---|---|---|
| `LandingPage.tsx` | **Incomplete** — stub only | None applicable | `export function LandingPage() { return <h1>Landing Page</h1> }` (`src/pages/LandingPage.tsx:1-3`) | MISSING — build the screen (content + design system together, since nothing exists to preserve) |
| `JoinGamePage.tsx` | Complete | Partial | PIN form with pending/error states works; default `Input`/`Button` sizing (`h-8`, 32px); generic `max-w-sm` centering | REFINEMENT — mobile touch-target sizing, visual identity |
| `GuestRegistrationPage.tsx` | Complete | Partial | Pending/error states handled (lines ~72-77); same generic form treatment | REFINEMENT — visual identity, touch targets |
| `PlayerLobbyPage.tsx` | Complete | Partial | Loading/error/not-joined/waiting states present as plain `<p>` text (lines ~18-42); no card, no waiting-state animation | REFINEMENT — card-based layout, animated wait state |
| `PlayerGameScreenPage.tsx` | Complete | Low | Full submit/lock/reveal loop works; countdown is plain text (`src/pages/PlayerGameScreenPage.tsx:27`); answer choices are raw `<button>` not shadcn `Button` (lines 37-51); hardcoded `border-green-500 bg-green-50` (line 47) | REFINEMENT — countdown prominence, componentize answer buttons, semantic success token |
| `LeaderboardPage.tsx` / `FinalResultsPage.tsx` | Complete | Low | Both wrap `LeaderboardList` (fully functional: loading/error/empty at lines 6-10); no visual distinction between mid-game leaderboard and final results | REFINEMENT — give final results its own visual treatment |
| `HostSignInPage.tsx` | Complete | Partial | Pending/error states handled (lines ~59-65); sign-in/sign-up toggle is a raw underlined `<button>` (lines 66-72) instead of shadcn `Button` `link` variant | REFINEMENT — primitive consistency |
| `HostDashboardPage.tsx` | Complete | Low | Game create/delete/navigate works; loading/empty/error handled (`src/pages/HostDashboardPage.tsx:55-60`); single `max-w-2xl` column (line 31); list is `<ul>/<li>` with `rounded-md border p-3` (lines 62-67, 66) | REFINEMENT — dashboard layout, adopt Card/Table once built |
| `GameBuilderPage.tsx` | Complete | Low | Composes `QuestionList` + `AddQuestionForm`; same column/list pattern; deletes fire immediately, no confirm step | REFINEMENT — layout + confirmation dialog once Dialog exists |
| `GameSettingsPage.tsx` | Complete | Partial | shadcn `Select` used for timer; native unstyled `<input type="checkbox">` for booleans (lines 49-53, 57-63) | REFINEMENT — adopt Checkbox/Switch primitive once built |
| `HostLobbyPage.tsx` | Complete | Partial | PIN at `text-5xl font-semibold tracking-widest` (line 46) — already matches "prominent" sizing intent; participant list is `<ul>/<li>` (line 60); no join-event feedback | REFINEMENT — participant-list card treatment, join animation |
| `HostGameScreenPage.tsx` | Complete | Low | Full control set (start/lock/reveal/advance/pause/resume/end) works (`src/pages/HostGameScreenPage.tsx:78-117`); countdown plain text (line 48); hardcoded green reveal highlight (line 58); destructive "End session" visually equal-weight to "Pause" (lines 94 vs 111) | REFINEMENT — countdown prominence, control grouping/hierarchy |
| Brand/secondary/accent color tokens | N/A | **Missing** | `src/index.css:51-118` — grayscale-only aside from `--destructive` | MISSING — define brand hue(s) in `:root`/`.dark` |
| Typography scale | N/A | **Missing** | No scale tokens beyond font-family in `src/index.css`; ad hoc utilities reused across contexts | MISSING — define a type scale, including a gameplay/large-type tier |
| Card / Dialog / Table / Badge / Checkbox primitives | N/A | **Missing** | Absent from `src/components/ui/`; every list is hand-rolled | MISSING — add primitives following `button.tsx`'s CVA/`cn` convention |
| Countdown urgency treatment | N/A | **Missing** | `useCountdown.ts` returns a raw number only; no urgency state exposed to consumers | MISSING — add derived urgency state, apply visually |
| App-wide animation (transitions/feedback) | N/A | **Missing** | Only the generated `Select` popup animates (`select.tsx:83`) | MISSING — scope animation work per §9 roadmap below |
| `prefers-reduced-motion` handling | N/A | **Unclear** | No media query/variant found anywhere; current animation surface is minimal, so impact is unverified rather than confirmed absent in a meaningful sense | UNCLEAR — address once animation work is scoped |
| Destructive-action confirmation | **Partial** (works, but no safety step) | N/A | Immediate deletes: `HostDashboardPage.tsx:79`, `HostLobbyPage.tsx:67`, `QuestionList.tsx` delete/reorder | MISSING (functional/UX gap, not purely visual) — add confirm step once Dialog exists |

---

## 5. Screens and Components Requiring Refinement

The following already satisfy their functional requirements and need only visual/interaction improvement — no rewrite, and no change to their underlying data/mutation/realtime logic:

- `JoinGamePage.tsx`, `GuestRegistrationPage.tsx` — touch-target sizing, visual identity.
- `PlayerLobbyPage.tsx` — card layout, animated waiting state.
- `PlayerGameScreenPage.tsx` — countdown prominence, answer-button componentization, semantic success color (replace hardcoded `green-500/green-50`).
- `HostGameScreenPage.tsx` — same countdown/color fixes, plus control-row visual hierarchy.
- `LeaderboardPage.tsx` / `FinalResultsPage.tsx` — distinct final-results treatment.
- `HostSignInPage.tsx` — toggle control → shadcn `Button` `link` variant.
- `HostDashboardPage.tsx`, `GameBuilderPage.tsx` — dashboard-style layout, Card/Table adoption once built.
- `GameSettingsPage.tsx` — Checkbox/Switch adoption once built.
- `HostLobbyPage.tsx` — participant-list card treatment, join-event feedback.

---

## 6. Missing Design Elements

| # | Requirement (`DESIGN_GUIDELINES.md` §) | File / Evidence | Current behavior | Discrepancy | Recommended adjustment | Functional impact | Severity | Effort | Regression risk |
|---|---|---|---|---|---|---|---|---|---|
| 1 | Brand/secondary/accent colors (§3 Colors) | `src/index.css:51-118` | All color tokens grayscale except `--destructive` | No brand identity expressed | Add hue values to `--primary`/`--secondary`/`--accent` in `:root` and `.dark` | None — purely visual, same variable names | HIGH | MEDIUM | Low: must re-check contrast/dark-mode after value change |
| 2 | Typography hierarchy (§3 Typography) | `src/index.css` (no size tokens); `PlayerGameScreenPage.tsx:27,30`, `HostGameScreenPage.tsx:48,51` | Ad hoc `text-lg/xl/2xl` reused across admin and gameplay | No dedicated display/gameplay/countdown/score scale | Add type-scale tokens; apply gameplay tier to question/countdown/score text | None | HIGH | MEDIUM | Low — additive tokens, opt-in per screen |
| 3 | Card/Dialog/Table/Badge primitives (§6 Component Standards) | `src/components/ui/` (only button/input/label/select); lists at `HostDashboardPage.tsx:62-67`, `LeaderboardList.tsx:13-31`, `HostLobbyPage.tsx:60` | Every record list is a manual `<ul>/<li>` | Required reusable primitives absent | Add Card/Dialog/Table/Badge under `src/components/ui/` using existing CVA/`cn` convention; migrate one list at a time | None if migrated incrementally — data/mutation hooks untouched | HIGH | MEDIUM | Medium — touches multiple screens, mitigate by migrating one screen per commit |
| 4 | Prominent countdown timer (§4.3) | `PlayerGameScreenPage.tsx:27`, `HostGameScreenPage.tsx:48`, `useCountdown.ts` | Plain inline text number, no urgency signal | Timer not visually prominent or urgency-aware | Add derived urgency state to `useCountdown.ts`; apply size/color escalation in both consuming screens | None — `useCountdown` already explicitly non-authoritative, display-only | CRITICAL | MEDIUM | Low — additive, doesn't touch deadline/lock logic in `useGameplay.ts` |
| 5 | High-contrast, large-type gameplay screens (§4.3) | `PlayerGameScreenPage.tsx`, `HostGameScreenPage.tsx` | Same type scale as admin CRUD screens | No distinct gameplay visual treatment | Apply the new gameplay type-scale tier (dependent on #2) | None | HIGH | MEDIUM | Low |
| 6 | Meaningful animations (§7) | `select.tsx:83` is the only animated component; no `framer-motion` in `package.json` | Static state transitions everywhere else | Required feedback/transition animations absent | Scope and add targeted animations (answer feedback, leaderboard rank change, lobby arrival); prefer `tw-animate-css` utilities already installed before adding a new dependency | None if scoped additively | MEDIUM | LARGE | Medium — new dependency (if needed) requires justification per `AGENTS.md`/`IMPLEMENTATION_GUIDELINES.md` §11 |
| 7 | Confirmation for destructive actions (implied by §6 Dialogs + general usability; not explicitly mandated by `DESIGN_GUIDELINES.md`) | `HostDashboardPage.tsx:79`, `HostLobbyPage.tsx:67`, `QuestionList.tsx` delete | Deletes fire immediately on click | No safety step for irreversible actions | Add confirm step using the new Dialog primitive (depends on #3) | Adds one interaction step; underlying mutation calls unchanged | MEDIUM | SMALL | Low-medium — verify no flow assumes single-click delete |
| 8 | Accessible name for non-interactive graphic (§8 Accessibility, general principle — QR code isn't explicitly named) | `src/features/sessions/components/SessionQrCode.tsx:7-8` | `react-qr-code` renders an unlabeled `<svg>`; wrapper uses hardcoded `bg-white` | No accessible name; hardcoded (not token) background | Add `role="img"`/`aria-label`; consider a token-based light surface instead of literal `bg-white` | None | LOW | SMALL | Low |
| 9 | Non-visual status updates (§8 Accessibility, general principle) | Countdown (`PlayerGameScreenPage.tsx:27`), answer-progress count (`HostGameScreenPage.tsx:67`) | Updates silently, no `aria-live` | Assistive-tech users don't get updates | Wrap in `aria-live="polite"` region | None | LOW | SMALL | Low |

Per instruction, no item above is classified MISSING where the underlying feature already exists — items 1-9 are each a genuinely absent **element** (a token, a primitive, a behavior), not a restatement of an already-working screen's styling gap (those are tracked as REFINEMENT in §4/§5 instead).

---

## 7. Conflicts and Unresolved Design Decisions

1. **Filename mismatch — resolved.** An earlier draft of this audit flagged that `CLAUDE.md` (lines 30-33) referenced `DESIGN_GUIDELINES.md` while the file was actually named `GAME_DESIGN.md`. The file has since been renamed to `DESIGN_GUIDELINES.md` (commit `1bb0ac3`), so `CLAUDE.md`'s instruction is now accurate. No remaining action needed.
2. **No palette or exact values are prescribed.** `DESIGN_GUIDELINES.md` §3 requires "a consistent color palette" and semantic tokens but does not specify hex/oklch values. This audit does **not** invent a palette (per §4's instruction) — item #1 in §6 is scoped as "add brand hue values," leaving the actual color decision for the implementation step and explicit design approval per `DESIGN_GUIDELINES.md` §12.
3. **No behavioral conflict found.** No case was identified where the existing implementation's *behavior* (as opposed to its visual treatment) contradicts a `DESIGN_GUIDELINES.md` requirement. All findings are either visual/interaction gaps or the documentation mismatch in item 1.

---

## 8. Regression Risks

| Proposed change area | Change type | Risk to gameplay / realtime / API contracts |
|---|---|---|
| Brand color token values | Visual-only | None to logic; verify WCAG contrast in both `:root` and `.dark` before finalizing values. |
| Card/Dialog/Table primitives + list migrations | Visual + interaction | No API/data contract changes — TanStack Query hooks (`useGames`, `useQuestions`, `useParticipants`, `useLeaderboard`, etc.) stay untouched; only the JSX wrapper around existing `.map()` calls changes. Migrate one screen at a time (per `IMPLEMENTATION_GUIDELINES.md` §3.3) to keep each change reviewable and isolate any regression. |
| Destructive-action confirmation dialogs | Functional (adds a step) | Adds a click before `deleteGame.mutate(game.id)` / equivalent fires; mutation logic itself is unchanged. Verify no existing flow or test assumes an immediate single-click delete. |
| Countdown urgency state | Interaction-UX | `useCountdown.ts` is explicitly documented as non-authoritative/display-only; an added derived boolean is additive and does not touch the authoritative deadline/lock logic in `useGameplay.ts` or any realtime subscription. |
| Scoped animation additions | Interaction-UX (possible new dependency) | Must not interfere with realtime UI updates per `AGENTS.md` §7 and `DESIGN_GUIDELINES.md` §7 ("animations do not interfere with real-time updates") — e.g., an answer-feedback animation must not delay the next question's realtime state from rendering. Prefer existing `tw-animate-css` before adding a library; a new dependency requires explicit justification and approval (`IMPLEMENTATION_GUIDELINES.md` §11). |
| `LandingPage.tsx` build-out | Functional + visual (net-new) | No existing behavior to regress — currently a dead-end stub with no links or state. |
| Replacing raw `<button>` with shadcn `Button` (answer choices, sign-in toggle) | Visual-only | Must preserve existing `onClick`/`disabled` wiring exactly; verify `Button`'s default height (`h-8`, 32px) is overridden where mobile touch-target sizing matters rather than silently inherited. |

No change proposed anywhere in this audit alters a Supabase RLS policy, an API contract, or authoritative scoring/session logic — all identified gaps are presentation-layer.

---

## 9. Recommended Implementation Roadmap

Priority order follows §9's suggested tiers, with dependency-driven reordering noted explicitly.

### Batch 1 — Critical gameplay usability
- **Objective:** Make the countdown timer and gameplay screens meet the "prominent countdown" / "high-contrast large-type" requirements, and give the app a real landing page.
- **Scope:** Countdown urgency state + visual escalation; `LandingPage.tsx` build-out.
- **Affected files/components:** `src/features/gameplay/hooks/useCountdown.ts`, `src/pages/PlayerGameScreenPage.tsx`, `src/pages/HostGameScreenPage.tsx`, `src/pages/LandingPage.tsx`.
- **Priority:** CRITICAL/HIGH (Findings #4, and the `LandingPage` MISSING item from §4).
- **Estimated effort:** MEDIUM.
- **Dependencies:** None — can start immediately; benefits from Batch 2's typography tokens but does not require them.
- **Validation:** Manual browser test of an active question counting down to 0 on both player and host screens; `npm run build` + `npm run lint`; verify `useGameplay.ts`'s authoritative lock/reveal timing is unaffected.

### Batch 2 — Core design-system foundations
- **Objective:** Establish the missing design-system primitives that later batches depend on.
- **Scope:** Brand/secondary/accent color tokens; typography scale (including a gameplay/large-type tier); `Card`, `Dialog`/`AlertDialog`, `Table`, `Badge`, `Checkbox`/`Switch` shadcn primitives.
- **Affected files/components:** `src/index.css`, new files under `src/components/ui/`.
- **Priority:** HIGH (Findings #1, #2, #3, #5).
- **Estimated effort:** MEDIUM.
- **Dependencies:** None, but this batch unblocks Batches 3-5.
- **Validation:** Visual check in light + dark mode; WCAG AA contrast check on new color tokens; `npm run build`; confirm no existing component relying on current token names breaks.

### Batch 3 — Player experience refinements
- **Objective:** Apply the new design-system primitives/tokens to player-facing screens.
- **Scope:** `JoinGamePage`, `GuestRegistrationPage` touch-target sizing; `PlayerLobbyPage` card layout + waiting-state treatment; `PlayerGameScreenPage` answer-button componentization + semantic success color (replace `border-green-500 bg-green-50`); `FinalResultsPage` distinct visual treatment.
- **Affected files/components:** `src/pages/JoinGamePage.tsx`, `src/pages/GuestRegistrationPage.tsx`, `src/pages/PlayerLobbyPage.tsx`, `src/pages/PlayerGameScreenPage.tsx`, `src/pages/FinalResultsPage.tsx`.
- **Priority:** HIGH.
- **Estimated effort:** MEDIUM.
- **Dependencies:** Batch 2 (tokens, Card primitive, semantic success color).
- **Validation:** Manual mobile-viewport testing of join → lobby → gameplay → results flow; confirm `useSubmitAnswer`/`useGameplay` behavior unchanged.

### Batch 4 — Host experience refinements
- **Objective:** Bring host screens to a dashboard-grade, consistent-component standard.
- **Scope:** `HostDashboardPage`/`GameBuilderPage` layout + Table/Card adoption for games/questions lists; `GameSettingsPage` Checkbox/Switch adoption; `HostLobbyPage` participant-list Card treatment; `HostSignInPage` toggle → shadcn `Button`; destructive-action confirmation dialogs.
- **Affected files/components:** `src/pages/HostDashboardPage.tsx`, `src/pages/GameBuilderPage.tsx`, `src/pages/GameSettingsPage.tsx`, `src/pages/HostLobbyPage.tsx`, `src/pages/HostSignInPage.tsx`, `src/features/questions/components/QuestionList.tsx`.
- **Priority:** HIGH/MEDIUM.
- **Estimated effort:** MEDIUM.
- **Dependencies:** Batch 2 (Table/Card/Dialog/Checkbox primitives).
- **Validation:** Manual test of full game-builder CRUD flow including delete confirmation; `npm run build`; confirm mutation hooks (`useGameMutations`, `useQuestions`) unchanged.

### Batch 5 — Gameplay and presentation refinements
- **Objective:** Finish the "distinct gameplay experience" requirement and add leaderboard/score feedback.
- **Scope:** `HostGameScreenPage` control-row visual hierarchy (separate destructive "End session"); leaderboard rank-change/score-update animation.
- **Affected files/components:** `src/pages/HostGameScreenPage.tsx`, `src/features/leaderboard/components/LeaderboardList.tsx`.
- **Priority:** MEDIUM.
- **Estimated effort:** MEDIUM-LARGE (animation work, Finding #6).
- **Dependencies:** Batch 2 (tokens); evaluate whether `tw-animate-css` suffices before considering a new animation dependency.
- **Validation:** Manually verify animations don't delay realtime leaderboard updates (`DESIGN_GUIDELINES.md` §7 / `AGENTS.md` §7); `npm run build`.

### Batch 6 — Accessibility and responsive refinements
- **Objective:** Close the remaining accessibility gaps.
- **Scope:** QR code `aria-label`/`role="img"`; `aria-live="polite"` on countdown and answer-progress text; `prefers-reduced-motion` handling for any animation added in Batches 1/5; icon-only reorder button labels in `QuestionList.tsx`.
- **Affected files/components:** `src/features/sessions/components/SessionQrCode.tsx`, `src/pages/PlayerGameScreenPage.tsx`, `src/pages/HostGameScreenPage.tsx`, `src/features/questions/components/QuestionList.tsx`.
- **Priority:** MEDIUM/LOW.
- **Estimated effort:** SMALL.
- **Dependencies:** None, but logically follows once the elements they annotate (countdown, animations) are finalized.
- **Validation:** Screen-reader or axe-style automated accessibility check; manual keyboard-navigation pass.

### Batch 7 — Minor visual polish
- **Objective:** Address remaining small inconsistencies.
- **Scope:** `HostLobbyPage` join-event feedback; `SessionQrCode` token-based surface instead of hardcoded `bg-white`.
- **Affected files/components:** `src/pages/HostLobbyPage.tsx`, `src/features/sessions/components/SessionQrCode.tsx`.
- **Priority:** LOW.
- **Estimated effort:** SMALL.
- **Dependencies:** Batch 2 (tokens).
- **Validation:** Visual review in light/dark mode.

---

## 10. Acceptance Criteria

- **Batch 1 — Countdown & Landing:** Countdown visually escalates (size/color) below an agreed threshold (e.g. ≤5s) on both `PlayerGameScreenPage` and `HostGameScreenPage` without altering `useGameplay.ts`'s authoritative lock/reveal timing; `LandingPage.tsx` renders real branded content with host/player entry points.
- **Batch 2 — Design-system foundations:** `src/index.css` defines non-grayscale `--primary`/`--secondary`/`--accent` in `:root` and `.dark` meeting WCAG AA contrast against their foreground tokens; a typography scale exists with an explicit gameplay/large-type tier; `Card`/`Dialog`/`Table`/`Badge`/`Checkbox` exist under `src/components/ui/` following `button.tsx`'s CVA/`cn` convention.
- **Batch 3 — Player refinements:** Answer choices use the shadcn `Button` component with a semantic success token (no `green-500`/`green-50` literals remain); `PlayerLobbyPage` and `FinalResultsPage` use the new Card primitive; touch targets on `JoinGamePage`/`GuestRegistrationPage` meet a ≥44px minimum on mobile viewports; no change to `useSubmitAnswer`/`useCurrentQuestion` behavior.
- **Batch 4 — Host refinements:** Game/question/participant lists render via `Table`/`Card`; boolean settings use `Checkbox`/`Switch`; delete actions require explicit confirmation via `Dialog` before the existing mutation fires, and cancel leaves state unchanged; no change to `useGameMutations`/`useQuestions`/`useParticipants` data contracts.
- **Batch 5 — Gameplay/presentation:** `HostGameScreenPage`'s destructive "End session" control is visually distinct from routine controls; any leaderboard animation added does not delay realtime score updates (verified by manual observation during a live test session).
- **Batch 6 — Accessibility:** QR code has a non-empty `aria-label`/`role="img"`; countdown and answer-progress elements are wrapped in `aria-live="polite"`; any new animation respects `prefers-reduced-motion`; verified via screen reader or an automated accessibility check (e.g. axe).
- **Batch 7 — Polish:** `SessionQrCode` background uses a design token rather than a literal `bg-white`; `HostLobbyPage` gives visible feedback when a participant joins.
- **Cross-batch validation (every batch):** `npm run build` (TypeScript + Vite) and `npm run lint` pass; the affected host/player flow is manually exercised end-to-end per `IMPLEMENTATION_GUIDELINES.md` §9 before any commit is proposed; `git status` shows only the files intended for that batch.

---

## Assumptions and Unresolved Questions

- The `CLAUDE.md` → design-file naming mismatch flagged in an earlier draft of this audit is resolved (file renamed to `DESIGN_GUIDELINES.md`, §7 item 1) — no outstanding action here.
- Treated `GameKanaBa_Project_Plan.md` §16 phase checkboxes as stale/unmaintained rather than authoritative, since commit history shows Phase 5 functionality already merged while every checkbox remains unchecked. Design-compliance work as scoped in this audit doesn't map onto the existing numbered phases — **worth explicitly confirming how this roadmap should be sequenced against `IMPLEMENTATION_GUIDELINES.md` §3.1's "one phase at a time" rule.**
- `prefers-reduced-motion` is classified UNCLEAR rather than MISSING because today's animation surface is a single library-generated popup transition; its real impact depends on how much animation work is approved in Batch 5.
- Backend/Supabase schema and RLS policies were **not** reviewed — `DESIGN_GUIDELINES.md` is frontend-only, and this was scoped as a design-compliance audit, not a security review. A separate, explicitly-scoped task would be needed for that.
- No exact color/typography values are proposed (per §4's instruction not to invent a palette) — Batch 2 requires an explicit design decision and approval (`DESIGN_GUIDELINES.md` §12) before implementation.

---

**This document is a read-only audit. No finding or roadmap batch above constitutes approval to implement. Please review and indicate which batch(es), and in what order, to proceed with.**
