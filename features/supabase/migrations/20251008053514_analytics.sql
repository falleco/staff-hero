-- Game Analytics System Migration
-- This migration creates tables and functions for tracking game sessions,
-- achievements, and user analytics

-- Create game_sessions table (stores individual game plays)
create table if not exists public.game_sessions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.user_profiles(id) on delete cascade not null,
  game_mode text not null, -- 'single-note', 'sequence', 'rhythm'
  difficulty text not null, -- 'beginner', 'intermediate', 'advanced'
  notation_system text not null, -- 'letter', 'solfege'
  score integer not null default 0,
  streak integer not null default 0,
  max_streak integer not null default 0,
  total_questions integer not null default 0,
  correct_answers integer not null default 0,
  accuracy integer not null default 0, -- percentage (0-100)
  duration integer not null default 0, -- in seconds
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create achievements table (master list of all achievements)
create table if not exists public.achievements (
  id text primary key,
  title text not null,
  description text not null,
  icon text not null,
  unlock_condition text not null, -- e.g., 'first_game', 'streak_5', 'games_50'
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create user_achievements table (tracks unlocked achievements per user)
create table if not exists public.user_achievements (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.user_profiles(id) on delete cascade not null,
  achievement_id text references public.achievements(id) on delete cascade not null,
  unlocked_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, achievement_id)
);

-- Create indexes for faster queries
create index if not exists game_sessions_user_id_idx on public.game_sessions(user_id);
create index if not exists game_sessions_created_at_idx on public.game_sessions(created_at desc);
create index if not exists game_sessions_game_mode_idx on public.game_sessions(game_mode);
create index if not exists user_achievements_user_id_idx on public.user_achievements(user_id);
create index if not exists user_achievements_achievement_id_idx on public.user_achievements(achievement_id);

-- Enable Row Level Security
alter table public.game_sessions enable row level security;
alter table public.achievements enable row level security;
alter table public.user_achievements enable row level security;

-- RLS Policies for game_sessions
drop policy if exists "Users can view own sessions" on public.game_sessions;
create policy "Users can view own sessions"
  on public.game_sessions for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own sessions" on public.game_sessions;
create policy "Users can insert own sessions"
  on public.game_sessions for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete own sessions" on public.game_sessions;
create policy "Users can delete own sessions"
  on public.game_sessions for delete
  to authenticated
  using (auth.uid() = user_id);

-- RLS Policies for achievements (everyone can read)
drop policy if exists "Anyone can view achievements" on public.achievements;
create policy "Anyone can view achievements"
  on public.achievements for select
  to authenticated
  using (true);

-- RLS Policies for user_achievements
drop policy if exists "Users can view own achievements" on public.user_achievements;
create policy "Users can view own achievements"
  on public.user_achievements for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own achievements" on public.user_achievements;
create policy "Users can insert own achievements"
  on public.user_achievements for insert
  to authenticated
  with check (auth.uid() = user_id);

-- Trigger for updated_at on achievements
drop trigger if exists handle_achievements_updated_at on public.achievements;
create trigger handle_achievements_updated_at
  before update on public.achievements
  for each row execute procedure public.handle_updated_at();

-- Function to get user analytics (aggregated from sessions)
create or replace function public.get_user_analytics(p_user_id uuid)
returns jsonb
language plpgsql
security definer
as $$
declare
  v_analytics jsonb;
  v_total_games integer;
  v_total_score integer;
  v_best_streak integer;
  v_avg_accuracy numeric;
  v_total_playtime integer;
  v_favorite_mode text;
  v_favorite_notation text;
  v_favorite_difficulty text;
