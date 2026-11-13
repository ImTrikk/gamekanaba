# GameKanaBa? --- Project Plan

**Document type:** Product and Technical Planning\
**Status:** Initial planning draft\
**Version:** 0.1\
**Date:** November 12, 2026

------------------------------------------------------------------------

## 1. Project Overview

**GameKanaBa?** is a real-time, multiplayer quiz web application. Hosts
create custom quiz games, invite participants through a game PIN, QR
code, or shareable link, and control live quiz sessions. Participants
join as guests without creating accounts, answer questions on their own
devices, and view scores and leaderboards.

The initial product should prioritize a reliable, easy-to-use live quiz
experience rather than a large collection of game modes.

### Product goals

-   Make it easy for a host to create and run a quiz.
-   Allow participants to join quickly without account registration.
-   Synchronize questions, timers, answers, and scores in real time.
-   Provide a clear host experience on desktop and a simple player
    experience on mobile.
-   Keep the initial architecture secure and practical to maintain.

### Target use cases

-   Classroom activities and knowledge checks
-   Office games and team-building activities
-   Family and friend gatherings
-   Small events and group competitions

------------------------------------------------------------------------

## 2. Technology Stack

  -----------------------------------------------------------------------
  Technology                          Responsibility
  ----------------------------------- -----------------------------------
  React                               Frontend application

  TypeScript                          Static typing and safer application
                                      code

  React Router                        Client-side routing

  TanStack Query                      Server-state fetching, caching,
                                      mutations, and invalidation

  Supabase PostgreSQL                 Relational database

  Supabase Realtime                   Live game events and state
                                      synchronization

  Supabase Auth                       Host authentication

  Supabase Storage                    Optional game cover and question
                                      images

  Tailwind CSS                        Utility-first styling

  shadcn/ui                           Reusable interface components
  -----------------------------------------------------------------------

### Technology guidelines

-   Use Supabase Realtime for live updates rather than frequent polling.
-   Use TanStack Query for ordinary server-state operations.
-   Keep game progression and scoring authoritative on the server.
-   Do not trust participant-submitted scores, correctness, or timer
    values.
-   Use database constraints and Row Level Security (RLS) alongside
    application-level validation.
-   Keep the host and player interfaces responsive and purpose-built for
    their different screen sizes.

------------------------------------------------------------------------

## 3. User Roles

### 3.1 Host

A host is an authenticated user who creates quiz content and runs game
sessions.

Host capabilities:

-   Create, edit, and delete owned games.
-   Add, edit, delete, and reorder questions.
-   Configure answer choices and correct answers.
-   Configure game settings.
-   Create and manage live game sessions.
-   Share a game PIN, QR code, and join link.
-   View and manage participants.
-   Start, pause, resume, and end a session.
-   Lock answers and reveal results.
-   Advance questions.
-   View current and final leaderboards.

### 3.2 Guest Player

A guest player joins a live session without creating an account.

Guest capabilities:

-   Join through a PIN, QR code, or shared link.
-   Enter a full name and display name.
-   Appear in the waiting lobby.
-   Receive questions in real time.
-   Submit an answer while the question is open.
-   See whether their answer was accepted.
-   View results and leaderboards when enabled.
-   Reconnect to an existing participant session after a temporary
    disconnection.

The full name is intended for host identification. The display name is
used in the player-facing game and leaderboard.

------------------------------------------------------------------------

## 4. MVP Functional Requirements

### 4.1 Host authentication and dashboard

-   Hosts must sign in to create and manage games.
-   Hosts can view their own games.
-   Hosts can create a new game.
-   Hosts can edit or delete games they own.
-   Hosts can start a new session from a saved game.
-   A reusable game can have multiple separate sessions.

**Planning recommendation:** Require host authentication for the MVP.
Keep guest players unauthenticated through a separate, secure
participant-session mechanism.

### 4.2 Game creation and question builder

Game information:

-   Game title (required)
-   Description (optional)
-   Cover image (optional; can be deferred)

Initial question types:

1.  Multiple Choice --- four answer choices
2.  True or False --- two answer choices

Question fields:

-   Question text
-   Question type
-   Answer choices
-   Correct answer
-   Points
-   Optional time limit override (future consideration)
-   Optional image (future consideration)

Question management:

-   Add a question.
-   Edit a question.
-   Delete a question.
-   Reorder questions.
-   Add and edit answer choices.
-   Mark exactly one correct answer for the initial question types.
-   Save changes to the game.

