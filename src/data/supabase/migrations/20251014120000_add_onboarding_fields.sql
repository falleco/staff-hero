
-- Add onboarding fields to user_profiles
alter table public.user_profiles
  add column if not exists preferred_instrument text,
  add column if not exists skill_level text,
  add column if not exists onboarding_completed boolean default false;

update public.user_profiles
  set onboarding_completed = coalesce(onboarding_completed, false);
