-- Musical Instruments System Migration
-- This migration creates tables for musical instruments that can be purchased,
-- upgraded, and tuned at the luthier

-- Create instruments table (master list of all instruments)
create table if not exists public.instruments (
  id text primary key,
  name text not null,
  type text not null, -- 'violin', 'viola', 'acoustic_guitar', 'electric_guitar', 'bass'
  rarity text not null, -- 'apprentice', 'normal', 'pro', 'epic'
  base_level integer not null default 1,
  base_score_multiplier numeric(3,2) not null default 1.0, -- e.g., 1.0, 1.1, 1.2
  base_accuracy_bonus integer not null default 0,
  base_streak_bonus integer not null default 0,
  base_tuning integer not null default 100, -- 0-100
  price integer not null, -- Cost in golden note shards
  upgrade_price integer not null, -- Cost to upgrade
  tune_price integer not null, -- Cost to tune
  icon text not null,
  description text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create user_instruments table (tracks what users own and their status)
create table if not exists public.user_instruments (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.user_profiles(id) on delete cascade not null,
  instrument_id text references public.instruments(id) on delete cascade not null,
  level integer not null default 1,
  tuning integer not null default 100, -- Current tuning level (0-100)
  is_equipped boolean not null default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, instrument_id)
);

-- Create indexes for faster queries
create index if not exists user_instruments_user_id_idx on public.user_instruments(user_id);
create index if not exists user_instruments_instrument_id_idx on public.user_instruments(instrument_id);
create index if not exists user_instruments_is_equipped_idx on public.user_instruments(is_equipped) where is_equipped = true;

-- Enable Row Level Security
alter table public.instruments enable row level security;
alter table public.user_instruments enable row level security;

-- RLS Policies for instruments (everyone can read)
drop policy if exists "Anyone can view instruments" on public.instruments;
create policy "Anyone can view instruments"
  on public.instruments for select
  to authenticated
  using (true);

-- RLS Policies for user_instruments
drop policy if exists "Users can view own instruments" on public.user_instruments;
create policy "Users can view own instruments"
  on public.user_instruments for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own instruments" on public.user_instruments;
create policy "Users can insert own instruments"
  on public.user_instruments for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own instruments" on public.user_instruments;
create policy "Users can update own instruments"
  on public.user_instruments for update
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Users can delete own instruments" on public.user_instruments;
create policy "Users can delete own instruments"
  on public.user_instruments for delete
  to authenticated
  using (auth.uid() = user_id);

-- Trigger for updated_at on instruments
drop trigger if exists handle_instruments_updated_at on public.instruments;
create trigger handle_instruments_updated_at
  before update on public.instruments
  for each row execute procedure public.handle_updated_at();

-- Trigger for updated_at on user_instruments
drop trigger if exists handle_user_instruments_updated_at on public.user_instruments;
create trigger handle_user_instruments_updated_at
  before update on public.user_instruments
  for each row execute procedure public.handle_updated_at();

-- Function to get instruments with user ownership data
create or replace function public.get_user_instruments(p_user_id uuid)
returns table (
  id text,
  name text,
  type text,
  rarity text,
  level integer,
  score_multiplier numeric,
  accuracy_bonus integer,
  streak_bonus integer,
  tuning integer,
  price integer,
  upgrade_price integer,
  tune_price integer,
  icon text,
  description text,
  is_owned boolean,
  is_equipped boolean
)
language plpgsql
security definer
as $$
declare
  v_preferred_instrument text;
  v_effective_type text := 'violin';
begin
  select preferred_instrument
  into v_preferred_instrument
  from public.user_profiles
  where id = p_user_id;

  if v_preferred_instrument is not null then
    v_effective_type := v_preferred_instrument;
  end if;

  if not exists (
    select 1 from public.instruments where type = v_effective_type
  ) then
    v_effective_type := 'violin';
  end if;

  return query
  select
    i.id,
    i.name,
    i.type,
    i.rarity,
    coalesce(ui.level, i.base_level) as level,
    -- Calculate score multiplier based on level (each level adds 0.1)
    i.base_score_multiplier + (coalesce(ui.level, i.base_level) - 1) * 0.1 as score_multiplier,
    -- Calculate accuracy bonus based on level (each level adds 2)
    i.base_accuracy_bonus + (coalesce(ui.level, i.base_level) - 1) * 2 as accuracy_bonus,
    -- Calculate streak bonus based on level (each level adds 1)
    i.base_streak_bonus + (coalesce(ui.level, i.base_level) - 1) * 1 as streak_bonus,
    coalesce(ui.tuning, i.base_tuning) as tuning,
    i.price,
    -- Upgrade price increases by 1.5x per level
    floor(i.upgrade_price * power(1.5, coalesce(ui.level, i.base_level) - 1))::integer as upgrade_price,
    i.tune_price,
    i.icon,
    i.description,
    (ui.instrument_id is not null) as is_owned,
    coalesce(ui.is_equipped, false) as is_equipped
  from public.instruments i
  left join public.user_instruments ui
    on i.id = ui.instrument_id and ui.user_id = p_user_id
  where i.type = v_effective_type
  order by
    case i.rarity
      when 'apprentice' then 1
      when 'normal' then 2
      when 'pro' then 3
      when 'epic' then 4
      else 5
    end,
    i.price;
