-- Lazy deadline enforcement (Project Plan section 10): rather than a background
-- scheduler, any RPC that touches a session's live state calls this first. It
-- locks answers in place if the authoritative deadline has already passed,
-- without requiring an active job. Internal helper, not exposed to clients.
create function public._enforce_question_deadline(p_session_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.game_sessions
  set answers_locked_at = now()
  where id = p_session_id
    and status = 'in_progress'
    and answers_locked_at is null
    and question_deadline_at is not null
    and now() > question_deadline_at;
end;
$$;

-- Guest-facing: a participant has no write access to participant_answers or
-- game_sessions under RLS, by design. This function is the trusted path.
-- Correctness and points are computed here, never trusted from the client, and
-- the response deliberately omits is_correct/points_awarded so a guest cannot
-- learn the answer before the reveal phase from their own submission response.
create function public.submit_answer(p_session_id uuid, p_answer_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_session public.game_sessions;
  v_participant public.participants;
  v_answer public.answers;
  v_question public.questions;
  v_is_correct boolean;
  v_points integer;
  v_row public.participant_answers;
begin
  if v_user_id is null then
    raise exception 'Authentication required to submit an answer.';
  end if;

  perform public._enforce_question_deadline(p_session_id);

  select * into v_session from public.game_sessions where id = p_session_id;
  if v_session.id is null then
    raise exception 'Session not found.';
  end if;
  if v_session.status != 'in_progress' then
    raise exception 'Session is not accepting answers.';
  end if;
  if v_session.current_question_id is null then
    raise exception 'No active question.';
  end if;
  if v_session.answers_locked_at is not null then
    raise exception 'Answers are locked for this question.';
  end if;

  select * into v_participant
  from public.participants
  where session_id = p_session_id and user_id = v_user_id;
  if v_participant.id is null then
    raise exception 'You are not a participant of this session.';
  end if;

  select * into v_answer from public.answers where id = p_answer_id;
  if v_answer.id is null or v_answer.question_id != v_session.current_question_id then
    raise exception 'Answer does not belong to the current question.';
  end if;

  select * into v_question from public.questions where id = v_session.current_question_id;

  v_is_correct := v_answer.is_correct;
  v_points := case when v_is_correct then v_question.points else 0 end;

  begin
    insert into public.participant_answers (
      session_id, participant_id, question_id, answer_id, is_correct, points_awarded
    )
    values (
      p_session_id, v_participant.id, v_session.current_question_id, p_answer_id, v_is_correct, v_points
    )
    returning * into v_row;
  exception when unique_violation then
    raise exception 'You have already answered this question.';
  end;

  update public.participants
  set total_score = total_score + v_points
  where id = v_participant.id;

  return jsonb_build_object('id', v_row.id, 'submittedAt', v_row.submitted_at);
end;
$$;

revoke all on function public.submit_answer(uuid, uuid) from public;
grant execute on function public.submit_answer(uuid, uuid) to authenticated;
