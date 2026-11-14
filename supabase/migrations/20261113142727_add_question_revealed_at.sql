-- The Phase 1 schema tracked question_started_at / question_deadline_at /
-- answers_locked_at but never added a marker for the "revealed" phase from the
-- Project Plan's question-phase state machine (section 9: waiting/active/
-- locked/revealed). Needed now to implement reveal and to gate when answers.
-- is_correct becomes visible to guest clients.
alter table public.game_sessions
  add column question_revealed_at timestamptz;