### 4.3 Game settings

Initial settings:

  Setting                                MVP behavior
  -------------------------------------- ----------------------------
  Question timer                         10, 20, or 30 seconds
  Shuffle answer choices                 On/off
  Show leaderboard after each question   On/off
  Lock answers when timer expires        Enabled by default
  Manual question advancement            Host-controlled by default
  Points per question                    Configurable

Recommended defaults:

-   Timer: 20 seconds
-   Shuffle answers: Off initially
-   Show leaderboard: On
-   Lock on timer expiry: On
-   Question progression: Host-controlled

### 4.4 Game session and lobby

When a host creates a session:

-   Generate a unique, hard-to-guess session identifier.
-   Generate a short, human-readable game PIN.
-   Create a join URL.
-   Display a QR code for the join URL.
-   Display the game PIN and shareable link.
-   Show participants as they join.
-   Allow the host to remove a participant when necessary.
-   Let the host start the game when ready.

The session should have a clear status, such as:

-   Lobby
-   In progress
-   Paused
-   Completed
-   Cancelled

### 4.5 Guest joining

Joining methods:

1.  Enter a game PIN on the join page.
2.  Open a shared join link.
3.  Scan the host's QR code.

Guest registration fields:

-   Full name (required)
-   Display name (required)

Validation and behavior:

-   Validate that the session exists and accepts participants.
-   Prevent joining a session that has already ended.
-   Prevent duplicate active participants where practical.
-   Enforce reasonable name length limits.
-   Sanitize and validate all user input.
-   Preserve a secure participant session credential so a player can
    reconnect.
-   Do not expose other participants' private information.

### 4.6 Live gameplay

The expected flow:

1.  Host starts the session.
2.  Participants receive the active question.
3.  The question timer starts from a server-defined deadline.
4.  Participants submit answers.
5.  The host sees answer progress, such as `12 of 20 answered`.
6.  Answers close when the timer expires or the host locks them.
7.  The host reveals the correct answer.
8.  The system calculates scores.
9.  The leaderboard is shown if enabled.
10. The host advances to the next question.
11. The session ends after the final question or when the host ends it.

Player experience:

-   Show the question and available choices.
-   Make answer choices large and easy to tap.
-   Show the remaining time.
-   Confirm when an answer has been accepted.
-   Prevent answer changes after submission unless a future setting
    explicitly allows them.
-   Show a waiting state after answering.
-   Do not reveal the correct answer before the reveal phase.

### 4.7 Host live controls

The host should be able to:

-   Start the game.
-   Pause the game.
-   Resume the game.
-   Lock answers.
-   End the current question.
-   Reveal the correct answer.
-   Advance to the next question.
-   End the session.

Controls should be disabled when they are invalid for the current
session state.

### 4.8 Scoring and leaderboard

Recommended initial scoring:

-   Award the configured points for a correct answer.
-   Award zero points for an incorrect or unanswered question.
-   Optionally introduce a speed bonus after the basic scoring system is
    reliable.

The server must validate correctness and calculate scores. Clients must
never submit their own score.

Leaderboard information:

-   Rank
-   Display name
-   Total score
-   Correct answers (optional)

Final results should show the top players and allow the host to view the
complete ranking.

------------------------------------------------------------------------

## 5. User Flows

### 5.1 Host flow

1.  Host signs in.
2.  Host opens the dashboard.
3.  Host creates a game or selects an existing game.
4.  Host adds questions and answer choices.
5.  Host configures game settings.
6.  Host saves the game.
7.  Host starts a new session.
8.  System displays the PIN, QR code, and join link.
9.  Participants join the lobby.
10. Host starts the game.
11. Host controls question progression and reveals results.
12. Host ends the game and reviews final results.

### 5.2 Guest player flow

1.  Player scans a QR code, opens a link, or enters a PIN.
2.  Player enters their full name and display name.
3.  Player joins the lobby.
4.  Player waits for the host to start.
5.  Player receives each question.
6.  Player selects and submits an answer.
7.  Player waits for the question result.
8.  Player views the leaderboard when available.
9.  Player views their final result.
10. If disconnected, the player can reconnect to the same participant
    session.

------------------------------------------------------------------------

