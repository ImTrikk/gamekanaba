-- Required for live question-open/lock/reveal/advance propagation (Project
-- Plan section 8) and for the host's answer-progress count ("12 of 20
-- answered"). Both still respect each table's RLS — a guest only ever
-- receives game_sessions changes for sessions they're a participant of, and
-- only ever receives participant_answers rows that belong to their own
-- participant_id (the host sees all, via the session-ownership SELECT policy).
alter publication supabase_realtime add table public.game_sessions;
alter publication supabase_realtime add table public.participant_answers;