begin
  -- Get aggregated stats
  select 
    count(*)::integer,
    coalesce(sum(score), 0)::integer,
    coalesce(max(max_streak), 0)::integer,
    coalesce(round(avg(accuracy)), 0)::numeric,
    coalesce(sum(duration), 0)::integer
  into 
    v_total_games,
    v_total_score,
    v_best_streak,
    v_avg_accuracy,
    v_total_playtime
  from public.game_sessions
  where user_id = p_user_id;

  -- Get favorite game mode (most played)
  select game_mode into v_favorite_mode
  from public.game_sessions
  where user_id = p_user_id
  group by game_mode
  order by count(*) desc
  limit 1;

  -- Get favorite notation (most used)
  select notation_system into v_favorite_notation
  from public.game_sessions
  where user_id = p_user_id
  group by notation_system
  order by count(*) desc
  limit 1;

  -- Get favorite difficulty (most played)
  select difficulty into v_favorite_difficulty
  from public.game_sessions
  where user_id = p_user_id
  group by difficulty
  order by count(*) desc
  limit 1;

  -- Build JSON response
  v_analytics := jsonb_build_object(
    'totalGamesPlayed', v_total_games,
    'totalScore', v_total_score,
    'bestStreak', v_best_streak,
    'averageAccuracy', v_avg_accuracy,
    'totalPlayTime', v_total_playtime,
    'favoriteGameMode', coalesce(v_favorite_mode, 'single-note'),
    'favoriteNotation', coalesce(v_favorite_notation, 'letter'),
    'favoriteDifficulty', coalesce(v_favorite_difficulty, 'beginner'),
    'gamesPerMode', (
      select jsonb_object_agg(game_mode, count)
      from (
        select game_mode, count(*)::integer as count
        from public.game_sessions
        where user_id = p_user_id
        group by game_mode
      ) sub
    ),
    'gamesPerNotation', (
      select jsonb_object_agg(notation_system, count)
      from (
        select notation_system, count(*)::integer as count
        from public.game_sessions
        where user_id = p_user_id
        group by notation_system
      ) sub
    ),
    'gamesPerDifficulty', (
      select jsonb_object_agg(difficulty, count)
      from (
        select difficulty, count(*)::integer as count
        from public.game_sessions
        where user_id = p_user_id
        group by difficulty
      ) sub
    )
  );

  return v_analytics;
end;
$$;

-- Function to add a game session and check achievements
create or replace function public.add_game_session(
  p_user_id uuid,
  p_game_mode text,
  p_difficulty text,
  p_notation_system text,
  p_score integer,
  p_streak integer,
  p_max_streak integer,
  p_total_questions integer,
  p_correct_answers integer,
  p_accuracy integer,
  p_duration integer
)
returns uuid
language plpgsql
security definer
as $$
declare
  v_session_id uuid;
  v_total_games integer;
begin
  -- Insert game session
  insert into public.game_sessions (
    user_id,
    game_mode,
    difficulty,
    notation_system,
    score,
    streak,
    max_streak,
    total_questions,
    correct_answers,
    accuracy,
    duration
  )
  values (
    p_user_id,
    p_game_mode,
    p_difficulty,
    p_notation_system,
    p_score,
    p_streak,
    p_max_streak,
    p_total_questions,
    p_correct_answers,
    p_accuracy,
    p_duration
  )
  returning id into v_session_id;

  -- Get total games count
  select count(*) into v_total_games
  from public.game_sessions
  where user_id = p_user_id;

  -- Check and unlock achievements
  -- First game
  if v_total_games = 1 then
    perform public.unlock_achievement(p_user_id, 'first_game');
  end if;

  -- Streak achievements
  if p_max_streak >= 5 then
    perform public.unlock_achievement(p_user_id, 'streak_5');
  end if;

  if p_max_streak >= 10 then
    perform public.unlock_achievement(p_user_id, 'streak_10');
  end if;

  -- Perfect game
  if p_accuracy = 100 then
    perform public.unlock_achievement(p_user_id, 'perfect_game');
  end if;

  -- Notation master (played both systems)
  if exists (
    select 1 from public.game_sessions
    where user_id = p_user_id and notation_system = 'letter'
  ) and exists (
    select 1 from public.game_sessions
    where user_id = p_user_id and notation_system = 'solfege'
  ) then
    perform public.unlock_achievement(p_user_id, 'notation_master');
  end if;

  -- Dedicated player (50 games)
  if v_total_games >= 50 then
    perform public.unlock_achievement(p_user_id, 'dedicated_player');
  end if;

  return v_session_id;