## 6. Proposed Application Pages

  -----------------------------------------------------------------------
  Page                    Purpose                 Primary user
  ----------------------- ----------------------- -----------------------
  Landing page            Explain the application Everyone
                          and provide join/host   
                          entry points            

  Join game               Enter a game PIN or     Guest
                          resolve a join link     

  Guest registration      Collect full name and   Guest
                          display name            

  Host sign-in            Authenticate hosts      Host

  Host dashboard          List and manage saved   Host
                          games                   

  Game builder            Create and edit         Host
                          questions               

  Game settings           Configure game behavior Host

  Host lobby              Show PIN, QR code, and  Host
                          participants            

  Player lobby            Confirm that the player Guest
                          has joined and is       
                          waiting                 

  Host game screen        Display questions,      Host
                          timer, progress, and    
                          controls                

  Player game screen      Display questions and   Guest
                          answer choices          

  Leaderboard             Show current rankings   Host and guest

  Final results           Show completed game     Host and guest
                          results                 
  -----------------------------------------------------------------------

The host game screen should be optimized for desktop or a shared
display. The player game screen should be optimized for mobile.

------------------------------------------------------------------------

## 7. Initial Database Design

The following is a proposed logical schema. Exact column types, indexes,
constraints, and migration definitions should be finalized before
implementation.

### 7.1 `profiles`

Host profile information associated with Supabase Auth.

Potential fields:

-   `id` --- primary key and reference to `auth.users`
-   `display_name`
-   `created_at`
-   `updated_at`

### 7.2 `games`

Reusable quiz definitions.

Potential fields:

-   `id`
-   `host_id` --- owner/profile reference
-   `title`
-   `description`
-   `cover_image_path` (optional)
-   `settings` --- validated JSON settings, or normalized settings
    columns
-   `created_at`
-   `updated_at`
-   `deleted_at` (optional soft delete)

### 7.3 `questions`

Questions belonging to a reusable game.

Potential fields:

-   `id`
-   `game_id`
-   `question_text`
-   `question_type`
-   `points`
-   `position`
-   `created_at`
-   `updated_at`

### 7.4 `answers`

Answer choices belonging to a question.

Potential fields:

-   `id`
-   `question_id`
-   `answer_text`
-   `is_correct`
-   `position`
-   `created_at`
-   `updated_at`

Correct-answer fields must not be readable by guest clients before the
reveal phase. Consider separating public question data from protected
answer-key data or serving guest-safe question payloads through trusted
server-side functions.

### 7.5 `game_sessions`

A single live or completed playthrough of a reusable game.

Potential fields:

-   `id`
-   `game_id`
-   `host_id`
-   `pin`
-   `status`
-   `current_question_id` (nullable)
-   `question_started_at` (nullable)
-   `question_deadline_at` (nullable)
-   `answers_locked_at` (nullable)
-   `started_at` (nullable)
-   `ended_at` (nullable)
-   `created_at`

A game can have many sessions. Each session should preserve its own
participants, answers, and results.

### 7.6 `participants`

Guest players in a session.

Potential fields:

-   `id`
-   `session_id`
-   `full_name`
-   `display_name`
-   `session_token_hash` or equivalent secure credential reference
-   `total_score`
-   `is_connected`
-   `joined_at`
-   `last_seen_at`

Do not store a reusable plaintext participant credential. Use a secure,
unguessable token and store only a suitable hash where the server-side
design supports it.

### 7.7 `participant_answers`

Submitted answers for a particular participant and question.

Potential fields:

-   `id`
-   `session_id`
-   `participant_id`
-   `question_id`
-   `answer_id`
-   `is_correct`
-   `points_awarded`
-   `submitted_at`

Recommended constraints:

-   One accepted answer per participant per question for the MVP.
-   Unique constraint on `(participant_id, question_id)`, or an
    equivalent session-scoped constraint.
-   Validate that the participant, question, and answer all belong to
    the same session/game.
-   Reject submissions after the server-side deadline or answer lock.

### 7.8 `game_results`

Optional final result snapshots.

Potential fields:

-   `id`
-   `session_id`
-   `participant_id`
-   `final_score`
-   `final_rank`
-   `created_at`

The final results table may be unnecessary if results can be reliably
derived from participant answer records. Decide based on reporting and
historical-result requirements.

### 7.9 Relationships

-   One host profile owns many games.
-   One game has many questions.
-   One question has many answer choices.
-   One game has many game sessions.
-   One game session has many participants.
-   One participant has many submitted answers.
-   One question has many participant answers.
-   A game session may have a final result per participant.

------------------------------------------------------------------------

## 8. Supabase Realtime Architecture

