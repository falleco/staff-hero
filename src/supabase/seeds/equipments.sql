-- Seed data for equipments
-- This file populates the equipments table with initial equipment

-- Insert default equipment
insert into equipments (
  id, 
  name, 
  category, 
  rarity, 
  base_level,
  base_score_bonus, 
  base_accuracy_bonus, 
  base_streak_bonus, 
  special_effect,
  price, 
  upgrade_price, 
  icon, 
  description
)
values
  -- MANTLES
  (
    'novice-cloak',
    'Novice Cloak',
    'mantle',
    'common',
    1,
    50,
    5,
    1,
    'Beginner''s Luck: +10% chance for bonus points',
    20,
    15,
    '🧙‍♂️',
    'A simple cloak worn by music students. Provides basic protection and confidence.'
  ),
  (
    'maestro-robe',
    'Maestro''s Robe',
    'mantle',
    'epic',
    1,
    200,
    15,
    5,
    'Conductor''s Aura: Double streak bonuses',
    80,
    40,
    '👘',
    'An elegant robe worn by master conductors. Radiates musical authority and precision.'
  ),

  -- ADORNMENTS
  (
    'silver-pendant',
    'Silver Music Note Pendant',
    'adornments',
    'rare',
    1,
    100,
    8,
    2,
    'Perfect Pitch: +5% accuracy on high notes',
    35,
    25,
    '🎵',
    'A beautiful silver pendant shaped like a musical note. Enhances musical intuition.'
  ),
  (
    'golden-metronome',
    'Golden Metronome Charm',
    'adornments',
    'legendary',
    1,
    300,
    20,
    8,
    'Perfect Timing: Time-based bonuses never expire',
    120,
    60,
    '⏱️',
    'A legendary golden metronome that keeps perfect time. Masters of rhythm covet this charm.'
  ),

  -- INSTRUMENTS
  (
    'enchanted-bow',
    'Enchanted Violin Bow',
    'instruments',
    'rare',
    1,
    150,
    12,
    3,
    'Smooth Strings: Violin notes give extra points',
    45,
    30,
    '🏹',
    'A mystical bow that makes violin strings sing with otherworldly beauty.'
  )
on conflict (id) do update set
  name = excluded.name,
  category = excluded.category,
  rarity = excluded.rarity,
  base_level = excluded.base_level,
  base_score_bonus = excluded.base_score_bonus,
  base_accuracy_bonus = excluded.base_accuracy_bonus,
  base_streak_bonus = excluded.base_streak_bonus,
  special_effect = excluded.special_effect,
  price = excluded.price,
  upgrade_price = excluded.upgrade_price,
  icon = excluded.icon,
  description = excluded.description;

