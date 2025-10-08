-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create user_profiles table (extends auth.users)
create table if not exists public.user_profiles (
  id uuid references auth.users on delete cascade primary key,
  username text,
  is_anonymous boolean default false,
  golden_note_shards integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create challenges table (master list of all challenges)
create table if not exists public.challenges (
  id text primary key,
  type text not null,
  title text not null,
  description text not null,
  icon text not null,
  requirement integer not null,
  reward integer not null,
  target_route text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create user_challenges table (tracks user progress on challenges)
create table if not exists public.user_challenges (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.user_profiles(id) on delete cascade not null,
  challenge_id text references public.challenges(id) on delete cascade not null,
  progress integer default 0,
  status text default 'available',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, challenge_id)
);

-- Enable Row Level Security
alter table public.user_profiles enable row level security;
alter table public.challenges enable row level security;
alter table public.user_challenges enable row level security;

-- Policies for user_profiles
create policy "Users can view own profile"
  on public.user_profiles for select
  to authenticated
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.user_profiles for update
  to authenticated
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.user_profiles for insert
  to authenticated
  with check (auth.uid() = id);

-- Policies for challenges (everyone can read)
create policy "Anyone can view challenges"
  on public.challenges for select
  to authenticated
  using (true);

-- Policies for user_challenges
create policy "Users can view own challenges"
  on public.user_challenges for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert own challenges"
  on public.user_challenges for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update own challenges"
  on public.user_challenges for update
  to authenticated
  using (auth.uid() = user_id);

-- Function to automatically create user profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.user_profiles (id, is_anonymous)
  values (
    new.id,
    coalesce(new.is_anonymous, false)
  );
  return new;
end;
$$;

-- Trigger to create profile on user signup
create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Function to update updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$;

-- Triggers for updated_at
create trigger handle_user_profiles_updated_at
  before update on public.user_profiles
  for each row execute procedure public.handle_updated_at();

create trigger handle_challenges_updated_at
  before update on public.challenges
  for each row execute procedure public.handle_updated_at();

create trigger handle_user_challenges_updated_at
  before update on public.user_challenges
  for each row execute procedure public.handle_updated_at();