Realtime should synchronize session events, not replace server-side
validation.

Potential event categories:

  -----------------------------------------------------------------------
  Event                   Audience                Purpose
  ----------------------- ----------------------- -----------------------
  Participant joined      Host and lobby          Update participant list

  Participant connection  Host                    Update connection
  changed                                         indicator

  Game started            All session             Move to first question
                          participants            

  Question opened         All session             Display active question
                          participants            and deadline

  Answer progress updated Host                    Show submitted-answer
                                                  count

  Answers locked          All session             Stop accepting answers
                          participants            

  Answer revealed         All session             Display correct answer
                          participants            

  Leaderboard updated     All session             Refresh rankings
                          participants            

  Game paused/resumed     All session             Update game state
                          participants            

  Game ended              All session             Display final results
                          participants            
  -----------------------------------------------------------------------

### Realtime design considerations

-   Use a private channel or another properly authorized session-scoped
    mechanism.
-   Authorize channel access; knowing a PIN must not grant unrestricted
    database access.
-   Do not broadcast correct answers before the reveal event.
-   Avoid broadcasting full participant records or private credentials.
-   Treat Realtime as a notification/synchronization layer. Persist
    important state in PostgreSQL.
-   On reconnect, fetch the authoritative session state instead of
    assuming no events were missed.
-   Make event handlers idempotent so duplicate delivery does not
    duplicate scores or transitions.

------------------------------------------------------------------------

## 9. Game Session State Machine

Proposed session states:

-   `lobby`
-   `in_progress`
-   `paused`
-   `completed`
-   `cancelled`

Proposed question phases:

-   `waiting`
-   `active`
-   `locked`
-   `revealed`

Expected transitions:

  Current state             Action                        Next state
  ------------------------- ----------------------------- ------------------------
  Lobby                     Host starts                   In progress
  In progress               Host pauses                   Paused
  Paused                    Host resumes                  In progress
  Active question           Timer expires or host locks   Locked
  Locked                    Host reveals answer           Revealed
  Revealed                  Host advances                 Next question active
  Final question revealed   Host completes game           Completed
  Lobby or in progress      Host cancels/ends             Cancelled or completed

Use validated server-side transitions. Do not allow a client to directly
set arbitrary session states.

------------------------------------------------------------------------

## 10. Timer and Answer Locking

Timer correctness is important in a real-time game.

Recommended approach:

1.  When a question opens, the trusted server records
    `question_started_at` and `question_deadline_at`.
2.  The server broadcasts the deadline timestamp.
3.  Clients calculate a visual countdown using the deadline and their
    current time.
4.  The server validates every answer submission against the
    authoritative deadline and lock state.
5.  When the deadline passes, a trusted server-side process transitions
    the question to locked.
6.  The host can lock answers early.
7.  Reconnecting clients fetch the current phase and deadline.

Do not rely on a browser's countdown reaching zero to enforce answer
locking. Browser timers can drift, pause, or be manipulated.

The implementation must choose a reliable server-side mechanism for
deadline enforcement, such as a trusted server function or
scheduled/background process. The client countdown is only a display.

------------------------------------------------------------------------

## 11. Security and Access Control

Security must be designed before exposing guest access.

### Host security

-   Require Supabase Auth for hosts.
-   Hosts can only manage games they own.
-   Enforce ownership through RLS and trusted server-side operations.
-   Validate all game and question mutations.

### Guest security

-   Guest players do not need full Supabase Auth accounts.
-   Use an unguessable participant credential or a similarly secure
    guest-session design.
-   Do not treat a game PIN as a participant credential.
-   Scope every guest operation to a specific session and participant.
-   Apply rate limits to PIN lookups, joining, and answer submission.
-   Validate names and payload sizes.
-   Prevent one participant from impersonating another.

### Answer security

-   Never expose correct-answer flags to guest clients before reveal.
-   Never trust client-supplied correctness or points.
-   Validate answer ownership and question/session relationships on the
    server.
-   Calculate scores in a trusted server-side operation.
-   Prevent duplicate answer submissions.

### RLS and Realtime

-   Enable RLS on exposed tables.
-   Write explicit policies for host ownership and guest access.
-   Keep privileged service-role credentials on trusted server
    infrastructure only.
-   Do not put service-role keys in frontend environment variables.
-   Restrict Realtime channel subscriptions to authorized session
    members.
-   Review database views and RPC functions for accidental exposure of
    protected columns.

