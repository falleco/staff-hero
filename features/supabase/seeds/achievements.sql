-- Seed data for achievements
-- This file populates the achievements table with default achievements

-- Insert default achievements
insert into achievements (
  id, 
  title, 
  description, 
  icon,
  unlock_condition
)
values
  (
    'first_game',
    'First Steps',
    'Complete your first game',
    '🎵',
    'Complete 1 game'
  ),
  (
    'streak_5',
    'Hot Streak',
    'Get a 5-note streak',
    '🔥',
    'Achieve a streak of 5'
  ),
  (
    'streak_10',
    'Blazing Notes',
    'Get a 10-note streak',
    '🔥🔥',
    'Achieve a streak of 10'
  ),
  (
    'perfect_game',
    'Perfect Pitch',
    'Complete a game with 100% accuracy',
    '⭐',
    'Complete a game with 100% accuracy'
  ),
  (
    'notation_master',
    'Notation Master',
    'Play games in both notation systems',
    '🎼',
    'Play games in both Letter and Solfege notation'
  ),
  (
    'dedicated_player',
    'Dedicated Player',
    'Play 50 games',
    '🏆',
    'Complete 50 games'
  )
on conflict (id) do update set
  title = excluded.title,
  description = excluded.description,
  icon = excluded.icon,
  unlock_condition = excluded.unlock_condition;

