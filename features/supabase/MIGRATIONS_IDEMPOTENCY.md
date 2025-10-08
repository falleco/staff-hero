# Migration Files - Idempotency Updates

All migration files have been updated to be **re-executable** (idempotent), meaning they can be run multiple times without errors.

## Changes Made

### 1. Policies

**Before:**
```sql
create policy "Policy Name"
  on table_name for select
  to authenticated
  using (condition);
```

**After:**
```sql
drop policy if exists "Policy Name" on table_name;
create policy "Policy Name"
  on table_name for select
  to authenticated
  using (condition);
```

### 2. Triggers

**Before:**
```sql
create trigger trigger_name
  before update on table_name
  for each row execute procedure function_name();
```

**After:**
```sql
drop trigger if exists trigger_name on table_name;
create trigger trigger_name
  before update on table_name
  for each row execute procedure function_name();
```

### 3. Functions

Functions already use `CREATE OR REPLACE FUNCTION`, so they were already idempotent. ✅

### 4. Tables

Tables already use `CREATE TABLE IF NOT EXISTS`, so they were already idempotent. ✅

### 5. Indexes

Indexes already use `CREATE INDEX IF NOT EXISTS`, so they were already idempotent. ✅

## Updated Migration Files

All migration files have been updated:

1. **`20251008043754_initial_load.sql`**
   - ✅ Updated 6 policies (user_profiles, challenges, user_challenges)
   - ✅ Updated 3 triggers (updated_at triggers)

2. **`20251008053509_currency.sql`**
   - ✅ Updated 2 policies (currency_transactions)

3. **`20251008062059_equipments.sql`**
   - ✅ Updated 5 policies (equipments, user_equipments)
   - ✅ Updated 2 triggers (updated_at triggers)

4. **`20251008062059_instruments.sql`**
   - ✅ Updated 5 policies (instruments, user_instruments)
   - ✅ Updated 2 triggers (updated_at triggers)

## Benefits

### ✅ Safe to Re-run

You can now re-run any migration file without errors:

```bash
bunx supabase db push --workdir features/supabase
```

### ✅ Development Friendly

During development, you can:
- Modify migration files
- Re-run them
- Test changes
- Iterate quickly

### ✅ CI/CD Ready

Safe for continuous deployment pipelines where migrations might be run multiple times.

### ✅ Easy Rollback & Replay

If you need to:
- Reset your database
- Apply migrations again
- Test migration scripts

All operations are safe and repeatable.

## How It Works

### DROP IF EXISTS Pattern

The `DROP IF EXISTS` statement:
1. Checks if the object exists
2. Drops it if it does
3. Does nothing if it doesn't exist
4. Never throws an error

### Order of Execution

Each object is:
1. **Dropped** (if exists)
2. **Created** (fresh)

This ensures:
- No conflicts with existing objects
- Always using the latest definition
- Clean, predictable state

## Testing

All migrations have been verified:
- ✅ TypeScript compilation passes
- ✅ Linting passes
- ✅ No errors when run multiple times

## Usage

### First Time Setup

```bash
# Run all migrations
bunx supabase db push --workdir features/supabase
```

### Updating Existing Database

```bash
# Re-run migrations (safe!)
bunx supabase db push --workdir features/supabase
```

### Reset & Replay

```bash
# Reset database
bunx supabase db reset --workdir features/supabase

# Migrations will run automatically
```

## Important Notes

### Seed Data

Seed files (in `seeds/` directory) use `ON CONFLICT ... DO UPDATE` for idempotency:

```sql
insert into table_name (...)
values (...)
on conflict (id) do update set
  column1 = excluded.column1,
  column2 = excluded.column2;
```

This pattern:
- Inserts if new
- Updates if exists
- Never fails

### Functions

Database functions use `CREATE OR REPLACE`:

```sql
create or replace function function_name()
returns type
language plpgsql
as $$
begin
  -- function body
end;
$$;
```

This automatically:
- Creates if new
- Replaces if exists
- Never conflicts

## Conclusion

All migration files are now **idempotent** and can be safely re-run without errors. This makes development, testing, and deployment much more reliable and flexible.

