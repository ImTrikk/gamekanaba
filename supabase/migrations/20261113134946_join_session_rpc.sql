-- Guest join is the one operation in this phase that genuinely needs to bypass
-- RLS: a prospective guest has no SELECT policy on game_sessions (they aren't a
-- participant yet) and no INSERT policy on participants (writes are reserved
-- for trusted server-side logic per the Project Plan). This function is that
-- trusted logic. It runs as SECURITY DEFINER and performs every validation
-- itself before writing.
create or replace function public.join_session(
  p_pin text,
  p_full_name text,
  p_display_name text
)
returns public.participants
language plpgsql
security definer
set search_path = public
as $$
declare
  v_session public.game_sessions;
  v_participant public.participants;
  v_user_id uuid := auth.uid();
  v_full_name text := trim(p_full_name);
  v_display_name text := trim(p_display_name);
begin
  if v_user_id is null then
    raise exception 'Authentication required to join a session.';
  end if;

  if char_length(v_full_name) < 1 or char_length(v_full_name) > 100 then
    raise exception 'Full name must be between 1 and 100 characters.';
  end if;

  if char_length(v_display_name) < 1 or char_length(v_display_name) > 50 then
    raise exception 'Display name must be between 1 and 50 characters.';
  end if;

  select *
  into v_session
  from public.game_sessions
  where pin = p_pin
    and status = 'lobby'
  limit 1;

  if v_session.id is null then
    raise exception 'No joinable session found for this PIN.';
  end if;

  insert into public.participants (session_id, user_id, full_name, display_name)
  values (v_session.id, v_user_id, v_full_name, v_display_name)
  on conflict (session_id, user_id)
  do update set
    full_name = excluded.full_name,
    display_name = excluded.display_name,
    is_connected = true,
    last_seen_at = now()
  returning * into v_participant;

  return v_participant;
end;
$$;

revoke all on function public.join_session(text, text, text) from public;
grant execute on function public.join_session(text, text, text) to authenticated;
