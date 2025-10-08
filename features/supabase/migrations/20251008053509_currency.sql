-- Currency Transaction System Migration
-- This migration creates a transaction-based currency system where:
-- - Every currency movement is recorded as a transaction
-- - Current balance is calculated as SUM of all transactions
-- - Balance can never go below 0

-- Create currency_transactions table
create table if not exists public.currency_transactions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.user_profiles(id) on delete cascade not null,
  currency_type text not null default 'golden_note_shards',
  amount integer not null, -- Can be positive (credit) or negative (debit)
  source text not null, -- e.g., 'challenge_reward', 'purchase', 'initial_balance', 'admin_adjustment'
  source_id text, -- Reference to the source (e.g., challenge_id)
  description text, -- Human-readable description
  metadata jsonb, -- Additional data (flexible for future use)
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create index for faster queries
create index if not exists currency_transactions_user_id_idx on public.currency_transactions(user_id);
create index if not exists currency_transactions_currency_type_idx on public.currency_transactions(currency_type);
create index if not exists currency_transactions_created_at_idx on public.currency_transactions(created_at desc);

-- Enable Row Level Security
alter table public.currency_transactions enable row level security;

-- RLS Policies for currency_transactions
create policy "Users can view own transactions"
  on public.currency_transactions for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert own transactions"
  on public.currency_transactions for insert
  to authenticated
  with check (auth.uid() = user_id);

-- Function to get current balance for a user
create or replace function public.get_user_balance(
  p_user_id uuid,
  p_currency_type text default 'golden_note_shards'
)
returns integer
language plpgsql
security definer
as $$
declare
  v_balance integer;
begin
  select coalesce(sum(amount), 0)
  into v_balance
  from public.currency_transactions
  where user_id = p_user_id
    and currency_type = p_currency_type;
  
  -- Ensure balance is never negative
  return greatest(v_balance, 0);
end;
$$;

-- Function to add a transaction (with balance validation)
create or replace function public.add_currency_transaction(
  p_user_id uuid,
  p_amount integer,
  p_source text,
  p_source_id text default null,
  p_description text default null,
  p_metadata jsonb default null,
  p_currency_type text default 'golden_note_shards'
)
returns uuid
language plpgsql
security definer
as $$
declare
  v_current_balance integer;
  v_new_transaction_id uuid;
begin
  -- Get current balance
  v_current_balance := public.get_user_balance(p_user_id, p_currency_type);
  
  -- If this is a debit (negative amount), check if user has enough balance
  if p_amount < 0 and v_current_balance + p_amount < 0 then
    raise exception 'Insufficient balance. Current: %, Attempted: %', v_current_balance, p_amount;
  end if;
  
  -- Insert transaction
  insert into public.currency_transactions (
    user_id,
    currency_type,
    amount,
    source,
    source_id,
    description,
    metadata
  )
  values (
    p_user_id,
    p_currency_type,
    p_amount,
    p_source,
    p_source_id,
    p_description,
    p_metadata
  )
  returning id into v_new_transaction_id;
  
  return v_new_transaction_id;
end;
$$;

-- Migrate existing golden_note_shards data to transactions
-- This creates initial balance transactions for users who already have shards
insert into public.currency_transactions (
  user_id,
  currency_type,
  amount,
  source,
  description
)
select 
  id,
  'golden_note_shards',
  golden_note_shards,
  'migration',
  'Initial balance from migration'
from public.user_profiles
where golden_note_shards > 0
on conflict do nothing;

-- Create a view for easy balance lookup
create or replace view public.user_balances as
select 
  user_id,
  currency_type,
  sum(amount) as balance,
  count(*) as transaction_count,
  max(created_at) as last_transaction_at
from public.currency_transactions
group by user_id, currency_type;

-- Optional: Create a materialized view for better performance (can be refreshed periodically)
-- Uncomment if you have many transactions and need faster queries
/*
create materialized view if not exists public.user_balances_materialized as
select 
  user_id,
  currency_type,
  sum(amount) as balance,
  count(*) as transaction_count,
  max(created_at) as last_transaction_at
from public.currency_transactions
group by user_id, currency_type;

create unique index on public.user_balances_materialized (user_id, currency_type);

-- Function to refresh the materialized view
create or replace function refresh_user_balances()
returns void
language plpgsql
as $$
begin
  refresh materialized view concurrently public.user_balances_materialized;
end;
$$;
*/

-- Grant necessary permissions
grant usage on schema public to authenticated;
grant select on public.currency_transactions to authenticated;
grant insert on public.currency_transactions to authenticated;
grant select on public.user_balances to authenticated;
grant execute on function public.get_user_balance(uuid, text) to authenticated;
grant execute on function public.add_currency_transaction(uuid, integer, text, text, text, jsonb, text) to authenticated;

-- Add comment for documentation
comment on table public.currency_transactions is 'Stores all currency transactions for audit trail. Current balance is calculated as SUM of amounts.';
comment on function public.get_user_balance(uuid, text) is 'Returns the current balance for a user, ensuring it is never negative.';
comment on function public.add_currency_transaction(uuid, integer, text, text, text, jsonb, text) is 'Adds a currency transaction with balance validation. Throws error if insufficient balance for debits.';