------------------------------------------------------------------------

## 12. Recommended React Project Structure

Proposed starting structure:

``` text
src/
├── app/
│   ├── router.tsx
│   ├── providers.tsx
│   └── query-client.ts
├── components/
│   ├── ui/
│   ├── layout/
│   └── shared/
├── features/
│   ├── auth/
│   ├── dashboard/
│   ├── games/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── api/
│   │   ├── schemas/
│   │   └── types/
│   ├── game-session/
│   │   ├── host/
│   │   ├── player/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── realtime/
│   │   ├── api/
│   │   └── types/
│   ├── leaderboard/
│   └── results/
├── lib/
│   ├── supabase/
│   ├── utils/
│   └── validations/
├── hooks/
├── types/
└── styles/
```

Organize code by feature. Avoid putting all database calls, Realtime
logic, or game rules into large components.

------------------------------------------------------------------------

## 13. TanStack Query Strategy

Use TanStack Query for normal server-state operations.

Potential query groups:

-   Host profile
-   Host games list
-   Individual game details
-   Questions and answer choices for the host editor
-   Game session details
-   Participant list
-   Current leaderboard
-   Final results

Use mutations for:

-   Create/update/delete game
-   Create/update/delete/reorder questions
-   Create session
-   Join session through a trusted guest operation
-   Submit answer through a trusted operation
-   Host session controls

Realtime integration:

-   Subscribe to authorized session events.
-   Invalidate or update the relevant query cache when events arrive.
-   Refetch authoritative session state after reconnect.
-   Avoid unnecessary invalidation of unrelated queries.
-   Do not use frequent polling as the primary live-game synchronization
    mechanism.

------------------------------------------------------------------------

## 14. UI/UX Direction

The visual direction should be modern, playful, colorful, and polished
without becoming visually cluttered.

### Host experience

Prioritize:

-   Clear dashboard and game management.
-   Simple question editor.
-   Visible game PIN and QR code.
-   Large question display.
-   Prominent timer and answer progress.
-   Clear, safe host controls.
-   Easy-to-read leaderboard.

### Player experience

Prioritize:

-   Mobile-first layout.
-   Fast PIN/link joining.
-   Minimal registration fields.
-   Large touch targets for answers.
-   Readable question text.
-   Clear timer and submission feedback.
-   Simple waiting and reconnecting states.

### Responsive behavior

-   Desktop: host dashboard and live host controls.
-   Mobile: guest joining and answering.
-   Tablet: support both experiences where practical.

------------------------------------------------------------------------

## 15. MVP Scope and Deferred Features

### Include in MVP

-   Host authentication.
-   Host dashboard.
-   Create, edit, and delete games.
-   Multiple Choice and True/False questions.
-   Game settings with 10/20/30-second timers.
-   Game PIN, QR code, and share link.
-   Guest joining with full name and display name.
-   Real-time lobby.
-   Host-controlled live game.
-   Answer submission and locking.
-   Server-validated scoring.
-   Leaderboard and final results.
-   Basic reconnection support.

### Defer until after MVP

-   Team-based games.
-   Public quiz discovery/library.
-   Tournament brackets.
-   Advanced analytics.
-   Question image/audio/video support.
-   More question types.
-   Custom themes and branding.
-   Speed-bonus scoring.
-   Scheduled games.
-   Moderation tools beyond basic participant removal.
-   Persistent player accounts and player profiles.
-   Large-scale event features.

------------------------------------------------------------------------

## 16. Development Phases

### Phase 1 --- Foundation

-   [ ] Initialize React and TypeScript project.
-   [ ] Configure Tailwind CSS and shadcn/ui.
-   [ ] Configure React Router.
-   [ ] Set up Supabase project and environment variables.
-   [ ] Configure Supabase Auth for hosts.
-   [ ] Define initial database migrations.
-   [ ] Enable RLS and write initial policies.
-   [ ] Establish shared types and validation conventions.

### Phase 2 --- Game Builder

-   [ ] Build host dashboard.
-   [ ] Implement game CRUD.
-   [ ] Implement question CRUD.
-   [ ] Implement answer-choice management.
-   [ ] Implement question reordering.
-   [ ] Implement game settings.
-   [ ] Validate and save game content.

### Phase 3 --- Sessions and Guest Lobby

