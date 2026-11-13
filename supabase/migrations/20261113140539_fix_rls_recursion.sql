-- Fixes "infinite recursion detected in policy for relation game_sessions".
--
-- game_sessions_select_host_or_participant queried participants, and
-- participants_select_host_or_self queried game_sessions. Postgres evaluates a
-- table's RLS policy on every query against it, including from inside another
-- table's policy — so these two policies formed a cycle it refused to resolve.
--
-- Fix: replace the cross-table EXISTS subqueries with SECURITY DEFINER helper
-- functions. A security definer function bypasses RLS internally, so calling it
-- from a policy does not re-trigger the other table's policy evaluation.

create function public.is_session_host(p_session_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.game_sessions
    where id = p_session_id and host_id = auth.uid()
  );
$$;

create function public.is_session_participant(p_session_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.participants
    where session_id = p_session_id and user_id = auth.uid()
  );
$$;

revoke all on function public.is_session_host(uuid) from public;
revoke all on function public.is_session_participant(uuid) from public;
grant execute on function public.is_session_host(uuid) to authenticated;
grant execute on function public.is_session_participant(uuid) to authenticated;

drop policy "game_sessions_select_host_or_participant" on public.game_sessions;
create policy "game_sessions_select_host_or_participant"
  on public.game_sessions for select
  to authenticated
  using (
    host_id = auth.uid()
    or public.is_session_participant(id)
  );

drop policy "participants_select_host_or_self" on public.participants;
create policy "participants_select_host_or_self"
  on public.participants for select
  to authenticated
  using (
    user_id = auth.uid()
    or public.is_session_host(session_id)
  );

drop policy "participants_delete_host" on public.participants;
create policy "participants_delete_host"
  on public.participants for delete
  to authenticated
  using (public.is_session_host(session_id));

drop policy "participant_answers_select_host_or_self" on public.participant_answers;
create policy "participant_answers_select_host_or_self"
  on public.participant_answers for select
  to authenticated
  using (
    exists (
      select 1 from public.participants p
      where p.id = participant_answers.participant_id
        and p.user_id = auth.uid()
    )
    or public.is_session_host(session_id)
  );
