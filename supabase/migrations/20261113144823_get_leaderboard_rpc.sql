-- Leaderboard visibility is intentionally different from every other guest-
-- facing read in this schema: the Project Plan (section 4.8) says every
-- participant should see rank, display name, and total score for the whole
-- session, not just their own row. participants' SELECT policy only allows a
-- guest to see their own row, so this is a deliberate, scoped exception via a
-- SECURITY DEFINER function — not a RLS gap. It never exposes full_name,
-- user_id, or anything beyond what the Plan says a leaderboard shows.
create function public.get_leaderboard(p_session_id uuid)
returns table (
  participant_id uuid,
  display_name text,
  total_score integer,
  correct_answers bigint,
  rank bigint
)
language plpgsql
security definer
set search_path = public
as $$
begin
  if not (public.is_session_host(p_session_id) or public.is_session_participant(p_session_id)) then
    raise exception 'Not authorized for this session.';
  end if;

  return query
  select
    p.id as participant_id,
    p.display_name,
    p.total_score,
    (
      select count(*)
      from public.participant_answers pa
      where pa.participant_id = p.id and pa.is_correct
    ) as correct_answers,
    rank() over (order by p.total_score desc) as rank
  from public.participants p
  where p.session_id = p_session_id
  order by rank, p.display_name;
end;
$$;

revoke all on function public.get_leaderboard(uuid) from public;
grant execute on function public.get_leaderboard(uuid) to authenticated;