end;
$$;

-- Function to purchase instrument
create or replace function public.purchase_instrument(
  p_user_id uuid,
  p_instrument_id text
)
returns uuid
language plpgsql
security definer
as $$
declare
  v_instrument_price integer;
  v_current_balance integer;
  v_user_instrument_id uuid;
  v_base_tuning integer;
begin
  -- Get instrument price and base tuning
  select price, base_tuning into v_instrument_price, v_base_tuning
  from public.instruments
  where id = p_instrument_id;
  
  if v_instrument_price is null then
    raise exception 'Instrument not found';
  end if;
  
  -- Check if already owned
  if exists (
    select 1 from public.user_instruments
    where user_id = p_user_id and instrument_id = p_instrument_id
  ) then
    raise exception 'Instrument already owned';
  end if;
  
  -- Check balance
  v_current_balance := public.get_user_balance(p_user_id, 'golden_note_shards');
  
  if v_current_balance < v_instrument_price then
    raise exception 'Insufficient balance. Required: %, Current: %', v_instrument_price, v_current_balance;
  end if;
  
  -- Deduct currency
  perform public.add_currency_transaction(
    p_user_id,
    -v_instrument_price,
    'purchase',
    p_instrument_id,
    'Purchased instrument: ' || (select name from public.instruments where id = p_instrument_id),
    jsonb_build_object('instrument_id', p_instrument_id, 'price', v_instrument_price),
    'golden_note_shards'
  );
  
  -- Add instrument to user with base tuning
  insert into public.user_instruments (user_id, instrument_id, level, tuning, is_equipped)
  values (p_user_id, p_instrument_id, 1, v_base_tuning, false)
  returning id into v_user_instrument_id;
  
  return v_user_instrument_id;
end;
$$;

-- Function to upgrade instrument
create or replace function public.upgrade_instrument(
  p_user_id uuid,
  p_instrument_id text
)
returns void
language plpgsql
security definer
as $$
declare
  v_current_level integer;
  v_upgrade_price integer;
  v_current_balance integer;
  v_instrument_name text;
begin
  -- Get current level and instrument info
  select ui.level, i.upgrade_price, i.name
  into v_current_level, v_upgrade_price, v_instrument_name
  from public.user_instruments ui
  join public.instruments i on i.id = ui.instrument_id
  where ui.user_id = p_user_id and ui.instrument_id = p_instrument_id;
  
  if v_current_level is null then
    raise exception 'Instrument not owned';
  end if;
  
  if v_current_level >= 10 then
    raise exception 'Instrument already at max level';
  end if;
  
  -- Calculate upgrade price based on current level
  v_upgrade_price := floor(v_upgrade_price * power(1.5, v_current_level - 1));
  
  -- Check balance
  v_current_balance := public.get_user_balance(p_user_id, 'golden_note_shards');
  
  if v_current_balance < v_upgrade_price then
    raise exception 'Insufficient balance. Required: %, Current: %', v_upgrade_price, v_current_balance;
  end if;
  
  -- Deduct currency
  perform public.add_currency_transaction(
    p_user_id,
    -v_upgrade_price,
    'purchase',
    p_instrument_id,
    'Upgraded instrument: ' || v_instrument_name || ' to level ' || (v_current_level + 1),
    jsonb_build_object('instrument_id', p_instrument_id, 'from_level', v_current_level, 'to_level', v_current_level + 1, 'price', v_upgrade_price),
    'golden_note_shards'
  );
  
  -- Upgrade instrument
  update public.user_instruments
  set level = level + 1
  where user_id = p_user_id and instrument_id = p_instrument_id;
end;
$$;

-- Function to tune instrument
create or replace function public.tune_instrument(
  p_user_id uuid,
  p_instrument_id text
)
returns void
language plpgsql
security definer
as $$
declare
  v_current_tuning integer;
  v_tune_price integer;
  v_current_balance integer;
  v_instrument_name text;
