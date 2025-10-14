-- Seed data for challenges
-- This file can be used to populate the challenges table with initial data

-- Clear existing challenges (optional - remove this line if you want to keep existing data)
-- truncate table challenges cascade;

-- Insert default challenges
insert into challenges (id, type, title, description, icon, requirement, reward, target_route)
values
  (
    'dominate-violin-notes',
    'dominate-notes',
    'Dominate Violin Notes',
    'Master the art of violin note recognition',
    '🎻',
    1,
    3,
    '/(tabs)/'
  ),
  (
    'score-master',
    'score-points',
    'Score Master',
    'Achieve 1,000 points in total gameplay',
    '🎯',
    1000,
    5,
    '/(tabs)/'
  ),
  (
    'battle-warrior',
    'battle-count',
    'Battle Warrior',
    'Complete 5 game battles',
    '⚔️',
    5,
    10,
    '/(tabs)/'
  )
on conflict (id) do update set
  type = excluded.type,
  title = excluded.title,
  description = excluded.description,
  icon = excluded.icon,
  requirement = excluded.requirement,
  reward = excluded.reward,
  target_route = excluded.target_route;

-- Additional challenges (commented out - uncomment to add more)
/*
insert into challenges (id, type, title, description, icon, requirement, reward, target_route)
values
  (
    'piano-prodigy',
    'dominate-notes',
    'Piano Prodigy',
    'Master piano note identification',
    '🎹',
    1,
    3,
    '/(tabs)/'
  ),
  (
    'perfect-streak',
    'score-points',
    'Perfect Streak',
    'Achieve a streak of 10 correct answers',
    '🔥',
    10,
    15,
    '/(tabs)/'
  ),
  (
    'speed-demon',
    'battle-count',
    'Speed Demon',
    'Complete 10 game battles in under 5 minutes',
    '⚡',
    10,
    20,
    '/(tabs)/'
  ),
  (
    'note-master',
    'score-points',
    'Note Master',
    'Achieve 10,000 points in total gameplay',
    '🎼',
    10000,
    50,
    '/(tabs)/'
  ),
  (
    'guitar-hero',
    'dominate-notes',
    'Guitar Hero',
    'Master guitar note recognition',
    '🎸',
    1,
    3,
    '/(tabs)/'
  )
on conflict (id) do update set
  type = excluded.type,
  title = excluded.title,
  description = excluded.description,
  icon = excluded.icon,
  requirement = excluded.requirement,
  reward = excluded.reward,
  target_route = excluded.target_route;
*/

