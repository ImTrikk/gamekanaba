-- GameKanaBa initial schema (Project Plan section 7)
-- Hosts authenticate via Supabase Auth (email/password).
-- Guest players authenticate via Supabase anonymous sign-ins (auth.users.is_anonymous = true).

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Auto-create a profile row for every non-anonymous (host) auth user.
create function public.handle_new_host_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if coalesce(new.is_anonymous, false) = false then
    insert into public.profiles (id, display_name)
    values (new.id, new.email);
  end if;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_host_user();

create table public.games (
  id uuid primary key default gen_random_uuid(),
  host_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  description text,
  cover_image_path text,
  settings jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index games_host_id_idx on public.games (host_id);

create table public.questions (
  id uuid primary key default gen_random_uuid(),
  game_id uuid not null references public.games (id) on delete cascade,
  question_text text not null,
  question_type text not null check (question_type in ('multiple_choice', 'true_false')),
  points integer not null default 1000 check (points >= 0),
  position integer not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (game_id, position)
);

create index questions_game_id_idx on public.questions (game_id);

create table public.answers (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references public.questions (id) on delete cascade,
  answer_text text not null,
  is_correct boolean not null default false,
  position integer not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (question_id, position)
);

create index answers_question_id_idx on public.answers (question_id);

create table public.game_sessions (
  id uuid primary key default gen_random_uuid(),
  game_id uuid not null references public.games (id) on delete cascade,
  host_id uuid not null references public.profiles (id) on delete cascade,
  pin text not null,
  status text not null default 'lobby'
    check (status in ('lobby', 'in_progress', 'paused', 'completed', 'cancelled')),
  current_question_id uuid references public.questions (id),
  question_started_at timestamptz,
  question_deadline_at timestamptz,
  answers_locked_at timestamptz,
  started_at timestamptz,
  ended_at timestamptz,
  created_at timestamptz not null default now()
);

create index game_sessions_game_id_idx on public.game_sessions (game_id);
create index game_sessions_host_id_idx on public.game_sessions (host_id);

-- A PIN must be unique only among sessions that can still be joined.
create unique index game_sessions_active_pin_idx
  on public.game_sessions (pin)
  where status in ('lobby', 'in_progress', 'paused');

create table public.participants (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.game_sessions (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  full_name text not null check (char_length(full_name) between 1 and 100),
  display_name text not null check (char_length(display_name) between 1 and 50),
  total_score integer not null default 0,
  is_connected boolean not null default true,
  joined_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  unique (session_id, user_id)
);

create index participants_session_id_idx on public.participants (session_id);

create table public.participant_answers (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.game_sessions (id) on delete cascade,
  participant_id uuid not null references public.participants (id) on delete cascade,
  question_id uuid not null references public.questions (id) on delete cascade,
  answer_id uuid not null references public.answers (id) on delete cascade,
  is_correct boolean not null,
  points_awarded integer not null default 0,
  submitted_at timestamptz not null default now(),
  unique (participant_id, question_id)
);

create index participant_answers_session_id_idx on public.participant_answers (session_id);
create index participant_answers_question_id_idx on public.participant_answers (question_id);
