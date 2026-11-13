-- Required for the host's live participant list (Project Plan section 8:
-- "Participant joined" / "Participant connection changed" events). postgres_changes
-- payloads still respect each table's RLS policies, so a guest subscribing would
-- only ever receive rows they're already allowed to SELECT.
alter publication supabase_realtime add table public.participants;
