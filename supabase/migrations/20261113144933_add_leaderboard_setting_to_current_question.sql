-- Guest clients have no RLS path to read public.games directly (by design —
-- see games_select_own, host-only). showLeaderboardAfterQuestion must be
-- surfaced through this RPC instead of making the player screen fetch it
-- straight from the games table.
create or replace function public.get_current_question(p_session_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_session public.game_sessions;
  v_question public.questions;
  v_answers jsonb;
  v_show_leaderboard boolean;
begin
  if v_user_id is null then
    raise exception 'Authentication required.';
  end if;

  if not (public.is_session_host(p_session_id) or public.is_session_participant(p_session_id)) then
    raise exception 'Not authorized for this session.';
  end if;

  perform public._enforce_question_deadline(p_session_id);

  select * into v_session from public.game_sessions where id = p_session_id;
  if v_session.id is null then
    raise exception 'Session not found.';
  end if;

  select coalesce((g.settings ->> 'showLeaderboardAfterQuestion')::boolean, true)
  into v_show_leaderboard
  from public.games g
  where g.id = v_session.game_id;

  if v_session.current_question_id is null then
    return jsonb_build_object(
      'sessionStatus', v_session.status,
      'questionId', null,
      'showLeaderboardAfterQuestion', v_show_leaderboard
    );
  end if;

  select * into v_question from public.questions where id = v_session.current_question_id;

  select coalesce(jsonb_agg(
    jsonb_build_object(
      'id', a.id,
      'answerText', a.answer_text,
      'position', a.position,
      'isCorrect', case when v_session.question_revealed_at is not null then a.is_correct else null end
    )
    order by a.position
  ), '[]'::jsonb)
  into v_answers
  from public.answers a
  where a.question_id = v_session.current_question_id;

  return jsonb_build_object(
    'sessionStatus', v_session.status,
    'questionId', v_question.id,
    'questionText', v_question.question_text,
    'questionType', v_question.question_type,
    'points', v_question.points,
    'deadlineAt', v_session.question_deadline_at,
    'isLocked', v_session.answers_locked_at is not null,
    'isRevealed', v_session.question_revealed_at is not null,
    'showLeaderboardAfterQuestion', v_show_leaderboard,
    'answers', v_answers
  );
end;
$$;
