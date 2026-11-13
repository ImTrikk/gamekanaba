-- _enforce_question_deadline (added in the previous migration) was left with
-- Postgres's default PUBLIC execute grant. Tightening it here for consistency
-- with every other function in this schema — it's harmless to call directly
-- (it only ever locks a question whose deadline has already passed), but
-- there's no reason for anon/unauthenticated callers to reach it at all.
revoke all on function public._enforce_question_deadline(uuid) from public;
grant execute on function public._enforce_question_deadline(uuid) to authenticated;

-- Host control functions for live gameplay (Project Plan section 9, state
-- machine). These run as SECURITY INVOKER (the default — no "security definer"
-- here): the host already owns these rows under the existing RLS policies, so
-- the functions just encapsulate multi-step logic, not a trust-boundary
-- bypass. Each also re-checks host_id explicitly for a clear error message,
-- rather than relying solely on RLS silently returning zero rows.

create function public.start_session(p_session_id uuid)
returns public.game_sessions
language plpgsql
set search_path = public
as $$
declare
  v_session public.game_sessions;
  v_first_question public.questions;
  v_timer_seconds integer;
begin
  select * into v_session from public.game_sessions where id = p_session_id;
  if v_session.id is null then
    raise exception 'Session not found.';
  end if;
  if v_session.host_id != auth.uid() then
    raise exception 'Not authorized for this session.';
  end if;
  if v_session.status != 'lobby' then
    raise exception 'Session has already started.';
  end if;

  select * into v_first_question
  from public.questions
  where game_id = v_session.game_id
  order by position
  limit 1;

  if v_first_question.id is null then
    raise exception 'This game has no questions.';
  end if;

  select coalesce((settings ->> 'timerSeconds')::integer, 20)
  into v_timer_seconds
  from public.games
  where id = v_session.game_id;

  update public.game_sessions
  set status = 'in_progress',
      started_at = now(),
      current_question_id = v_first_question.id,
      question_started_at = now(),
      question_deadline_at = now() + (v_timer_seconds || ' seconds')::interval,
      answers_locked_at = null,
      question_revealed_at = null
  where id = p_session_id
  returning * into v_session;

  return v_session;
end;
$$;

create function public.lock_answers(p_session_id uuid)
returns public.game_sessions
language plpgsql
set search_path = public
as $$
declare
  v_session public.game_sessions;
begin
  select * into v_session from public.game_sessions where id = p_session_id;
  if v_session.id is null then
    raise exception 'Session not found.';
  end if;
  if v_session.host_id != auth.uid() then
    raise exception 'Not authorized for this session.';
  end if;
  if v_session.status != 'in_progress' or v_session.current_question_id is null then
    raise exception 'No active question to lock.';
  end if;

  update public.game_sessions
  set answers_locked_at = coalesce(answers_locked_at, now())
  where id = p_session_id
  returning * into v_session;

  return v_session;
end;
$$;

create function public.reveal_answer(p_session_id uuid)
returns public.game_sessions
language plpgsql
set search_path = public
as $$
declare
  v_session public.game_sessions;
begin
  perform public._enforce_question_deadline(p_session_id);

  select * into v_session from public.game_sessions where id = p_session_id;
  if v_session.id is null then
    raise exception 'Session not found.';
  end if;
  if v_session.host_id != auth.uid() then
    raise exception 'Not authorized for this session.';
  end if;
  if v_session.answers_locked_at is null then
    raise exception 'Lock answers before revealing.';
  end if;

  update public.game_sessions
  set question_revealed_at = coalesce(question_revealed_at, now())
  where id = p_session_id
  returning * into v_session;

  return v_session;
end;
$$;

create function public.advance_question(p_session_id uuid)
returns public.game_sessions
language plpgsql
set search_path = public
as $$
declare
  v_session public.game_sessions;
  v_current_position integer;
  v_next_question public.questions;
  v_timer_seconds integer;
