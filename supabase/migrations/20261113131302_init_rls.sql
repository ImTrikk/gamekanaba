-- Row Level Security for GameKanaBa (Project Plan section 11).
--
-- Guest-facing writes (joining a session, submitting answers, host session-state
-- transitions) are intentionally left WITHOUT an insert/update/delete policy here.
-- Those operations are deferred to SECURITY DEFINER RPC functions in later phases,
-- which validate business rules (session status, deadlines, duplicate prevention)
-- before writing and bypass RLS internally. Enabling RLS with no write policy is a
-- safe default-deny for the anon/authenticated roles, not an oversight.

alter table public.profiles enable row level security;
alter table public.games enable row level security;
alter table public.questions enable row level security;
alter table public.answers enable row level security;
alter table public.game_sessions enable row level security;
alter table public.participants enable row level security;
alter table public.participant_answers enable row level security;

-- profiles: a host can read and update only their own profile row.
-- Row creation is handled by the handle_new_host_user trigger (security definer).
create policy "profiles_select_own"
  on public.profiles for select
  to authenticated
  using (id = auth.uid());

create policy "profiles_update_own"
  on public.profiles for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- games: owner-only. Guests never read the games table directly; they only
-- ever see questions/answers filtered through a session context (future RPCs).
create policy "games_select_own"
  on public.games for select
  to authenticated
  using (host_id = auth.uid());

create policy "games_insert_own"
  on public.games for insert
  to authenticated
  with check (host_id = auth.uid());

create policy "games_update_own"
  on public.games for update
  to authenticated
  using (host_id = auth.uid())
  with check (host_id = auth.uid());

create policy "games_delete_own"
  on public.games for delete
  to authenticated
  using (host_id = auth.uid());

-- questions: owner-only, via the parent game. Guests must never read this table
-- directly (it would leak upcoming question text / answer-key shape early).
create policy "questions_select_own"
  on public.questions for select
  to authenticated
  using (
    exists (
      select 1 from public.games g
      where g.id = questions.game_id
        and g.host_id = auth.uid()
    )
  );

create policy "questions_insert_own"
  on public.questions for insert
  to authenticated
  with check (
    exists (
      select 1 from public.games g
      where g.id = questions.game_id
        and g.host_id = auth.uid()
    )
  );

create policy "questions_update_own"
  on public.questions for update
  to authenticated
  using (
    exists (
      select 1 from public.games g
      where g.id = questions.game_id
        and g.host_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.games g
      where g.id = questions.game_id
        and g.host_id = auth.uid()
    )
  );

create policy "questions_delete_own"
  on public.questions for delete
  to authenticated
  using (
    exists (
      select 1 from public.games g
      where g.id = questions.game_id
        and g.host_id = auth.uid()
    )
  );

-- answers: owner-only. is_correct must never be directly readable by guest
-- clients; guest-safe question/answer payloads are served by a future RPC/view
-- that strips is_correct before the reveal phase.
create policy "answers_select_own"
  on public.answers for select
  to authenticated
  using (
    exists (
      select 1 from public.questions q
      join public.games g on g.id = q.game_id
      where q.id = answers.question_id
        and g.host_id = auth.uid()
    )
  );

create policy "answers_insert_own"
  on public.answers for insert
  to authenticated
  with check (
    exists (
      select 1 from public.questions q
      join public.games g on g.id = q.game_id
      where q.id = answers.question_id
        and g.host_id = auth.uid()
    )
  );

create policy "answers_update_own"
  on public.answers for update
  to authenticated
  using (
    exists (
      select 1 from public.questions q
      join public.games g on g.id = q.game_id
      where q.id = answers.question_id
        and g.host_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.questions q
      join public.games g on g.id = q.game_id
      where q.id = answers.question_id
        and g.host_id = auth.uid()
    )
  );

create policy "answers_delete_own"
  on public.answers for delete
  to authenticated
  using (
    exists (
      select 1 from public.questions q
      join public.games g on g.id = q.game_id
      where q.id = answers.question_id
        and g.host_id = auth.uid()
    )
  );

-- game_sessions: the host can fully manage their own sessions. A joined guest
-- (an existing participant row) may read session status/timing fields only.
create policy "game_sessions_select_host_or_participant"
  on public.game_sessions for select
  to authenticated
  using (
    host_id = auth.uid()
    or exists (
      select 1 from public.participants p
      where p.session_id = game_sessions.id
        and p.user_id = auth.uid()
    )
  );

create policy "game_sessions_insert_own"
  on public.game_sessions for insert
  to authenticated
  with check (
    host_id = auth.uid()
    and exists (
      select 1 from public.games g
      where g.id = game_sessions.game_id
        and g.host_id = auth.uid()
    )
  );

create policy "game_sessions_update_own"
  on public.game_sessions for update
  to authenticated
  using (host_id = auth.uid())
  with check (host_id = auth.uid());

create policy "game_sessions_delete_own"
  on public.game_sessions for delete
  to authenticated
  using (host_id = auth.uid());

-- participants: the host can see every participant in their own session.
-- A guest may see only their own participant row (never other guests'
-- full_name/display_name/score directly through this table).
create policy "participants_select_host_or_self"
  on public.participants for select
  to authenticated
  using (
    user_id = auth.uid()
    or exists (
      select 1 from public.game_sessions s
      where s.id = participants.session_id
        and s.host_id = auth.uid()
    )
  );

-- Host may remove a participant from their own session (Project Plan 4.4).
create policy "participants_delete_host"
  on public.participants for delete
  to authenticated
  using (
    exists (
      select 1 from public.game_sessions s
      where s.id = participants.session_id
        and s.host_id = auth.uid()
    )
  );

-- participant_answers: the host can see all answers for their own session.
-- A guest may see only their own submitted answers.
create policy "participant_answers_select_host_or_self"
  on public.participant_answers for select
  to authenticated
  using (
    exists (
      select 1 from public.participants p
      where p.id = participant_answers.participant_id
        and p.user_id = auth.uid()
    )
    or exists (
      select 1 from public.game_sessions s
      where s.id = participant_answers.session_id
        and s.host_id = auth.uid()
    )
  );
