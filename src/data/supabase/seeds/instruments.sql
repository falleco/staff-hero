-- Seed data for instruments
-- This file populates the instruments table with initial instruments

-- Insert default instruments
insert into instruments (
  id, 
  name, 
  type, 
  rarity, 
  base_level,
  base_score_multiplier,
  base_accuracy_bonus, 
  base_streak_bonus, 
  base_tuning,
  price, 
  upgrade_price, 
  tune_price,
  icon, 
  description
)
values
  -- Starter instrument (free)
  (
    'starter-violin',
    'Student Violin',
    'violin',
    'common',
    1,
    1.0,
    0,
    0,
    100,
    0, -- Free starter instrument
    15,
    2,
    '🎻',
    'A basic violin perfect for beginners. Reliable and easy to play.'
  ),
  
  -- Common instruments
  (
    'acoustic-guitar',
    'Acoustic Guitar',
    'guitar',
    'common',
    1,
    1.1,
    5,
    0,
    85,
    25,
    20,
    3,
    '🎸',
    'A versatile acoustic guitar with warm tones and good projection.'
  ),
  
  -- Rare instruments
  (
    'grand-piano',
    'Grand Piano',
    'piano',
    'rare',
    1,
    1.2,
    10,
    2,
    90,
    50,
    35,
    5,
    '🎹',
    'A majestic grand piano with rich harmonics and perfect resonance.'
  ),
  
  -- Epic instruments
  (
    'silver-flute',
    'Silver Flute',
    'flute',
    'epic',
    1,
    1.3,
    15,
    3,
    95,
    75,
    50,
    8,
    '🪈',
    'An elegant silver flute with crystal-clear tone and exceptional responsiveness.'
  )
on conflict (id) do update set
  name = excluded.name,
  type = excluded.type,
  rarity = excluded.rarity,
  base_level = excluded.base_level,
  base_score_multiplier = excluded.base_score_multiplier,
  base_accuracy_bonus = excluded.base_accuracy_bonus,
  base_streak_bonus = excluded.base_streak_bonus,
  base_tuning = excluded.base_tuning,
  price = excluded.price,
  upgrade_price = excluded.upgrade_price,
  tune_price = excluded.tune_price,
  icon = excluded.icon,
  description = excluded.description;