begin
  -- Get current tuning and instrument info
  select ui.tuning, i.tune_price, i.name
  into v_current_tuning, v_tune_price, v_instrument_name
  from public.user_instruments ui
  join public.instruments i on i.id = ui.instrument_id
  where ui.user_id = p_user_id and ui.instrument_id = p_instrument_id;
  
  if v_current_tuning is null then
    raise exception 'Instrument not owned';
  end if;
  
  if v_current_tuning >= 100 then
    raise exception 'Instrument already perfectly tuned';
  end if;
  
  -- Check balance
  v_current_balance := public.get_user_balance(p_user_id, 'golden_note_shards');
  
  if v_current_balance < v_tune_price then
    raise exception 'Insufficient balance. Required: %, Current: %', v_tune_price, v_current_balance;
  end if;
  
  -- Deduct currency
  perform public.add_currency_transaction(
    p_user_id,
    -v_tune_price,
    'purchase',
    p_instrument_id,
    'Tuned instrument: ' || v_instrument_name,
    jsonb_build_object('instrument_id', p_instrument_id, 'from_tuning', v_current_tuning, 'price', v_tune_price),
    'golden_note_shards'
  );
  
  -- Tune instrument (improve by 15 points, max 100)
  update public.user_instruments
  set tuning = least(100, tuning + 15)
  where user_id = p_user_id and instrument_id = p_instrument_id;
end;
$$;

-- Function to equip/unequip instrument
create or replace function public.toggle_instrument(
  p_user_id uuid,
  p_instrument_id text,
  p_equip boolean
)
returns void
language plpgsql
security definer
as $$
begin
  -- Check if user owns instrument
  if not exists (
    select 1 from public.user_instruments
    where user_id = p_user_id and instrument_id = p_instrument_id
  ) then
    raise exception 'Instrument not owned';
  end if;
  
  if p_equip then
    -- Unequip all other instruments first
    update public.user_instruments
    set is_equipped = false
    where user_id = p_user_id and instrument_id != p_instrument_id;
    
    -- Equip the selected instrument
    update public.user_instruments
    set is_equipped = true
    where user_id = p_user_id and instrument_id = p_instrument_id;
  else
    -- Unequip the instrument
    update public.user_instruments
    set is_equipped = false
    where user_id = p_user_id and instrument_id = p_instrument_id;
  end if;
end;
$$;

-- Function to initialize new user with starter instrument
create or replace function public.initialize_user_instrument(p_user_id uuid)
returns void
language plpgsql
security definer
as $$
declare
  v_preferred_instrument text;
  v_starter_instrument_id text;
  v_fallback_instrument_id constant text := 'violin-apprentice';
  v_base_tuning integer := 100;
begin
  select preferred_instrument
  into v_preferred_instrument
  from public.user_profiles
  where id = p_user_id;

  if v_preferred_instrument is null then
    v_preferred_instrument := 'violin';
  end if;

  v_starter_instrument_id := v_preferred_instrument || '-apprentice';

  if not exists (
    select 1 from public.instruments where id = v_starter_instrument_id
  ) then
    v_starter_instrument_id := v_fallback_instrument_id;
  end if;

  select base_tuning
  into v_base_tuning
  from public.instruments
  where id = v_starter_instrument_id;

  insert into public.user_instruments (user_id, instrument_id, level, tuning, is_equipped)
  values (p_user_id, v_starter_instrument_id, 1, coalesce(v_base_tuning, 100), true)
  on conflict (user_id, instrument_id) do nothing;
end;
$$;

-- Grant necessary permissions
grant usage on schema public to authenticated;
grant select on public.instruments to authenticated;
grant select, insert, update, delete on public.user_instruments to authenticated;
grant execute on function public.get_user_instruments(uuid) to authenticated;
grant execute on function public.purchase_instrument(uuid, text) to authenticated;
grant execute on function public.upgrade_instrument(uuid, text) to authenticated;
grant execute on function public.tune_instrument(uuid, text) to authenticated;
grant execute on function public.toggle_instrument(uuid, text, boolean) to authenticated;
grant execute on function public.initialize_user_instrument(uuid) to authenticated;

-- Add comments for documentation
comment on table public.instruments is 'Master list of all available musical instruments';
comment on table public.user_instruments is 'Tracks what instruments each user owns, their levels, tuning, and equipped status';
comment on function public.get_user_instruments(uuid) is 'Returns all instruments with user ownership and level data';
comment on function public.purchase_instrument(uuid, text) is 'Purchase instrument with currency validation';
comment on function public.upgrade_instrument(uuid, text) is 'Upgrade owned instrument with currency validation';
comment on function public.tune_instrument(uuid, text) is 'Tune owned instrument with currency validation';
comment on function public.toggle_instrument(uuid, text, boolean) is 'Equip or unequip instrument';
comment on function public.initialize_user_instrument(uuid) is 'Gives new users the starter instrument (Student Violin)';

