-- Equipment System Migration
-- This migration creates tables for equipment (mantles, adornments, instruments)
-- that players can buy, upgrade, and equip for bonuses

-- Create equipments table (master list of all equipment)
create table if not exists public.equipments (
  id text primary key,
  name text not null,
  category text not null, -- 'mantle', 'adornments', 'instruments'
  rarity text not null, -- 'common', 'rare', 'epic', 'legendary'
  instrument_type text,
  base_level integer not null default 1,
  base_score_bonus integer not null default 0,
  base_accuracy_bonus integer not null default 0,
  base_streak_bonus integer not null default 0,
  special_effect text,
  price integer not null, -- Cost in golden note shards
  upgrade_price integer not null, -- Cost to upgrade
  icon text not null,
  description text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create user_equipments table (tracks what users own and their levels)
create table if not exists public.user_equipments (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.user_profiles(id) on delete cascade not null,
  equipment_id text references public.equipments(id) on delete cascade not null,
  level integer not null default 1,
  is_equipped boolean not null default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, equipment_id)
);

-- Create indexes for faster queries
create index if not exists user_equipments_user_id_idx on public.user_equipments(user_id);
create index if not exists user_equipments_equipment_id_idx on public.user_equipments(equipment_id);
create index if not exists user_equipments_is_equipped_idx on public.user_equipments(is_equipped) where is_equipped = true;

-- Enable Row Level Security
alter table public.equipments enable row level security;
alter table public.user_equipments enable row level security;

-- RLS Policies for equipments (everyone can read)
drop policy if exists "Anyone can view equipments" on public.equipments;
create policy "Anyone can view equipments"
  on public.equipments for select
  to authenticated
  using (true);

-- RLS Policies for user_equipments
drop policy if exists "Users can view own equipment" on public.user_equipments;
create policy "Users can view own equipment"
  on public.user_equipments for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own equipment" on public.user_equipments;
create policy "Users can insert own equipment"
  on public.user_equipments for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own equipment" on public.user_equipments;
create policy "Users can update own equipment"
  on public.user_equipments for update
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Users can delete own equipment" on public.user_equipments;
create policy "Users can delete own equipment"
  on public.user_equipments for delete
  to authenticated
  using (auth.uid() = user_id);

-- Trigger for updated_at on equipments
drop trigger if exists handle_equipments_updated_at on public.equipments;
create trigger handle_equipments_updated_at
  before update on public.equipments
  for each row execute procedure public.handle_updated_at();

-- Trigger for updated_at on user_equipments
drop trigger if exists handle_user_equipments_updated_at on public.user_equipments;
create trigger handle_user_equipments_updated_at
  before update on public.user_equipments
  for each row execute procedure public.handle_updated_at();

-- Function to get equipment with user ownership data
create or replace function public.get_user_equipments(p_user_id uuid)
returns table (
  id text,
  name text,
  category text,
  rarity text,
  instrument_type text,
  level integer,
  score_bonus integer,
  accuracy_bonus integer,
  streak_bonus integer,
  special_effect text,
  price integer,
  upgrade_price integer,
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

  return query
  select
    e.id,
    e.name,
    e.category,
    e.rarity,
    e.instrument_type,
    coalesce(ue.level, e.base_level) as level,
    -- Calculate bonuses based on level (each level adds 25 score, 2 accuracy, 1 streak)
    e.base_score_bonus + (coalesce(ue.level, e.base_level) - 1) * 25 as score_bonus,
    e.base_accuracy_bonus + (coalesce(ue.level, e.base_level) - 1) * 2 as accuracy_bonus,
    e.base_streak_bonus + (coalesce(ue.level, e.base_level) - 1) * 1 as streak_bonus,
    e.special_effect,
    e.price,
    -- Upgrade price increases by 1.5x per level
    floor(e.upgrade_price * power(1.5, coalesce(ue.level, e.base_level) - 1))::integer as upgrade_price,
    e.icon,
    e.description,
    (ue.equipment_id is not null) as is_owned,
    coalesce(ue.is_equipped, false) as is_equipped
  from public.equipments e
  left join public.user_equipments ue
    on e.id = ue.equipment_id and ue.user_id = p_user_id
  where e.instrument_type is null or e.instrument_type = v_effective_type
  order by
    e.category,
    case e.rarity
      when 'common' then 1
      when 'rare' then 2
      when 'epic' then 3
      when 'legendary' then 4
    end,
    e.price;
end;
$$;

-- Function to purchase equipment
create or replace function public.purchase_equipment(
  p_user_id uuid,
  p_equipment_id text
)
returns uuid
language plpgsql
security definer
as $$
declare
  v_equipment_price integer;
  v_current_balance integer;
  v_user_equipment_id uuid;
begin
  -- Get equipment price
  select price into v_equipment_price
  from public.equipments
  where id = p_equipment_id;
  
  if v_equipment_price is null then
    raise exception 'Equipment not found';
  end if;
  
  -- Check if already owned
  if exists (
    select 1 from public.user_equipments
    where user_id = p_user_id and equipment_id = p_equipment_id
  ) then
    raise exception 'Equipment already owned';
  end if;
  
  -- Check balance
  v_current_balance := public.get_user_balance(p_user_id, 'golden_note_shards');
  
  if v_current_balance < v_equipment_price then
    raise exception 'Insufficient balance. Required: %, Current: %', v_equipment_price, v_current_balance;
  end if;
  
  -- Deduct currency
  perform public.add_currency_transaction(
    p_user_id,
    -v_equipment_price,
    'purchase',
    p_equipment_id,
    'Purchased equipment: ' || (select name from public.equipments where id = p_equipment_id),
    jsonb_build_object('equipment_id', p_equipment_id, 'price', v_equipment_price),
    'golden_note_shards'
  );
  
  -- Add equipment to user
  insert into public.user_equipments (user_id, equipment_id, level, is_equipped)
  values (p_user_id, p_equipment_id, 1, false)
  returning id into v_user_equipment_id;
  
  return v_user_equipment_id;
end;
$$;

-- Function to upgrade equipment
create or replace function public.upgrade_equipment(
  p_user_id uuid,
  p_equipment_id text
)
returns void
language plpgsql
security definer
as $$
declare
  v_current_level integer;
  v_upgrade_price integer;
  v_current_balance integer;
  v_equipment_name text;
begin
  -- Get current level and equipment info
  select ue.level, e.upgrade_price, e.name
  into v_current_level, v_upgrade_price, v_equipment_name
  from public.user_equipments ue
  join public.equipments e on e.id = ue.equipment_id
  where ue.user_id = p_user_id and ue.equipment_id = p_equipment_id;
  
  if v_current_level is null then
    raise exception 'Equipment not owned';
  end if;
  
  if v_current_level >= 10 then
    raise exception 'Equipment already at max level';
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
    p_equipment_id,
    'Upgraded equipment: ' || v_equipment_name || ' to level ' || (v_current_level + 1),
    jsonb_build_object('equipment_id', p_equipment_id, 'from_level', v_current_level, 'to_level', v_current_level + 1, 'price', v_upgrade_price),
    'golden_note_shards'
  );
  
  -- Upgrade equipment
  update public.user_equipments
  set level = level + 1
  where user_id = p_user_id and equipment_id = p_equipment_id;