end;
$$;

-- Function to unlock an achievement for a user
create or replace function public.unlock_achievement(
  p_user_id uuid,
  p_achievement_id text
)
returns boolean
language plpgsql
security definer
as $$
declare
  v_already_unlocked boolean;
begin
  -- Check if already unlocked
  select exists (
    select 1 from public.user_achievements
    where user_id = p_user_id and achievement_id = p_achievement_id
  ) into v_already_unlocked;

  -- If not unlocked, unlock it
  if not v_already_unlocked then
    insert into public.user_achievements (user_id, achievement_id)
    values (p_user_id, p_achievement_id)
    on conflict (user_id, achievement_id) do nothing;
    return true;
  end if;

  return false;
end;
$$;

-- Function to get user achievements with details
create or replace function public.get_user_achievements(p_user_id uuid)
returns table (
  id text,
  title text,
  description text,
  icon text,
  is_unlocked boolean,
  unlocked_at timestamp with time zone
)
language plpgsql
security definer
as $$
begin
  return query
  select 
    a.id,
    a.title,
    a.description,
    a.icon,
    (ua.achievement_id is not null) as is_unlocked,
    ua.unlocked_at
  from public.achievements a
  left join public.user_achievements ua 
    on a.id = ua.achievement_id and ua.user_id = p_user_id
  order by 
    case when ua.unlocked_at is not null then 0 else 1 end,
    ua.unlocked_at desc,
    a.id;
end;
$$;

-- Function to get recent game sessions
create or replace function public.get_recent_sessions(
  p_user_id uuid,
  p_limit integer default 20
)
returns table (
  id uuid,
  game_mode text,
  difficulty text,
  notation_system text,
  score integer,
  streak integer,
  max_streak integer,
  total_questions integer,
  correct_answers integer,
  accuracy integer,
  duration integer,
  created_at timestamp with time zone
)
language plpgsql
security definer
as $$
begin
  return query
  select 
    gs.id,
    gs.game_mode,
    gs.difficulty,
    gs.notation_system,
    gs.score,
    gs.streak,
    gs.max_streak,
    gs.total_questions,
    gs.correct_answers,
    gs.accuracy,
    gs.duration,
    gs.created_at
  from public.game_sessions gs
  where gs.user_id = p_user_id
  order by gs.created_at desc
  limit p_limit;
end;
$$;

-- Grant necessary permissions
grant usage on schema public to authenticated;
grant select, insert, delete on public.game_sessions to authenticated;
grant select on public.achievements to authenticated;
grant select, insert on public.user_achievements to authenticated;
grant execute on function public.get_user_analytics(uuid) to authenticated;
grant execute on function public.add_game_session(uuid, text, text, text, integer, integer, integer, integer, integer, integer, integer) to authenticated;
grant execute on function public.unlock_achievement(uuid, text) to authenticated;
grant execute on function public.get_user_achievements(uuid) to authenticated;
grant execute on function public.get_recent_sessions(uuid, integer) to authenticated;

-- Add comments for documentation
comment on table public.game_sessions is 'Stores individual game play sessions with detailed stats';
comment on table public.achievements is 'Master list of all available achievements';
comment on table public.user_achievements is 'Tracks which achievements each user has unlocked';
comment on function public.get_user_analytics(uuid) is 'Returns aggregated analytics for a user from all their game sessions';
comment on function public.add_game_session(uuid, text, text, text, integer, integer, integer, integer, integer, integer, integer) is 'Adds a game session and automatically checks for achievement unlocks';
comment on function public.unlock_achievement(uuid, text) is 'Unlocks an achievement for a user if not already unlocked';
comment on function public.get_user_achievements(uuid) is 'Returns all achievements with unlock status for a user';
comment on function public.get_recent_sessions(uuid, integer) is 'Returns recent game sessions for a user';