-   [ ] Implement secure session creation.
-   [ ] Generate unique game PINs.
-   [ ] Generate join URLs and QR codes.
-   [ ] Implement PIN/link joining.
-   [ ] Implement guest registration.
-   [ ] Implement secure participant credentials.
-   [ ] Implement live participant list.
-   [ ] Implement reconnect behavior.

### Phase 4 --- Real-Time Gameplay

-   [ ] Implement session state transitions.
-   [ ] Implement question opening.
-   [ ] Implement authoritative deadlines.
-   [ ] Implement player answer submission.
-   [ ] Implement answer locking.
-   [ ] Implement host controls.
-   [ ] Implement question reveal.
-   [ ] Handle disconnects and missed events.

### Phase 5 --- Scoring and Results

-   [ ] Implement server-side scoring.
-   [ ] Implement leaderboard.
-   [ ] Implement final results.
-   [ ] Prevent duplicate scoring.
-   [ ] Test ties and unanswered questions.
-   [ ] Test session completion and history.

### Phase 6 --- Testing and Hardening

-   [ ] Test multiple simultaneous participants.
-   [ ] Test duplicate PIN and join attempts.
-   [ ] Test answer submissions at the deadline.
-   [ ] Test host disconnect and reconnect.
-   [ ] Test player disconnect and reconnect.
-   [ ] Test unauthorized database access.
-   [ ] Test Realtime channel authorization.
-   [ ] Test mobile and desktop layouts.
-   [ ] Review rate limits and abuse scenarios.
-   [ ] Verify that correct answers remain private until reveal.

------------------------------------------------------------------------

## 17. Key Technical Risks and Decisions

  -----------------------------------------------------------------------
  Risk or decision        Why it matters          Recommended direction
  ----------------------- ----------------------- -----------------------
  Timer authority         Client clocks can be    Server-defined deadline
                          manipulated or drift    

  Correct-answer exposure Guest clients must not  Protected server-side
                          inspect answer keys     validation

  Guest identity          Players have no         Secure participant
                          accounts                credential

  Reconnection            Players may refresh or  Restore the existing
                          lose connectivity       participant session

  Duplicate submissions   Network retries can     Database uniqueness and
                          submit more than once   idempotent operations

  PIN collisions          Short PINs can collide  Unique constraint,
                          or be guessed           expiration, and rate
                                                  limiting

  Realtime authorization  A PIN alone must not    Private, session-scoped
                          expose session data     authorization

  Host disconnect         The session should not  Persist state and
                          become inconsistent     define host recovery
                                                  behavior

  Timer expiry            A browser timer is not  Trusted server-side
                          authoritative           deadline enforcement

  Concurrent actions      Host and timer may      Atomic, validated state
                          trigger transitions     transitions
                          together                
  -----------------------------------------------------------------------

------------------------------------------------------------------------

## 18. Initial Product Decisions

The following are recommended defaults, not yet confirmed requirements.

  Decision                    Recommended default
  --------------------------- --------------------------------------------
  Who can host?               Authenticated hosts
  Who can play?               Guests without accounts
  Scoring                     Fixed points for correct answers initially
  Question progression        Host-controlled
  Player reconnection         Supported
  Game visibility             Private, invitation-based
  Question types              Multiple Choice and True/False
  Timer choices               10, 20, or 30 seconds
  Answer changes              Not allowed after accepted submission
  Correct answer visibility   Only after reveal

These decisions should be confirmed before implementation. Changes to
them may affect the database schema, security policies, and Realtime
design.

------------------------------------------------------------------------

## 19. Definition of MVP Completion

The MVP is ready for an initial release when:

1.  A host can authenticate and create a reusable quiz.
2.  A host can add and configure questions.
3.  A host can create a session and share its PIN or QR code.
4.  Multiple guests can join from their own devices.
5.  The host can start and control a live quiz.
6.  Participants receive synchronized questions and can submit answers.
7.  The server enforces deadlines and answer locking.
8.  Correct answers are protected until reveal.
9.  Scores and leaderboards are calculated reliably.
10. Players can reconnect without losing their identity or score.
11. Unauthorized users cannot access or modify another host's games or a
    session's protected data.
12. The experience works on desktop and mobile.

------------------------------------------------------------------------

## 20. Immediate Next Step

Before implementation, review this plan and resolve the product
decisions in Section 18.

After approval, prepare the detailed database schema, RLS policy matrix,
server-side operations, and Realtime event contracts. Then implement the
application phase by phase, validating each phase before moving forward.

**Current instruction: Planning only. Do not generate application code
until the plan and architecture are approved.**