end;
$$;

-- Function to equip/unequip equipment
create or replace function public.toggle_equipment(
  p_user_id uuid,
  p_equipment_id text,
  p_equip boolean
)
returns void
language plpgsql
security definer
as $$
declare
  v_category text;
begin
  -- Get equipment category
  select category into v_category
  from public.equipments
  where id = p_equipment_id;
  
  if v_category is null then
    raise exception 'Equipment not found';
  end if;
  
  -- Check if user owns equipment
  if not exists (
    select 1 from public.user_equipments
    where user_id = p_user_id and equipment_id = p_equipment_id
  ) then
    raise exception 'Equipment not owned';
  end if;
  
  if p_equip then
    -- For mantle and instruments: unequip others in same category first
    if v_category in ('mantle', 'instruments') then
      update public.user_equipments
      set is_equipped = false
      where user_id = p_user_id 
        and equipment_id in (
          select id from public.equipments where category = v_category
        )
        and equipment_id != p_equipment_id;
    end if;
    
    -- Equip the item
    update public.user_equipments
    set is_equipped = true
    where user_id = p_user_id and equipment_id = p_equipment_id;
  else
    -- Unequip the item
    update public.user_equipments
    set is_equipped = false
    where user_id = p_user_id and equipment_id = p_equipment_id;
  end if;
end;
$$;

-- Function to initialize new user with starter equipment
create or replace function public.initialize_user_equipment(p_user_id uuid)
returns void
language plpgsql
security definer
as $$
declare
  v_preferred_instrument text;
  v_effective_type text := 'violin';
  v_starter_equipment_id text;
begin
  select preferred_instrument
  into v_preferred_instrument
  from public.user_profiles
  where id = p_user_id;

  if v_preferred_instrument is not null then
    v_effective_type := v_preferred_instrument;
  end if;

  -- Always provide the universal mantle starter
  insert into public.user_equipments (user_id, equipment_id, level, is_equipped)
  values (p_user_id, 'novice-cloak', 1, true)
  on conflict (user_id, equipment_id) do nothing;

  v_starter_equipment_id := 'starter-' || v_effective_type || '-kit';

  if exists (
    select 1 from public.equipments where id = v_starter_equipment_id
  ) then
    insert into public.user_equipments (user_id, equipment_id, level, is_equipped)
    values (p_user_id, v_starter_equipment_id, 1, true)
    on conflict (user_id, equipment_id) do nothing;
  end if;
end;
$$;

-- Grant necessary permissions
grant usage on schema public to authenticated;
grant select on public.equipments to authenticated;
grant select, insert, update, delete on public.user_equipments to authenticated;
grant execute on function public.get_user_equipments(uuid) to authenticated;
grant execute on function public.purchase_equipment(uuid, text) to authenticated;
grant execute on function public.upgrade_equipment(uuid, text) to authenticated;
grant execute on function public.toggle_equipment(uuid, text, boolean) to authenticated;
grant execute on function public.initialize_user_equipment(uuid) to authenticated;

-- Add comments for documentation
comment on table public.equipments is 'Master list of all available equipment (mantles, adornments, instruments)';
comment on table public.user_equipments is 'Tracks what equipment each user owns, their levels, and what is equipped';
comment on function public.get_user_equipments(uuid) is 'Returns all equipment with user ownership and level data';
comment on function public.purchase_equipment(uuid, text) is 'Purchase equipment with currency validation';
comment on function public.upgrade_equipment(uuid, text) is 'Upgrade owned equipment with currency validation';
comment on function public.toggle_equipment(uuid, text, boolean) is 'Equip or unequip equipment (handles category logic)';
comment on function public.initialize_user_equipment(uuid) is 'Gives new users the starter equipment (novice cloak)';