begin
  select * into v_session from public.game_sessions where id = p_session_id;
  if v_session.id is null then
    raise exception 'Session not found.';
  end if;
  if v_session.host_id != auth.uid() then
    raise exception 'Not authorized for this session.';
  end if;
  if v_session.question_revealed_at is null then
    raise exception 'Reveal the current question before advancing.';
  end if;

  select position into v_current_position
  from public.questions
  where id = v_session.current_question_id;

  select * into v_next_question
  from public.questions
  where game_id = v_session.game_id
    and position > v_current_position
  order by position
  limit 1;

  if v_next_question.id is not null then
    select coalesce((settings ->> 'timerSeconds')::integer, 20)
    into v_timer_seconds
    from public.games
    where id = v_session.game_id;

    update public.game_sessions
    set current_question_id = v_next_question.id,
        question_started_at = now(),
        question_deadline_at = now() + (v_timer_seconds || ' seconds')::interval,
        answers_locked_at = null,
        question_revealed_at = null
    where id = p_session_id
    returning * into v_session;
  else
    update public.game_sessions
    set status = 'completed',
        ended_at = now()
    where id = p_session_id
    returning * into v_session;
  end if;

  return v_session;
end;
$$;

create function public.pause_session(p_session_id uuid)
returns public.game_sessions
language plpgsql
set search_path = public
as $$
declare
  v_session public.game_sessions;
begin
  select * into v_session from public.game_sessions where id = p_session_id;
  if v_session.id is null then
    raise exception 'Session not found.';
  end if;
  if v_session.host_id != auth.uid() then
    raise exception 'Not authorized for this session.';
  end if;
  if v_session.status != 'in_progress' then
    raise exception 'Only an in-progress session can be paused.';
  end if;

  update public.game_sessions
  set status = 'paused'
  where id = p_session_id
  returning * into v_session;

  return v_session;
end;
$$;

create function public.resume_session(p_session_id uuid)
returns public.game_sessions
language plpgsql
set search_path = public
as $$
declare
  v_session public.game_sessions;
begin
  select * into v_session from public.game_sessions where id = p_session_id;
  if v_session.id is null then
    raise exception 'Session not found.';
  end if;
  if v_session.host_id != auth.uid() then
    raise exception 'Not authorized for this session.';
  end if;
  if v_session.status != 'paused' then
    raise exception 'Only a paused session can be resumed.';
  end if;

  update public.game_sessions
  set status = 'in_progress'
  where id = p_session_id
  returning * into v_session;

  return v_session;
end;
$$;

create function public.end_session(p_session_id uuid)
returns public.game_sessions
language plpgsql
set search_path = public
as $$
declare
  v_session public.game_sessions;
begin
  select * into v_session from public.game_sessions where id = p_session_id;
  if v_session.id is null then
    raise exception 'Session not found.';
  end if;
  if v_session.host_id != auth.uid() then
    raise exception 'Not authorized for this session.';
  end if;
  if v_session.status in ('completed', 'cancelled') then
    raise exception 'Session has already ended.';
  end if;

  update public.game_sessions
  set status = 'completed',
      ended_at = now()
  where id = p_session_id
  returning * into v_session;

  return v_session;
end;
$$;

revoke all on function public.start_session(uuid) from public;
revoke all on function public.lock_answers(uuid) from public;
revoke all on function public.reveal_answer(uuid) from public;
revoke all on function public.advance_question(uuid) from public;
revoke all on function public.pause_session(uuid) from public;
revoke all on function public.resume_session(uuid) from public;
revoke all on function public.end_session(uuid) from public;

grant execute on function public.start_session(uuid) to authenticated;
grant execute on function public.lock_answers(uuid) to authenticated;
grant execute on function public.reveal_answer(uuid) to authenticated;
grant execute on function public.advance_question(uuid) to authenticated;
grant execute on function public.pause_session(uuid) to authenticated;
grant execute on function public.resume_session(uuid) to authenticated;
grant execute on function public.end_session(uuid) to authenticated;
